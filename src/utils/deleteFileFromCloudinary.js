import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";
import { CLOUDINARY } from "../constants/index.js";

// Debug:
// console.log("Cloud name:", env(CLOUDINARY.CLOUD_NAME));
// console.log("typeof env:", typeof env);

cloudinary.config({
	secure: true,
	cloud_name: env(CLOUDINARY.CLOUD_NAME),
	api_key: env(CLOUDINARY.API_KEY),
	api_secret: env(CLOUDINARY.API_SECRET),
});

export const deleteFileFromCloudinary = async (publicId) => {
	try {
		if (!publicId) {
			console.warn("❗ publicId is missing for deleteFileFromCloudinary");
			return;
		}
		const result = await cloudinary.uploader.destroy(publicId);
		console.log("✅ Deleted from Cloudinary:", result);
	} catch (err) {
		console.error(`❌ Failed to delete ${publicId} from Cloudinary`, err);
	}
};
