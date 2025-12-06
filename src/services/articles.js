// services/mainService.ts

import { ArticlesCollection } from "../db/models/articles.js";

// Всі документи
export const getAllArticlesService = async () => {
	const docs = await ArticlesCollection.find();
	return docs;
};

export const createArticlesService = async (payload) => {
	const doc = await ArticlesCollection.create(payload);
	return doc;
};

export const updateArticlesService = async (id, payload) => {
	const doc = await ArticlesCollection.findByIdAndUpdate(id, payload, {
		new: true,
	});
	return doc;
};

// Видалення
export const deleteArticlesService = async (id) => {
	await ArticlesCollection.findByIdAndDelete(id);
	return true;
};
