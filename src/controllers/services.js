import createHttpError from "http-errors";
import { saveFileToUploadDir } from "../utils/saveFileToUploadDir.js";
import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js";
import { env } from "../utils/env.js";
import {
	createServicesService,
	deleteServicesService,
	getAllServicesService,
	getServicesByIdService,
	updateServices,
	updateServicesService,
} from "../services/services.js";
import { TEMPLATES_DIR } from "../constants/index.js";
import handlebars from "handlebars";
import path from "node:path";
import fs from "node:fs/promises";
import { sendEmail } from "../utils/sendMail.js";

export const getServicesController = async (req, res) => {
	const about = await getAllServicesService();

	res.json({
		status: 200,
		message: "Successfully found services!",
		data: about,
	});
};

export const getServicesByIdController = async (req, res) => {
	const { id } = req.params;
	const contact = await getServicesByIdService(id, req.user.id);

	if (!contact) {
		throw createHttpError(404, "Services not found");
	}

	res.json({
		status: 200,
		message: `Successfully found services with id ${id}!`,
		data: contact,
	});
};

// Створення
export const createServicesController = async (req, res, next) => {
	console.log("Data", req.body);
	try {
		const { body, files } = req;

		let imgPaths = [];

		if (files && files.length > 0) {
			if (env("ENABLE_CLOUDINARY") === "true") {
				imgPaths = await Promise.all(files.map(saveFileToCloudinary));
			} else {
				imgPaths = await Promise.all(files.map(saveFileToUploadDir));
			}
		}

		const payload = {
			pl: {
				name: body.namePl,
				description: body.descriptionPl,
			},
			de: {
				name: body.nameDe,
				description: body.descriptionDe,
			},
			price: body.price,
			type: body.type,
			imgs: imgPaths,
		};

		const doc = await createServicesService(payload);

		res.status(201).json({
			status: 201,
			message: "Created services successfully",
			data: doc,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteServicesController = async (req, res, next) => {
	const { id } = req.params;

	const contact = await deleteServicesService(id);

	if (!contact) {
		next(createHttpError(404, `Services not found`));
		return;
	}

	res.status(204).send();
};

export const upsertServicesController = async (req, res, next) => {
	const { id } = req.params;

	const result = await updateServices(id, req.user.id, req.body, {
		upsert: true,
	});

	if (!result) {
		next(createHttpError(404, `Services not found`));
		return;
	}

	const status = result.isNew ? 201 : 200;

	res.status(status).json({
		status,
		message: `Succsessfully upserted a services!`,
		data: result.student,
	});
};

export const patchhServicesController = async (req, res, next) => {
	const { id } = req.params;
	const update = req.body;
	console.log("UpdateData", update);

	const result = await updateServices(id, {
		...req.body,
	});

	if (!result) {
		next(createHttpError(404, `Services not found`));
		return;
	}

	res.json({
		status: 200,
		message: `Succsessfully patched a services!`,
		data: result.contact,
	});
};

export const patchServicesController = async (req, res, next) => {
	try {
		const { body, files = [], params } = req;

		// 1) existingImgs з фронта
		let existingImgs = [];

		try {
			existingImgs =
				typeof body.existingImgs === "string"
					? JSON.parse(body.existingImgs)
					: body.existingImgs;

			if (!Array.isArray(existingImgs)) existingImgs = [];
		} catch {
			existingImgs = [];
		}

		// 2) Зберігаємо нові файли
		const newFiles = [];

		for (const f of files) {
			const savedPath =
				process.env.ENABLE_CLOUDINARY === "true"
					? await saveFileToCloudinary(f)
					: await saveFileToUploadDir(f);

			newFiles.push(savedPath);
		}

		// 3) Формуємо фінальний масив
		// старі залишаються, нові додаються в кінець
		const finalImgs = [...existingImgs, ...newFiles];

		// 4) payload
		const payload = {
			pl: {
				name: body.namePl,
				description: body.descriptionPl,
			},
			de: {
				name: body.nameDe,
				description: body.descriptionDe,
			},
			price: Number(body.price),
			type: body.type,
			imgs: finalImgs,
		};

		const updated = await updateServicesService(params.id, payload);

		res.status(200).json({
			status: 200,
			message: "Updated successfully",
			data: updated,
		});
	} catch (error) {
		next(error);
	}
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
