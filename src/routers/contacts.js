// import { Router } from 'express';
import express from "express";
import {
	createContactController,
	deleteContactController,
	getContactByIdController,
	getContactsController,
	patchContactController,
	upsertContactController,
} from "../controllers/contacts.js";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import {
	createContactSchema,
	updateContactSchema,
} from "../validation/contacts.js";
import { validateBody } from "../middlewares/validateBody.js";
import { isValidId } from "../middlewares/isValidId.js";
import { upload } from "../middlewares/multer.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();
const jsonParser = express.json();

router.get("/", ctrlWrapper(getContactsController));

router.get("/:contactId", isValidId, ctrlWrapper(getContactByIdController));

router.post(
	"/",
	jsonParser,
	authenticate,
	ctrlWrapper(createContactController)
);

// router.post(
// 	"/register",
// 	validateBody(createContactSchema),
// 	ctrlWrapper(createContactController)
// );

router.delete("/:contactId", isValidId, ctrlWrapper(deleteContactController));

router.put(
	"/:contactId",
	isValidId,
	upload.single("photo"),
	validateBody(createContactSchema),
	ctrlWrapper(upsertContactController)
);

router.patch("/:id", authenticate, ctrlWrapper(patchContactController));

export default router;
