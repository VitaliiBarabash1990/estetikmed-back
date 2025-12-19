import createHttpError from "http-errors";
import { env } from "../utils/env.js";
import { saveFileToUploadDir } from "../utils/saveFileToUploadDir.js";
import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js";
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js";
import { getCloudinaryPublicId } from "../utils/getCloudinaryPublicId.js";

import {
	createArticlesService,
	deleteArticlesService,
	getAllArticlesService,
	updateArticlesService,
	getArticleByIdService,
} from "../services/articles.js";

export const getArticlesController = async (req, res) => {
	const articles = await getAllArticlesService();

	res.json({
		status: 200,
		message: "Successfully found articles!",
		data: articles,
	});
};

// CREATE
export const createArticlesController = async (req, res, next) => {
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
				title: body.titlePl,
				article: body.articlePl,
			},
			de: {
				title: body.titleDe,
				article: body.articleDe,
			},
			img,
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

// PATCH
export const patchArticlesController = async (req, res, next) => {
	try {
		const { body, file, params } = req;

		const existing = await getArticleByIdService(params.id);
		if (!existing) {
			throw createHttpError(404, "Article not found");
		}

		let finalImg = existing.img;

		if (file) {
			// DELETE OLD IMAGE
			if (env("ENABLE_CLOUDINARY") === "true" && existing.img) {
				const publicId = getCloudinaryPublicId(existing.img);
				if (publicId) {
					await deleteFromCloudinary(publicId, "image");
				}
			}

			// SAVE NEW IMAGE
			finalImg =
				env("ENABLE_CLOUDINARY") === "true"
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

		res.json({
			status: 200,
			message: "Updated successfully",
			data: updated,
		});
	} catch (error) {
		next(error);
	}
};

// DELETE
export const deleteArticlesController = async (req, res, next) => {
	try {
		const { id } = req.params;

		const article = await getArticleByIdService(id);
		if (!article) {
			throw createHttpError(404, "Article not found");
		}

		if (env("ENABLE_CLOUDINARY") === "true" && article.img) {
			const publicId = getCloudinaryPublicId(article.img);
			if (publicId) {
				await deleteFromCloudinary(publicId, "image");
			}
		}

		await deleteArticlesService(id);

		res.status(204).send();
	} catch (error) {
		next(error);
	}
};
