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

	// app.use(express.json());
	// app.use(cors());

	// app.use(
	// 	cors({
	// 		origin: (origin, callback) => {
	// 			// дозволяємо всі origin (включно з localhost, vercel і т.д.)
	// 			callback(null, origin || true);
	// 		},
	// 		credentials: true,
	// 	})
	// );

	const allowedOrigins = [
		"http://localhost:3000",
		"http://185.237.206.78",
		"https://185.237.206.78",
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

	app.use(express.json({ limit: "20mb" }));
	app.use(express.urlencoded({ extended: true, limit: "20mb" }));

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
