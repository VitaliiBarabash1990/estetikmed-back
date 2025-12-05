// services/mainService.ts
import { AboutCollection } from "../db/models/about.js";

export const createAboutService = async (payload) => {
	const doc = await AboutCollection.create(payload);
	return doc;
};

export const updateAboutService = async (id, payload) => {
	const doc = await AboutCollection.findByIdAndUpdate(id, payload, {
		new: true,
	});
	return doc;
};

// Всі документи
export const getAllAboutService = async () => {
	const docs = await AboutCollection.find();
	return docs;
};

// Один документ
export const getAboutByIdService = async (id) => {
	const doc = await AboutCollection.findById(id);
	return doc;
};

// Видалення
export const deleteAboutService = async (id) => {
	await AboutCollection.findByIdAndDelete(id);
	return true;
};
