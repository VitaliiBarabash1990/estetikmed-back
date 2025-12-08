// import { Router } from 'express';
import express from "express";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { validateBody } from "../middlewares/validateBody.js";
import { isValidId } from "../middlewares/isValidId.js";
import { upload } from "../middlewares/multer.js";
import { authenticate } from "../middlewares/authenticate.js";
import {
	createReviewsController,
	deleteReviewsController,
	getReviewsController,
	patchReviewsController,
} from "../controllers/reviews.js";
import { createReviewsSchema } from "../validation/contacts.js";

const router = express.Router();
const jsonParser = express.json();

router.get("/", ctrlWrapper(getReviewsController));

router.post(
	"/",
	upload.single("img"),
	validateBody(createReviewsSchema),
	ctrlWrapper(createReviewsController)
);

router.patch(
	"/:id",
	// authenticate,
	upload.single("img"),
	validateBody(createReviewsSchema),
	ctrlWrapper(patchReviewsController)
);

router.delete("/:id", isValidId, ctrlWrapper(deleteReviewsController));

export default router;
