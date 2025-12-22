import express from "express";
import pino from "pino-http";
import cors from "cors";

// import contactsRouter from './routers/contacts.js';
import router from "./routers/index.js";

import { env } from "./utils/env.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";
import { UPLOAD_DIR } from "./constants/index.js";

const PORT = Number(env("PORT", "4000"));

const setupServer = () => {
	const app = express();

	app.use(express.json());
	// app.use(cors());
	const allowedOrigins = [
		"http://localhost:3000",
		"https://estetikmed.vercel.app",
		"https://estetikmed.pl",
		"http://estetikmed.pl",
		"https://www.estetikmed.pl",
		"http://www.estetikmed.pl",
	];

	app.use(
		cors({
			origin: function (origin, callback) {
				if (!origin || allowedOrigins.includes(origin)) {
					callback(null, true);
				} else {
					callback(new Error("Not allowed by CORS"));
				}
			},
			credentials: true,
		})
	);
	app.use(cookieParser());

	app.use(
		pino({
			transport: {
				target: "pino-pretty",
			},
		})
	);

	app.get("/", (req, res) => {
		res.json({
			message: "Hello world!",
		});
	});

	app.use("/uploads", express.static(UPLOAD_DIR));

	// app.use(contactsRouter);

	app.use(router);

	app.use("*", notFoundHandler);

	app.use(errorHandler);

	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
};

export default setupServer;
