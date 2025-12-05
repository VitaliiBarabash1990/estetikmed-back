import createHttpError from "http-errors";
import { env } from "../utils/env.js";
import { saveFileToUploadDir } from "../utils/saveFileToUploadDir.js";
import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js";
import {
	getAllGalleryService,
	getGalleryByTypeService,
	createGalleryService,
	addImagesToGalleryService,
	removeImagesByUrlsService,
	removeImageByIndexService,
	deleteGalleryService,
} from "../services/gallery.js";

/* GET /gallery */
export const getGalleryController = async (req, res) => {
	const galleries = await getAllGalleryService();
	res.json({ status: 200, message: "Found galleries", data: galleries });
};

/* GET /gallery/:type */
export const getGalleryByTypeController = async (req, res) => {
	const { type } = req.params;
	const gallery = await getGalleryByTypeService(type);
	if (!gallery) throw createHttpError(404, "Gallery not found");
	res.json({ status: 200, message: `Found gallery '${type}'`, data: gallery });
};

/* POST /gallery
   Створити галерею (type + начальний набір imgs) — файли через multipart або URL-ами в body.imgs
*/
export const createGalleryController = async (req, res, next) => {
	try {
		const { body, files } = req;
		const type = body.type;
		if (!type) throw createHttpError(400, "Field 'type' is required");

		// imgs з тіла (можна передати JSON-строку або масив)
		let imgsFromBody = [];
		if (body.imgs) {
			try {
				imgsFromBody =
					typeof body.imgs === "string" ? JSON.parse(body.imgs) : body.imgs;
				if (!Array.isArray(imgsFromBody)) imgsFromBody = [imgsFromBody];
			} catch {
				imgsFromBody = [body.imgs];
			}
		}

		// файли (multipart)
		let imgPaths = [];
		if (files && files.length > 0) {
			imgPaths =
				env("ENABLE_CLOUDINARY") === "true"
					? await Promise.all(files.map(saveFileToCloudinary))
					: await Promise.all(files.map(saveFileToUploadDir));
		}

		const allImgs = [...imgsFromBody, ...imgPaths];
		const gallery = await createGalleryService({ type, imgs: allImgs });

		res
			.status(201)
			.json({ status: 201, message: "Gallery created", data: gallery });
	} catch (err) {
		next(err);
	}
};

/* PATCH /gallery/:type
   Додає нові зображення в існуючий (або створює, якщо немає).
   Підтримує:
     - files (multipart form, поле 'imgs') — 1 або багато файлів
     - body.imgs — масив URL-ів або одна URL-строка
*/
export const addImagesController = async (req, res, next) => {
	try {
		const { params, body, files } = req;
		const { type } = params;
		if (!type) throw createHttpError(400, "Type is required in params");

		// imgs з тіла (URL-и)
		let imgsFromBody = [];
		if (body.imgs) {
			try {
				imgsFromBody =
					typeof body.imgs === "string" ? JSON.parse(body.imgs) : body.imgs;
				if (!Array.isArray(imgsFromBody)) imgsFromBody = [imgsFromBody];
			} catch {
				imgsFromBody = [body.imgs];
			}
		}

		// збереження файлів (якщо є)
		let savedPaths = [];
		if (files && files.length > 0) {
			savedPaths =
				env("ENABLE_CLOUDINARY") === "true"
					? await Promise.all(files.map(saveFileToCloudinary))
					: await Promise.all(files.map(saveFileToUploadDir));
		}

		const newImgs = [...imgsFromBody, ...savedPaths];
		if (newImgs.length === 0) {
			// нічого додавати — повертаємо поточний документ
			const current = await getGalleryByTypeService(type);
			return res.json({
				status: 200,
				message: "No new images provided",
				data: current,
			});
		}

		const updated = await addImagesToGalleryService(type, newImgs);
		res.json({ status: 200, message: "Images added", data: updated });
	} catch (err) {
		next(err);
	}
};

/* DELETE /gallery/:type/image
   Видаляє одне або кілька зображень по URL. 
   Підтримує:
     - query: ?url=<encodedUrl>
     - body: { url: "..." } або { urls: ["...","..."] }
*/
export const deleteImageByUrlController = async (req, res, next) => {
	try {
		const { type } = req.params;
		let urls = [];

		if (req.query.url) {
			urls = [req.query.url];
		} else if (req.body.url) {
			urls = [req.body.url];
		} else if (req.body.urls) {
			try {
				urls =
					typeof req.body.urls === "string"
						? JSON.parse(req.body.urls)
						: req.body.urls;
			} catch {
				urls = Array.isArray(req.body.urls) ? req.body.urls : [req.body.urls];
			}
		}

		if (!urls || urls.length === 0) {
			throw createHttpError(400, "Provide 'url' or 'urls' to delete");
		}

		const updated = await removeImagesByUrlsService(type, urls);
		if (!updated) throw createHttpError(404, "Gallery not found");

		// Примітка: тут НЕ видаляються файли з Cloudinary/диску. Якщо потрібно — дописати видалення по public_id.
		res.json({ status: 200, message: "Images removed", data: updated });
	} catch (err) {
		next(err);
	}
};

/* DELETE /gallery/:type/:index
   Видалити зображення за індексом в масиві imgs (підходить коли на фронті знаєш позицію).
*/
export const deleteImageByIndexController = async (req, res, next) => {
	try {
		const { type, index } = req.params;
		const idx = Number(index);
		if (Number.isNaN(idx)) throw createHttpError(400, "Index must be a number");

		const updated = await removeImageByIndexService(type, idx);
		if (!updated) {
			throw createHttpError(404, "Gallery not found or index out of range");
		}

		res.json({ status: 200, message: "Image removed by index", data: updated });
	} catch (err) {
		next(err);
	}
};

/* DELETE /gallery/:type
   Видалити всю галерею типу (старий endpoint)
*/
export const deleteGalleryController = async (req, res, next) => {
	try {
		const { type } = req.params;
		const doc = await deleteGalleryService(type);
		if (!doc) return next(createHttpError(404, "Gallery not found"));
		res.status(204).send();
	} catch (err) {
		next(err);
	}
};
