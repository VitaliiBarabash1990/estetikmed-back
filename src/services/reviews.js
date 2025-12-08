// services/mainService.ts

import { ReviewsCollection } from "../db/models/reviews.js";

// Всі документи
export const getAllReviewsService = async () => {
	const docs = await ReviewsCollection.find();
	return docs;
};

export const createReviewsService = async (payload) => {
	const doc = await ReviewsCollection.create(payload);
	return doc;
};

export const updateReviewsService = async (id, payload) => {
	const doc = await ReviewsCollection.findByIdAndUpdate(id, payload, {
		new: true,
	});
	return doc;
};

// Видалення
export const deleteReviewsService = async (id) => {
	await ReviewsCollection.findByIdAndDelete(id);
	return true;
};
