import express from "express";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import {
	createMainController,
	deleteMainController,
	getAllMainController,
	getMainByIdController,
	updateMainController,
} from "../controllers/main.js";
import { upload } from "../middlewares/multer.js";
const router = express.Router();

router.post("/", upload.array("img", 10), ctrlWrapper(createMainController));
router.patch(
	"/:id",
	upload.array("img", 10),
	ctrlWrapper(updateMainController)
);
router.get("/", ctrlWrapper(getAllMainController));
router.get("/:id", ctrlWrapper(getMainByIdController));
router.delete("/:id", ctrlWrapper(deleteMainController));

export default router;
