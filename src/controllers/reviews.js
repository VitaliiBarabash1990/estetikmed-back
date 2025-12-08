import createHttpError from "http-errors";
import { saveFileToUploadDir } from "../utils/saveFileToUploadDir.js";
import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js";
import { env } from "../utils/env.js";
import {
	createReviewsService,
	deleteReviewsService,
	getAllReviewsService,
	updateReviewsService,
} from "../services/reviews.js";

export const getReviewsController = async (req, res) => {
	const about = await getAllReviewsService();

	res.json({
		status: 200,
		message: "Successfully found reviews!",
		data: about,
	});
};

// Створення
export const createReviewsController = async (req, res, next) => {
	console.log("Data", req.body);
	try {
		const { body, file } = req;

		if (!file) {
			throw createHttpError(400, "Image is required");
		}

		let imgUrl;

		if (file) {
			if (env("ENABLE_CLOUDINARY") === "true") {
				imgUrl = await saveFileToCloudinary(file);
			} else {
				imgUrl = await saveFileToUploadDir(file);
			}
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
			img: imgUrl,
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

		let finalImg = body.img; // це або string (URL), або новий файл буде в req.file

		// Якщо прийшов новий файл — зберігти
		if (file) {
			finalImg =
				process.env.ENABLE_CLOUDINARY === "true"
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

		res.status(200).json({
			status: 200,
			message: "Updated successfully",
			data: updated,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteReviewsController = async (req, res, next) => {
	const { id } = req.params;

	const article = await deleteReviewsService(id);

	if (!article) {
		next(createHttpError(404, `Reviews not found`));
		return;
	}

	res.status(204).send();
};
