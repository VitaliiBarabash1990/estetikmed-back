import createHttpError from "http-errors";
import { getContactById } from "../services/contacts.js";
import { saveFileToUploadDir } from "../utils/saveFileToUploadDir.js";
import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js";
import { env } from "../utils/env.js";
import {
	createAboutService,
	deleteAboutService,
	getAllAboutService,
	updateAboutService,
} from "../services/about.js";
import { AboutCollection } from "../db/models/about.js";

export const getAboutController = async (req, res) => {
	const about = await getAllAboutService();

	res.json({
		status: 200,
		message: "Successfully found about!",
		data: about,
	});
};

export const getAboutByIdController = async (req, res) => {
	const { contactId } = req.params;
	const contact = await getContactById(contactId, req.user.id);

	if (!contact) {
		throw createHttpError(404, "About not found");
	}

	res.json({
		status: 200,
		message: `Successfully found about with id ${contactId}!`,
		data: contact,
	});
};

// Створення
export const createAboutController = async (req, res, next) => {
	console.log("Data", req.body);
	try {
		const { body, file } = req;

		let imgPath = null;

		if (file) {
			if (env("ENABLE_CLOUDINARY") === "true") {
				imgPath = await saveFileToCloudinary(file);
			} else {
				imgPath = await saveFileToUploadDir(file);
			}
		}

		const payload = {
			ua: {
				title: body.titleUa,
				subTitle: body.subTitleUa,
			},
			en: {
				title: body.titleEn,
				subTitle: body.subTitleEn,
			},
			pl: {
				title: body.titlePl,
				subTitle: body.subTitlePl,
			},
			de: {
				title: body.titleDe,
				subTitle: body.subTitleDe,
			},
			img: imgPath,
		};

		const doc = await createAboutService(payload);

		res
			.status(201)
			.json({ status: 201, message: "Created successfully", data: doc });
	} catch (error) {
		next(error);
	}
};

export const deleteAboutController = async (req, res, next) => {
	const { id } = req.params;

	const contact = await deleteAboutService(id);

	if (!contact) {
		next(createHttpError(404, `About not found`));
		return;
	}

	res.status(204).send();
};

export const upsertAboutController = async (req, res, next) => {
	const { contactId } = req.params;

	const result = await updateAbout(contactId, req.user.id, req.body, {
		upsert: true,
	});

	if (!result) {
		next(createHttpError(404, `About not found`));
		return;
	}

	const status = result.isNew ? 201 : 200;

	res.status(status).json({
		status,
		message: `Succsessfully upserted a about!`,
		data: result.student,
	});
};

export const patchhAboutController = async (req, res, next) => {
	const { id } = req.params;
	const update = req.body;
	console.log("UpdateData", update);

	const result = await updateAbout(id, {
		...req.body,
	});

	if (!result) {
		next(createHttpError(404, `About not found`));
		return;
	}

	res.json({
		status: 200,
		message: `Succsessfully patched a about!`,
		data: result.contact,
	});
};

// Оновлення
export const patchAboutController = async (req, res, next) => {
	console.log("Data", req.body);
	try {
		const { body, params } = req;

		// 1) Поточний документ з DB
		const currentDoc = await AboutCollection.findById(params.id).lean();
		if (!currentDoc) return res.status(404).json({ message: "Not found" });

		let finalImg = currentDoc.img || null;

		// 2) Якщо клієнт передав existingImg і він співпадає з тим, що в БД → нічого не міняємо
		if (body.existingImg && body.existingImg === finalImg) {
			// залишаємо старе зображення
		} else if (req.file) {
			// 3) Якщо прийшов новий файл → зберігаємо і оновлюємо
			let savedPath;
			if (env("ENABLE_CLOUDINARY") === "true") {
				savedPath = await saveFileToCloudinary(req.file);
			} else {
				savedPath = await saveFileToUploadDir(req.file);
			}

			// Якщо новий шлях відрізняється від того, що вже є → оновлюємо
			if (savedPath !== finalImg) {
				finalImg = savedPath;
			}
		}

		// 4) Формуємо payload
		const payload = {
			ua: {
				title: body.titleUa !== undefined ? body.titleUa : currentDoc.ua.title,
				subTitle:
					body.subTitleUa !== undefined
						? body.subTitleUa
						: currentDoc.ua.subTitle,
			},
			en: {
				title: body.titleEn !== undefined ? body.titleEn : currentDoc.en.title,
				subTitle:
					body.subTitleEn !== undefined
						? body.subTitleEn
						: currentDoc.en.subTitle,
			},
			pl: {
				title: body.titlePl !== undefined ? body.titlePl : currentDoc.pl.title,
				subTitle:
					body.subTitlePl !== undefined
						? body.subTitlePl
						: currentDoc.pl.subTitle,
			},
			de: {
				title: body.titleDe !== undefined ? body.titleDe : currentDoc.de.title,
				subTitle:
					body.subTitleDe !== undefined
						? body.subTitleDe
						: currentDoc.de.subTitle,
			},
			img: finalImg,
		};

		const doc = await updateAboutService(params.id, payload);

		res.status(200).json({
			status: 200,
			message: "Updated successfully",
			data: doc,
		});
	} catch (error) {
		next(error);
	}
};
