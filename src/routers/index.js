import express from "express";
import contactsRouter from "./contacts.js";
import authRouter from "./auth.js";
import mainRouter from "./main.js";
import aboutRouter from "./about.js";
import servicesRouter from "./services.js";
import galleryRouter from "./gallery.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

// router.use("/contacts", authenticate, contactsRouter);

router.use("/auth", authRouter);

router.use("/main", mainRouter);

router.use("/contacts", contactsRouter);

router.use("/about", aboutRouter);

router.use("/services", servicesRouter);

router.use("/gallery", galleryRouter);

export default router;
