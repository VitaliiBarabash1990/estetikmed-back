import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import { UsersCollection } from "../db/models/user.js";

import { FIFTEEN_MINUTES, ONE_DAY, TEMPLATES_DIR } from "../constants/index.js";
import { SessionsCollection } from "../db/models/session.js";
import { sendTelegramMessage, sendTelegramFile } from "../utils/telegram.js";
import { sendEmail } from "../utils/sendMail.js";
import handlebars from "handlebars";
import path from "node:path";
import fs from "node:fs/promises";
import { env } from "../utils/env.js";

export const adminLoginService = async (payload) => {
	const user = await UsersCollection.findOne({ email: payload.email });
	if (!user) throw createHttpError(404, "Admin not found");
	if (user.role !== "admin") throw createHttpError(403, "Forbidden");

	const isEqual = await bcrypt.compare(payload.password, user.password);
	if (!isEqual) throw createHttpError(401, "Unauthorized");

	await SessionsCollection.deleteOne({ userId: user._id });

	const accessToken = randomBytes(30).toString("base64");
	const refreshToken = randomBytes(30).toString("base64");

	const createdSession = await SessionsCollection.create({
		userId: user._id,
		accessToken,
		refreshToken,
		accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
		refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
	});

	return {
		user: user.user,
		email: user.email,
		role: user.role,
		accessToken: createdSession.accessToken,
		refreshToken: createdSession.refreshToken,
		sessionId: createdSession._id,
		userId: createdSession.userId,
		_id: createdSession._id,
	};
};

export const registerUser = async (payload) => {
	try {
		const existing = await UsersCollection.findOne({ email: payload.email });
		if (existing) throw createHttpError(409, "Email in use");

		const encryptedPassword = await bcrypt.hash(payload.password, 10);

		const termsBool = payload.terms === true || payload.terms === "true";

		const createdUser = await UsersCollection.create({
			...payload,
			password: encryptedPassword,
			consentGiven: termsBool,
			consentDate: termsBool ? new Date() : null,
			consentPolicyVersion: termsBool ? "1.0" : null,
		});

		const accessToken = randomBytes(30).toString("base64");
		const refreshToken = randomBytes(30).toString("base64");

		const session = await SessionsCollection.create({
			userId: createdUser._id,
			accessToken,
			refreshToken,
			accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
			refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
		});

		const result = {
			user: createdUser.name,
			email: createdUser.email,
			role: createdUser.role,
			accessToken: session.accessToken,
			userId: session.userId,
		};

		// return result;
		return { user: result, session };
	} catch (err) {
		console.error("Error in registerUser:", err);
		throw err;
	}
};

export const logoutUser = async (sessionId) => {
	await SessionsCollection.deleteOne({ _id: sessionId });
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
	const session = await SessionsCollection.findOne({
		_id: sessionId,
		refreshToken,
	});

	if (!session) {
		throw createHttpError(401, "Session not found");
	}

	const isSessionTokenExpired =
		new Date() > new Date(session.refreshTokenValidUntil);

	if (isSessionTokenExpired) {
		throw createHttpError(401, "Session token expired");
	}

	// Генеруємо нові токени (функція повинна повертати об'єкт з токенами і датами)
	const {
		accessToken,
		refreshToken: newRefreshToken,
		accessTokenValidUntil,
		refreshTokenValidUntil,
	} = createSession();

	// Оновлюємо існуючу сесію
	session.accessToken = accessToken;
	session.refreshToken = newRefreshToken;
	session.accessTokenValidUntil = accessTokenValidUntil;
	session.refreshTokenValidUntil = refreshTokenValidUntil;

	await session.save();

	return session;
};

export const createSession = () => {
	const accessToken = randomBytes(30).toString("base64");
	const refreshToken = randomBytes(30).toString("base64");

	return {
		accessToken,
		refreshToken,
		accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
		refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
	};
};

export const requestSendBody = async ({
	name,
	phone,
	email,
	message,
	file,
}) => {
	const templatePath = path.join(TEMPLATES_DIR, "order-confirmation.html");
	const templateSource = await fs.readFile(templatePath, "utf-8");
	const template = handlebars.compile(templateSource);

	const html = template({ name, phone, email, message });

	let attachments = [];

	let tempFilePath = null;

	if (file) {
		tempFilePath = file.path;

		const fileBuffer = await fs.readFile(tempFilePath);

		attachments.push({
			filename: file.originalname,
			content: fileBuffer,
			contentType: file.mimetype,
		});
	}

	try {
		await sendEmail({
			from: env("SMTP_FROM"),
			to: env("SMTP_FROM"),
			subject: "Новый заказ с сайта estetic-med!",
			html,
			attachments,
		});
	} finally {
		// Видаляємо файл у будь-якому випадку (успіх / помилка)
		if (tempFilePath) {
			try {
				await fs.unlink(tempFilePath);
				console.log("Temporary file removed:", tempFilePath);
			} catch (err) {
				console.warn("Failed to delete temp file:", err);
			}
		}
	}
};

export const requestSendTelegram = async ({
	name,
	phone,
	email,
	message,
	file,
}) => {
	let tempFilePath;

	try {
		// 1️⃣ Формуємо текст повідомлення
		let text = `<b>📨 Новый заказ с сайта estetic-med!</b>\n\n`;
		text += `👤 Клиент: ${name}\n`;
		text += `📞 Телефон: ${phone}\n`;
		text += `✉️ Email: ${email}\n\n`;
		text += `💬 Сообщение:\n${message}`;

		// 2️⃣ Надсилаємо текст
		await sendTelegramMessage(env("TELEGRAM_CHAT_ID"), text);

		// 3️⃣ Надсилаємо файл (якщо є)
		if (file) {
			tempFilePath = file.path;

			try {
				await sendTelegramFile(
					env("TELEGRAM_CHAT_ID"),
					tempFilePath,
					file.originalname
				);
			} catch (err) {
				console.error("❌ Помилка надсилання файлу в Telegram:", err);
				throw err;
			}
		}
	} finally {
		// 4️⃣ Завжди видаляємо тимчасовий файл
		if (tempFilePath) {
			try {
				await fs.unlink(tempFilePath);
				console.log("Temporary file removed:", tempFilePath);
			} catch (err) {
				console.warn("Failed to delete temp file:", tempFilePath, err);
			}
		}
	}
};
