import createHttpError from "http-errors";
import { env } from "../utils/env.js";
import { saveFileToUploadDir } from "../utils/saveFileToUploadDir.js";
import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js";
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js";
import {
	createReviewsService,
	deleteReviewsService,
	getAllReviewsService,
	updateReviewsService,
	getReviewsByIdService,
} from "../services/reviews.js";
import { getPublicIdFromUrl } from "../utils/getPublicIdFromUrl.js";

export const getReviewsController = async (req, res) => {
	const docs = await getAllReviewsService();

	res.json({
		status: 200,
		message: "Successfully found reviews!",
		data: docs,
	});
};

export const createReviewsController = async (req, res, next) => {
	try {
		const { body, file } = req;

		if (!file) {
			throw createHttpError(400, "Image is required");
		}

		const img =
			env("ENABLE_CLOUDINARY") === "true"
				? await saveFileToCloudinary(file)
				: await saveFileToUploadDir(file);

		const payload = {
			pl: {
				name: body.namePl,
				services: body.servicesPl,
				reviews: body.reviewsPl,
				answers: body.answersPl,
			},
			de: {
				name: body.nameDe,
				services: body.servicesDe,
				reviews: body.reviewsDe,
				answers: body.answersDe,
			},
			img,
		};

		const doc = await createReviewsService(payload);

		res.status(201).json({
			status: 201,
			message: "Created reviews successfully",
			data: doc,
		});
	} catch (error) {
		next(error);
	}
};

export const patchReviewsController = async (req, res, next) => {
	try {
		const { body, file, params } = req;

		const current = await getReviewsByIdService(params.id);
		if (!current) throw createHttpError(404, "Reviews not found");

		let finalImg = current.img;

		if (file) {
			if (env("ENABLE_CLOUDINARY") === "true" && current.img) {
				const publicId = getPublicIdFromUrl(current.img);
				if (publicId) {
					await deleteFromCloudinary(publicId, "image");
				}
			}

			finalImg =
				env("ENABLE_CLOUDINARY") === "true"
					? await saveFileToCloudinary(file)
					: await saveFileToUploadDir(file);
		}

		const payload = {
			pl: {
				name: body.namePl,
				services: body.servicesPl,
				reviews: body.reviewsPl,
				answers: body.answersPl,
			},
			de: {
				name: body.nameDe,
				services: body.servicesDe,
				reviews: body.reviewsDe,
				answers: body.answersDe,
			},
			img: finalImg,
		};

		const updated = await updateReviewsService(params.id, payload);

		res.json({
			status: 200,
			message: "Updated successfully",
			data: updated,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteReviewsController = async (req, res, next) => {
	try {
		const { id } = req.params;

		const doc = await getReviewsByIdService(id);
		if (!doc) throw createHttpError(404, "Reviews not found");

		if (env("ENABLE_CLOUDINARY") === "true" && doc.img) {
			const publicId = getPublicIdFromUrl(doc.img);
			if (publicId) {
				await deleteFromCloudinary(publicId, "image");
			}
		}

		await deleteReviewsService(id);

		res.status(204).send();
	} catch (error) {
		next(error);
	}
};
