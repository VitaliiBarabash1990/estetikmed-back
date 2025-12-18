import { MediaCollection } from "../db/models/media.js";
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js";
import { env } from "../utils/env.js";

export const getAllMediaService = async () => MediaCollection.find();

export const getMediaByTypeService = async (type) =>
	MediaCollection.findOne({ type });

export const addMediaToGalleryService = async (type, items = []) => {
	const field = type === "video" ? "videos" : "imgs";
	return MediaCollection.findOneAndUpdate(
		{ type },
		{ $push: { [field]: { $each: items } } },
		{ new: true, upsert: true }
	);
};

export const removeMediaByUrlsService = async (type, urls = []) => {
	const field = type === "video" ? "videos" : "imgs";
	const doc = await MediaCollection.findOne({ type });
	if (!doc) return null;

	// Відбираємо елементи, які треба видалити з Cloudinary
	const itemsToDelete = doc[field].filter((item) =>
		typeof item === "string" ? urls.includes(item) : urls.includes(item.url)
	);

	if (env("ENABLE_CLOUDINARY") === "true") {
		await Promise.all(
			itemsToDelete.map((item) =>
				typeof item === "string"
					? null
					: deleteFromCloudinary(item.publicId, item.resourceType)
			)
		);
	}

	// Видаляємо об’єкти з бази
	// Окремо об’єкти {url} і прості рядки
	let updated = await MediaCollection.findOneAndUpdate(
		{ type },
		{ $pull: { [field]: { url: { $in: urls } } } },
		{ new: true }
	);

	updated = await MediaCollection.findOneAndUpdate(
		{ type },
		{ $pull: { [field]: { $in: urls } } },
		{ new: true }
	);

	return updated;
};
