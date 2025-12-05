import { GalleryCollection } from "../db/models/gallery.js";

export const getAllGalleryService = async () => GalleryCollection.find();

export const getGalleryByTypeService = async (type) =>
	GalleryCollection.findOne({ type });

export const createGalleryService = async (payload) =>
	GalleryCollection.create(payload);

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

/**
 * Видаляє зображення за індексом (вбудовано в масив imgs).
 * Повертає оновлений документ або null.
 */
export const removeImageByIndexService = async (type, index) => {
	const doc = await GalleryCollection.findOne({ type });
	if (!doc) return null;
	if (index < 0 || index >= doc.imgs.length) return null;
	doc.imgs.splice(index, 1);
	await doc.save();
	return doc;
};

export const deleteGalleryService = async (type) =>
	GalleryCollection.findOneAndDelete({ type });
