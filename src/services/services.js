// services/mainService.ts

import { ServicesCollection } from "../db/models/services.js";

export const createServicesService = async (payload) => {
	const doc = await ServicesCollection.create(payload);
	return doc;
};

export const updateServicesService = async (id, payload) => {
	const doc = await ServicesCollection.findByIdAndUpdate(id, payload, {
		new: true,
	});
	return doc;
};

// Всі документи
export const getAllServicesService = async () => {
	const docs = await ServicesCollection.find();
	return docs;
};

// Один документ
export const getServicesByIdService = async (id) => {
	const doc = await ServicesCollection.findById(id);
	return doc;
};

// Видалення
export const deleteServicesService = async (id) => {
	await ServicesCollection.findByIdAndDelete(id);
	return true;
};

export const updateServices = async (payload) => {
	const { id, ...item } = payload;

	const updatedCategory = await ServicesCollection.findByIdAndUpdate(
		id,
		{ ...item },
		{ new: true } // Повертає оновлений документ
	);

	return updatedCategory;
};
