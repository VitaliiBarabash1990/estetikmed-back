import express from "express";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { upload } from "../middlewares/multer.js";
import {
	getMediaController,
	addMediaController,
	deleteMediaByUrlController,
} from "../controllers/media.js";

const router = express.Router();

router.get("/", ctrlWrapper(getMediaController));

// Додати картинки (multipart files або body.imgs)
router.patch(
	"/:type",
	upload.array("imgs", 50),
	ctrlWrapper(addMediaController)
);

// Видалити по URL (body.urls / body.url або query ?url=)
router.delete("/:type/image", ctrlWrapper(deleteMediaByUrlController));

export default router;
