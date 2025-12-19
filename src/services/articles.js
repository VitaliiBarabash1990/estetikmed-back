import { ArticlesCollection } from "../db/models/articles.js";

export const getAllArticlesService = async () => {
	return ArticlesCollection.find();
};

export const getArticleByIdService = async (id) => {
	return ArticlesCollection.findById(id);
};

export const createArticlesService = async (payload) => {
	return ArticlesCollection.create(payload);
};

export const updateArticlesService = async (id, payload) => {
	return ArticlesCollection.findByIdAndUpdate(id, payload, {
		new: true,
	});
};

export const deleteArticlesService = async (id) => {
	return ArticlesCollection.findByIdAndDelete(id);
};
