import {
	logoutUser,
	adminLoginService,
	registerUser,
} from "../services/auth.js";
import { ONE_DAY } from "../constants/index.js";
import { requestSendBody } from "./services.js";

export const adminLoginController = async (req, res) => {
	const session = await adminLoginService(req.body);

	res.cookie("refreshToken", session.refreshToken.toString(), {
		httpOnly: true,
		expires: new Date(Date.now() + ONE_DAY),
		sameSite: "none",
		secure: true,
		// sameSite: "Lax",
		// secure: false,
	});
	res.cookie("sessionId", session._id.toString(), {
		httpOnly: true,
		expires: new Date(Date.now() + ONE_DAY),
		sameSite: "none",
		secure: true,
		// sameSite: "Lax",
		// secure: false,
	});

	res.json({
		status: 200,
		message: "Successfully logged in an admin!",
		data: { data: session },
	});
};

export const registerUserController = async (req, res) => {
	const { user, session } = await registerUser(req.body);

	setupSession(res, session);

	res.status(201).json({
		status: 201,
		message: "Successfully registered a user!",
		data: user,
	});
};

const setupSession = (res, session) => {
	res.cookie("refreshToken", session.refreshToken.toString(), {
		httpOnly: true,
		expires: new Date(Date.now() + ONE_DAY),
		sameSite: "none",
		secure: true,
		// sameSite: "lax",
		// secure: false,
	});
	res.cookie("sessionId", session._id.toString(), {
		httpOnly: true,
		expires: new Date(Date.now() + ONE_DAY),
		sameSite: "none",
		secure: true,
		// sameSite: "lax",
		// secure: false,
	});
};

export const logoutUserController = async (req, res) => {
	console.log("RequestBody", req.body);
	console.log("RequestSesionId", req.cookies.sessionId);
	if (req.cookies.sessionId) {
		await logoutUser(req.cookies.sessionId);
	}
	res.clearCookie("sessionId");
	res.clearCookie("refreshToken");

	res.status(204).send();
};

export const sendEmailController = async (req, res) => {
	try {
		const { name, phone, email, message } = req.body;
		const file = req.file;

		if (!name || !phone || !email || !message) {
			return res.status(400).json({
				message: "Поля name, phone, email, message є обов'язковими",
				status: 400,
			});
		}

		await requestSendBody({
			name,
			phone,
			email,
			message,
			file,
		});

		res.json({
			message: "Order was successfully sent to email!",
			status: 200,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const sendTelegramController = async (req, res) => {
	console.log(req.body);
	await requestSendTelegram(req.body); // передаємо весь об'єкт
	res.json({
		message: "Order was successfully sent to email!",
		status: 200,
		data: {},
	});
};
