import { model, Schema } from "mongoose";

const aboutSchema = new Schema(
	{
		ua: {
			title: { type: String, required: true },
			subTitle: { type: String, required: false },
		},
		en: {
			title: { type: String, required: true },
			subTitle: { type: String, required: false },
		},
		pl: {
			title: { type: String, required: true },
			subTitle: { type: String, required: false },
		},
		de: {
			title: { type: String, required: true },
			subTitle: { type: String, required: false },
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

export const AboutCollection = model("abouts", aboutSchema);
