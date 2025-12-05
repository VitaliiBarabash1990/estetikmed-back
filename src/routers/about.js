// import { Router } from 'express';
import express from "express";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { validateBody } from "../middlewares/validateBody.js";
import { isValidId } from "../middlewares/isValidId.js";
import { upload } from "../middlewares/multer.js";
import { authenticate } from "../middlewares/authenticate.js";
import {
	createAboutController,
	deleteAboutController,
	getAboutByIdController,
	getAboutController,
	patchAboutController,
	upsertAboutController,
} from "../controllers/about.js";

const router = express.Router();
const jsonParser = express.json();

router.get("/", ctrlWrapper(getAboutController));

router.get("/:aboutId", isValidId, ctrlWrapper(getAboutByIdController));

router.post(
	"/",
	upload.single("img"),
	// authenticate,
	ctrlWrapper(createAboutController)
);

router.delete("/:id", isValidId, ctrlWrapper(deleteAboutController));

router.put(
	"/:aboutId",
	isValidId,
	upload.single("photo"),
	// validateBody(createAboutSchema),
	ctrlWrapper(upsertAboutController)
);

router.patch(
	"/:id",
	// authenticate,
	upload.single("img"),
	ctrlWrapper(patchAboutController)
);

export default router;
