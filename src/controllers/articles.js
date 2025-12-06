import createHttpError from "http-errors";
import { saveFileToUploadDir } from "../utils/saveFileToUploadDir.js";
import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js";
import { env } from "../utils/env.js";
import {
	createArticlesService,
	deleteArticlesService,
	getAllArticlesService,
	updateArticlesService,
} from "../services/articles.js";

export const getArticlesController = async (req, res) => {
	const about = await getAllArticlesService();

	res.json({
		status: 200,
		message: "Successfully found articles!",
		data: about,
	});
};

// Створення
export const createArticlesController = async (req, res, next) => {
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
				title: body.titlePl,
				article: body.articlePl,
			},
			de: {
				title: body.titleDe,
				article: body.articleDe,
			},
			img: imgUrl,
		};

		const doc = await createArticlesService(payload);

		res.status(201).json({
			status: 201,
			message: "Created article successfully",
			data: doc,
		});
	} catch (error) {
		next(error);
	}
};

export const patchArticlesController = async (req, res, next) => {
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
				title: body.titlePl,
				article: body.articlePl,
			},
			de: {
				title: body.titleDe,
				article: body.articleDe,
			},
			img: finalImg,
		};

		const updated = await updateArticlesService(params.id, payload);

		res.status(200).json({
			status: 200,
			message: "Updated successfully",
			data: updated,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteArticlesController = async (req, res, next) => {
	const { id } = req.params;

	const article = await deleteArticlesService(id);

	if (!article) {
		next(createHttpError(404, `Article not found`));
		return;
	}

	res.status(204).send();
};
