import { model, Schema } from "mongoose";

const articlesSchema = new Schema(
	{
		pl: {
			title: { type: String, required: true },
			article: { type: String, required: false },
		},
		de: {
			title: { type: String, required: true },
			article: { type: String, required: false },
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

export const ArticlesCollection = model("articles", articlesSchema);
