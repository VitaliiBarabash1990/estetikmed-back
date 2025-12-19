import { ReviewsCollection } from "../db/models/reviews.js";

export const getAllReviewsService = async () => {
	return ReviewsCollection.find();
};

export const getReviewsByIdService = async (id) => {
	return ReviewsCollection.findById(id);
};

export const createReviewsService = async (payload) => {
	return ReviewsCollection.create(payload);
};

export const updateReviewsService = async (id, payload) => {
	return ReviewsCollection.findByIdAndUpdate(id, payload, {
		new: true,
	});
};

export const deleteReviewsService = async (id) => {
	return ReviewsCollection.findByIdAndDelete(id);
};
