import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import { UsersCollection } from "../db/models/user.js";

import { FIFTEEN_MINUTES, ONE_DAY } from "../constants/index.js";
import { SessionsCollection } from "../db/models/session.js";

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
