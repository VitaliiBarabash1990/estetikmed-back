import express from "express";
import authRouter from "./auth.js";
import servicesRouter from "./services.js";
import articlesRouter from "./articles.js";
import reviewsRouter from "./reviews.js";
import mediaRouter from "./media.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.use("/auth", authRouter);

router.use("/services", servicesRouter);

router.use("/articles", articlesRouter);

router.use("/reviews", reviewsRouter);

router.use("/media", mediaRouter);

export default router;
