// controllers/media.js
import createHttpError from "http-errors";
import { env } from "../utils/env.js";
import { saveFileToUploadDir } from "../utils/saveFileToUploadDir.js";
import { saveFileToCloudinaryModified } from "../utils/saveFileToCloudinaryModified.js";
import {
	getMediaByTypeService,
	addMediaToGalleryService,
	removeMediaByUrlsService,
	getAllMediaService,
} from "../services/media.js";
import { mapMediaToClient } from "../utils/mapMediaToClient.js";

export const getMediaController = async (req, res, next) => {
	try {
		const galleries = await getAllMediaService();
		res.json({
			status: 200,
			message: "Found galleries",
			data: galleries.map(mapMediaToClient),
		});
	} catch (err) {
		next(err);
	}
};

export const addMediaController = async (req, res, next) => {
	try {
		const { params, body, files } = req;
		const { type } = params;
		if (!type) throw createHttpError(400, "Type is required in params");

		let imgsFromBody = [];
		if (body.imgs) {
			try {
				const parsed =
					typeof body.imgs === "string" ? JSON.parse(body.imgs) : body.imgs;
				imgsFromBody = Array.isArray(parsed) ? parsed : [parsed];
			} catch {
				imgsFromBody = [body.imgs];
			}
		}

		const bodyItems = imgsFromBody.map((url) => ({
			url,
			publicId: null,
			resourceType: "image",
		}));

		let uploadedItems = [];
		if (files?.length) {
			uploadedItems =
				env("ENABLE_CLOUDINARY") === "true"
					? await Promise.all(files.map(saveFileToCloudinaryModified))
					: await Promise.all(files.map(saveFileToUploadDir));
		}

		const itemsToSave = [...bodyItems, ...uploadedItems];

		if (!itemsToSave.length) {
			const current = await getMediaByTypeService(type);
			return res.json({
				status: 200,
				message: "No new images provided",
				data: mapMediaToClient(current),
			});
		}

		const updated = await addMediaToGalleryService(type, itemsToSave);

		res.json({
			status: 200,
			message: "Images added",
			data: mapMediaToClient(updated),
		});
	} catch (err) {
		next(err);
	}
};

export const deleteMediaByUrlController = async (req, res, next) => {
	try {
		const { type } = req.params;
		let urls = [];

		if (req.query.url) urls = [req.query.url];
		else if (req.body.url) urls = [req.body.url];
		else if (req.body.urls) {
			try {
				urls =
					typeof req.body.urls === "string"
						? JSON.parse(req.body.urls)
						: req.body.urls;
			} catch {
				urls = Array.isArray(req.body.urls) ? req.body.urls : [req.body.urls];
			}
		}

		if (!urls.length)
			throw createHttpError(400, "Provide 'url' or 'urls' to delete");

		const updated = await removeMediaByUrlsService(type, urls);
		if (!updated) throw createHttpError(404, "Gallery not found");

		res.json({
			status: 200,
			message: "Images removed",
			data: mapMediaToClient(updated),
		});
	} catch (err) {
		next(err);
	}
};
