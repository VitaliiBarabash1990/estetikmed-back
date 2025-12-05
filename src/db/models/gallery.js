import { Schema, model } from "mongoose";

const gallerySchema = new Schema(
	{
		type: { type: String, required: true, unique: true },
		imgs: { type: [String], default: [] },
	},
	{ timestamps: true, versionKey: false }
);

export const GalleryCollection = model("gallerys", gallerySchema);
