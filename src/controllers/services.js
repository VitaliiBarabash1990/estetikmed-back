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
		let existingFromBody = [];
		if (body.existingImgs) {
			try {
				existingFromBody =
					typeof body.existingImgs === "string"
						? JSON.parse(body.existingImgs)
						: body.existingImgs;
				if (!Array.isArray(existingFromBody)) existingFromBody = [];
			} catch {
				existingFromBody = [];
			}
		}

		// 2) Зберігаємо нові файли
		const savedPaths = [];
		for (const f of files) {
			const path =
				process.env.ENABLE_CLOUDINARY === "true"
					? await saveFileToCloudinary(f)
					: await saveFileToUploadDir(f);
			savedPaths.push(path);
		}

		// 3) Формуємо фінальний масив за позиціями
		const MAX_IMAGES = 4;
		const finalImgs = [];
		let newFileIndex = 0;

		for (
			let i = 0;
			i < existingFromBody.length && finalImgs.length < MAX_IMAGES;
			i++
		) {
			if (existingFromBody[i]) {
				finalImgs.push(existingFromBody[i]);
			} else if (savedPaths[newFileIndex]) {
				finalImgs.push(savedPaths[newFileIndex]);
				newFileIndex++;
			} else {
				finalImgs.push(null); // якщо нічого немає
			}
		}

		// додаємо лишні нові файли, якщо вони залишились
		while (newFileIndex < savedPaths.length && finalImgs.length < MAX_IMAGES) {
			finalImgs.push(savedPaths[newFileIndex]);
			newFileIndex++;
		}

		// 4) Payload для оновлення
		const payload = {
			ua: {
				title: body.titleUa,
				subTitle: body.subTitleUa,
				article: body.articleUa,
			},
			en: {
				title: body.titleEn,
				subTitle: body.subTitleEn,
				article: body.articleEn,
			},
			pl: {
				title: body.titlePl,
				subTitle: body.subTitlePl,
				article: body.articlePl,
			},
			de: {
				title: body.titleDe,
				subTitle: body.subTitleDe,
				article: body.articleDe,
			},
			type: body.type,
			imgs: finalImgs,
		};

		const doc = await updateServicesService(params.id, payload);

		res.status(200).json({
			status: 200,
			message: "Updated services successfully",
			data: doc,
		});
	} catch (error) {
		next(error);
	}
};

export const requestSendBody = async ({ name, phone }) => {
	const templatePath = path.join(TEMPLATES_DIR, "order-confirmation.html");

	const templateSource = (await fs.readFile(templatePath)).toString();

	const template = handlebars.compile(templateSource);
	const html = template({
		name: name,
		phone: phone,
	});

	await sendEmail({
		from: env("SMTP_FROM"),
		to: env("SMTP_FROM"),
		subject: "Ваш новый клиент!",
		html,
	});
};
