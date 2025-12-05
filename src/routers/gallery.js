import express from "express";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { upload } from "../middlewares/multer.js";
import {
	getGalleryController,
	getGalleryByTypeController,
	createGalleryController,
	addImagesController,
	deleteImageByUrlController,
	deleteImageByIndexController,
	deleteGalleryController,
} from "../controllers/gallery.js";

const router = express.Router();

router.get("/", ctrlWrapper(getGalleryController));
router.get("/:type", ctrlWrapper(getGalleryByTypeController));

// Створити (type + початкові imgs — optional)
router.post(
	"/",
	upload.array("imgs", 50),
	ctrlWrapper(createGalleryController)
);

// Додати картинки (multipart files або body.imgs (URL-и))
router.patch(
	"/:type",
	upload.array("imgs", 50),
	ctrlWrapper(addImagesController)
);

// Видалити по URL (body.urls / body.url або query ?url=)
router.delete("/:type/image", ctrlWrapper(deleteImageByUrlController));

// Видалити по індексу
router.delete("/:type/:index", ctrlWrapper(deleteImageByIndexController));

// Видалити всю галерею типу
router.delete("/:type", ctrlWrapper(deleteGalleryController));

export default router;
