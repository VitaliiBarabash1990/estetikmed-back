import { MediaCollection } from "../db/models/media.js";

export const getAllMediaService = async () => MediaCollection.find();

export const getMediaByTypeService = async (type) =>
	MediaCollection.findOne({ type });

/**
 * Додає масив imgs до існуючого документу {type}.
 * Якщо документу немає — створює його (upsert).
 */
export const addMediaToGalleryService = async (type, items = []) => {
	if (!Array.isArray(items) || items.length === 0) {
		return await getMediaByTypeService(type);
	}

	const field = type === "video" ? "videos" : "imgs";

	return await MediaCollection.findOneAndUpdate(
		{ type },
		{ $push: { [field]: { $each: items } } },
		{ new: true, upsert: true }
	);
};

/**
 * Видаляє зображення по URL-ам (масив).
 */
export const removeMediaByUrlsService = async (type, urls = []) => {
	const field = type === "video" ? "videos" : "imgs";

	return await MediaCollection.findOneAndUpdate(
		{ type },
		{ $pull: { [field]: { $in: urls } } },
		{ new: true }
	);
};
