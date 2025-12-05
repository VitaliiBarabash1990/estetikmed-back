import { model, Schema } from "mongoose";

const mainSchema = new Schema(
	{
		ua: {
			title: { type: String, required: true },
			subTitleOne: { type: String, required: false },
			subTitleTwo: { type: String, required: false },
		},
		en: {
			title: { type: String, required: true },
			subTitleOne: { type: String, required: false },
			subTitleTwo: { type: String, required: false },
		},
		pl: {
			title: { type: String, required: true },
			subTitleOne: { type: String, required: false },
			subTitleTwo: { type: String, required: false },
		},
		de: {
			title: { type: String, required: true },
			subTitleOne: { type: String, required: false },
			subTitleTwo: { type: String, required: false },
		},

		// Масив зображень (будь-яка кількість)
		img: {
			type: [String],
			required: false,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const MainCollection = model("mains", mainSchema);
