import { GalleryCollection } from "../db/models/gallery.js";

export const getAllGalleryService = async () => GalleryCollection.find();

export const getGalleryByTypeService = async (type) =>
	GalleryCollection.findOne({ type });

/**
 * Додає масив imgs до існуючого документу {type}.
 * Якщо документу немає — створює його (upsert).
 */
export const addImagesToGalleryService = async (type, imgs = []) => {
	if (!Array.isArray(imgs) || imgs.length === 0) {
		return await getGalleryByTypeService(type);
	}
	return await GalleryCollection.findOneAndUpdate(
		{ type },
		{ $push: { imgs: { $each: imgs } } },
		{ new: true, upsert: true }
	);
};

/**
 * Видаляє зображення по URL-ам (масив).
 */
export const removeImagesByUrlsService = async (type, urls = []) => {
	if (!Array.isArray(urls) || urls.length === 0)
		return await getGalleryByTypeService(type);
	return await GalleryCollection.findOneAndUpdate(
		{ type },
		{ $pull: { imgs: { $in: urls } } },
		{ new: true }
	);
};
