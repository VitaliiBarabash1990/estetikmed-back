import { model, Schema } from "mongoose";

const servicesSchema = new Schema(
	{
		pl: {
			name: { type: String, required: true },
			description: { type: String, required: false },
		},
		de: {
			name: { type: String, required: true },
			description: { type: String, required: false },
		},

		price: { type: Number, required: true },

		type: { type: String, required: true },

		// Зображеня
		imgs: {
			type: [String],
			required: false,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const ServicesCollection = model("services", servicesSchema);
