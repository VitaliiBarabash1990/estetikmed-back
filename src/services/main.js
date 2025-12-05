// services/mainService.ts
import { MainCollection } from "../db/models/main.js";

export const createMainService = async (payload) => {
	const doc = await MainCollection.create(payload);
	return doc;
};

export const updateMainService = async (id, payload) => {
	const doc = await MainCollection.findByIdAndUpdate(id, payload, {
		new: true,
	});
	return doc;
};

// Всі документи
export const getAllMainService = async () => {
	const docs = await MainCollection.find();
	return docs;
};

// Один документ
export const getMainByIdService = async (id) => {
	const doc = await MainCollection.findById(id);
	return doc;
};

// Видалення
export const deleteMainService = async (id) => {
	await MainCollection.findByIdAndDelete(id);
	return true;
};
