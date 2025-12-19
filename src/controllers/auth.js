import {
	logoutUser,
	adminLoginService,
	registerUser,
	requestSendTelegram,
	requestSendBody,
	refreshUsersSession,
} from "../services/auth.js";
import { ONE_DAY } from "../constants/index.js";

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

export const registerUserController = async (req, res) => {
	const { user, session } = await registerUser(req.body);

	setupSession(res, session);

	res.status(201).json({
		status: 201,
		message: "Successfully registered a user!",
		data: user,
	});
};

export const logoutUserController = async (req, res) => {
	if (req.cookies.sessionId) {
		await logoutUser(req.cookies.sessionId);
	}
	res.clearCookie("sessionId");
	res.clearCookie("refreshToken");

	res.status(204).send();
};

export const refreshUserSessionController = async (req, res) => {
	const session = await refreshUsersSession({
		sessionId: req.cookies.sessionId,
		refreshToken: req.cookies.refreshToken,
	});

	// console.log("Session from DB:", session._id.toString(), session.refreshToken);

	setupSession(res, session);
	// console.log("Cookies:", req.cookies);
	// console.log("sessionId:", req.cookies?.sessionId);

	res.json({
		status: 200,
		message: "Successfully refreshed a session!",
		data: {
			accessToken: session.accessToken,
		},
	});
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
	const { name, phone, email, message } = req.body;
	const file = req.file;

	if (!name || !phone || !email || !message) {
		throw createHttpError(
			400,
			"Поля name, phone, email, message є обовʼязковими"
		);
	}

	await requestSendTelegram({
		name,
		phone,
		email,
		message,
		file,
	});

	res.json({
		status: 200,
		message: "Order was successfully sent to telegram!",
	});
};
