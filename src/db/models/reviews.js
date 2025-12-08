import { model, Schema } from "mongoose";

const reviewsSchema = new Schema(
	{
		pl: {
			name: { type: String, required: true },
			services: { type: String, required: true },
			reviews: { type: String, required: true },
			answers: { type: String, required: true },
		},
		de: {
			name: { type: String, required: true },
			services: { type: String, required: true },
			reviews: { type: String, required: true },
			answers: { type: String, required: true },
		},

		// Зображеня
		img: {
			type: String,
			required: false,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const ReviewsCollection = model("reviews", reviewsSchema);
