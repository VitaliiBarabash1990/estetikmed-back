import { Schema, model } from "mongoose";

const mediaItemSchema = new Schema(
	{
		url: { type: String, required: true },
		publicId: { type: String, default: null },
		resourceType: {
			type: String,
			enum: ["image", "video"],
			default: "image",
		},
	},
	{ _id: false }
);

const mediaSchema = new Schema(
	{
		type: { type: String, required: true, unique: true },
		imgs: { type: [mediaItemSchema], default: [] },
		videos: { type: [mediaItemSchema], default: [] },
	},
	{ timestamps: true, versionKey: false }
);

export const MediaCollection = model("medias", mediaSchema);
