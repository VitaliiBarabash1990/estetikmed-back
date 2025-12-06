// import { Router } from 'express';
import express from "express";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { validateBody } from "../middlewares/validateBody.js";
import { isValidId } from "../middlewares/isValidId.js";
import { upload } from "../middlewares/multer.js";
import { authenticate } from "../middlewares/authenticate.js";
import {
	createArticlesController,
	deleteArticlesController,
	getArticlesController,
	patchArticlesController,
} from "../controllers/articles.js";
import { createArticleSchema } from "../validation/contacts.js";

const router = express.Router();
const jsonParser = express.json();

router.get("/", ctrlWrapper(getArticlesController));

router.post(
	"/",
	upload.single("img"),
	validateBody(createArticleSchema),
	ctrlWrapper(createArticlesController)
);

router.patch(
	"/:id",
	// authenticate,
	upload.single("img"),
	validateBody(createArticleSchema),
	ctrlWrapper(patchArticlesController)
);

router.delete("/:id", isValidId, ctrlWrapper(deleteArticlesController));

export default router;
