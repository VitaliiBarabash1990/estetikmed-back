import express from "express";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { loginUserSchema, registerUserSchema } from "../validation/auth.js";
import {
	logoutUserController,
	adminLoginController,
	sendEmailController,
	sendTelegramController,
	registerUserController,
} from "../controllers/auth.js";
import { validateBody } from "../middlewares/validateBody.js";
import { upload } from "../middlewares/multerSend.js";

const router = express.Router();
const jsonParser = express.json();

router.post(
	"/adminlogin",
	validateBody(loginUserSchema),
	ctrlWrapper(adminLoginController)
);

router.post(
	"/register",
	jsonParser,
	validateBody(registerUserSchema),
	ctrlWrapper(registerUserController)
);

router.post("/logout", ctrlWrapper(logoutUserController));

router.post(
	"/send-email",
	upload.single("file"),
	ctrlWrapper(sendEmailController)
);

router.post(
	"/send-telegram",
	upload.single("file"), // ✅ ТЕ САМЕ, ЩО В send-email
	ctrlWrapper(sendTelegramController)
);

export default router;
