// import { Router } from 'express';
import express from "express";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { validateBody } from "../middlewares/validateBody.js";
import { isValidId } from "../middlewares/isValidId.js";
import { upload } from "../middlewares/multer.js";
import { authenticate } from "../middlewares/authenticate.js";
import {
	createServicesController,
	deleteServicesController,
	getServicesByIdController,
	getServicesController,
	patchServicesController,
	upsertServicesController,
} from "../controllers/services.js";

const router = express.Router();
const jsonParser = express.json();

router.get("/", ctrlWrapper(getServicesController));

router.get("/:aboutId", isValidId, ctrlWrapper(getServicesByIdController));

router.post(
	"/",
	upload.array("imgs", 10),
	// authenticate,
	ctrlWrapper(createServicesController)
);

router.delete("/:id", isValidId, ctrlWrapper(deleteServicesController));

router.put(
	"/:aboutId",
	isValidId,
	upload.array("imgs", 10),
	// validateBody(createAboutSchema),
	ctrlWrapper(upsertServicesController)
);

router.patch(
	"/:id",
	// authenticate,
	upload.array("imgs", 10),
	ctrlWrapper(patchServicesController)
);

export default router;
