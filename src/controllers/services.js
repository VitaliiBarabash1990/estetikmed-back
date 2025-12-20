import createHttpError from "http-errors";
import { env } from "../utils/env.js";
import { saveFileToUploadDir } from "../utils/saveFileToUploadDir.js";
import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js";
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js";
import { getPublicIdFromUrl } from "../utils/getPublicIdFromUrl.js";
import {
	createServicesService,
	deleteServicesService,
	getAllServicesService,
	getServicesByIdService,
	updateServicesService,
} from "../services/services.js";

export const getServicesController = async (req, res) => {
	const docs = await getAllServicesService();

	res.json({
		status: 200,
		message: "Successfully found services!",
		data: docs,
	});
};

export const getServicesByIdController = async (req, res) => {
	const { id } = req.params;

	const doc = await getServicesByIdService(id);
	if (!doc) throw createHttpError(404, "Services not found");

	res.json({
		status: 200,
		message: "Successfully found service",
		data: doc,
	});
};

export const createServicesController = async (req, res, next) => {
	try {
		const { body, files = [] } = req;

		const imgs =
			env("ENABLE_CLOUDINARY") === "true"
				? await Promise.all(files.map(saveFileToCloudinary))
				: await Promise.all(files.map(saveFileToUploadDir));

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
			imgs,
		};

		const doc = await createServicesService(payload);

		res.status(201).json({
			status: 201,
			message: "Created services successfully",
			data: doc,
		});
	} catch (err) {
		next(err);
	}
};

export const patchServicesController = async (req, res, next) => {
	console.log("BODY:", req.body);
	console.log("FILES:", req.files);
	try {
		const { body, files = [], params } = req;

		const current = await getServicesByIdService(params.id);
		if (!current) throw createHttpError(404, "Services not found");

		// 1️⃣ картинки, які залишили з фронта
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

		// 2️⃣ видалення з Cloudinary
		if (env("ENABLE_CLOUDINARY") === "true") {
			const removed = current.imgs.filter((img) => !existingImgs.includes(img));

			await Promise.all(
				removed.map((url) => {
					const publicId = getPublicIdFromUrl(url);
					return publicId ? deleteFromCloudinary(publicId, "image") : null;
				})
			);
		}

		// 3️⃣ нові файли
		const newImgs =
			env("ENABLE_CLOUDINARY") === "true"
				? await Promise.all(files.map(saveFileToCloudinary))
				: await Promise.all(files.map(saveFileToUploadDir));

		// 4️⃣ payload БЕЗ undefined
		const payload = {
			pl: {
				name: body.namePl ?? current.pl.name,
				description: body.descriptionPl ?? current.pl.description,
			},
			de: {
				name: body.nameDe ?? current.de.name,
				description: body.descriptionDe ?? current.de.description,
			},
			price: body.price !== undefined ? Number(body.price) : current.price,
			type: body.type ?? current.type,
			imgs: [...existingImgs, ...newImgs],
		};

		const updated = await updateServicesService(params.id, payload);

		res.json({
			status: 200,
			message: "Updated successfully",
			data: updated,
		});
	} catch (err) {
		next(err);
	}
};

export const upsertServicesController = async (req, res, next) => {
	try {
		const updated = await updateServicesService(req.params.id, req.body);

		if (!updated) throw createHttpError(404, "Services not found");

		res.json({
			status: 200,
			message: "Successfully upserted service",
			data: updated,
		});
	} catch (err) {
		next(err);
	}
};

export const deleteServicesController = async (req, res, next) => {
	try {
		const doc = await getServicesByIdService(req.params.id);
		if (!doc) throw createHttpError(404, "Services not found");

		if (env("ENABLE_CLOUDINARY") === "true") {
			await Promise.all(
				doc.imgs.map((url) => {
					const publicId = getPublicIdFromUrl(url);
					return publicId ? deleteFromCloudinary(publicId, "image") : null;
				})
			);
		}

		await deleteServicesService(req.params.id);

		res.status(204).send();
	} catch (err) {
		next(err);
	}
};
