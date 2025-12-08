import createHttpError from "http-errors";
import { env } from "../utils/env.js";
import { saveFileToUploadDir } from "../utils/saveFileToUploadDir.js";
import {
	getMediaByTypeService,
	addMediaToGalleryService,
	removeMediaByUrlsService,
	getAllMediaService,
} from "../services/media.js";
import { saveFileToCloudinaryModified } from "../utils/saveFileToCloudinaryModified.js";

/* GET /gallery */
export const getMediaController = async (req, res) => {
	const galleries = await getAllMediaService();
	res.json({ status: 200, message: "Found galleries", data: galleries });
};

/* PATCH /gallery/:type
   Додає нові зображення в існуючий (або створює, якщо немає).
   Підтримує:
     - files (multipart form, поле 'imgs') — 1 або багато файлів
     - body.imgs — масив URL-ів або одна URL-строка
*/
export const addMediaController = async (req, res, next) => {
	console.log("DataUploadFiles", req.files);
	console.log("DataUploadImgs", req.imgs);
	console.log("DataUpload", req);
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
					? await Promise.all(files.map(saveFileToCloudinaryModified))
					: await Promise.all(files.map(saveFileToUploadDir));
		}

		const newImgs = [...imgsFromBody, ...savedPaths];
		if (newImgs.length === 0) {
			// нічого додавати — повертаємо поточний документ
			const current = await getMediaByTypeService(type);
			return res.json({
				status: 200,
				message: "No new images provided",
				data: current,
			});
		}

		const updated = await addMediaToGalleryService(type, newImgs);
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
export const deleteMediaByUrlController = async (req, res, next) => {
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

		const updated = await removeMediaByUrlsService(type, urls);
		if (!updated) throw createHttpError(404, "Gallery not found");

		// Примітка: тут НЕ видаляються файли з Cloudinary/диску. Якщо потрібно — дописати видалення по public_id.
		res.json({ status: 200, message: "Images removed", data: updated });
	} catch (err) {
		next(err);
	}
};
