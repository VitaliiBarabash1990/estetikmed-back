import cloudinary from "cloudinary";
import fs from "node:fs/promises";
import { CLOUDINARY } from "../constants/index.js";
import { env } from "./env.js";

cloudinary.v2.config({
	secure: true,
	cloud_name: env(CLOUDINARY.CLOUD_NAME),
	api_key: env(CLOUDINARY.API_KEY),
	api_secret: env(CLOUDINARY.API_SECRET),
});

export const saveFileToCloudinaryModified = async (file) => {
	try {
		const isVideo = file.mimetype.startsWith("video/");
		const folder = isVideo ? "videos" : "images";

		const response = await cloudinary.v2.uploader.upload(file.path, {
			resource_type: isVideo ? "video" : "image",
			folder,
		});

		await fs.unlink(file.path);

		return response.secure_url;
	} catch (err) {
		console.error("❌ Cloudinary upload error:", err);
		throw err;
	}
};
