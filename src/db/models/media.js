import { Schema, model } from "mongoose";

const mediaSchema = new Schema(
	{
		type: { type: String, required: true, unique: true },
		imgs: { type: [String], required: false, default: [] },
		videos: { type: [String], required: true, default: [] }, // 👈 додано новий масив
	},
	{ timestamps: true, versionKey: false }
);

export const MediaCollection = model("medias", mediaSchema);
