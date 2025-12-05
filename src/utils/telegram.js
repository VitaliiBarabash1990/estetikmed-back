import TelegramBot from "node-telegram-bot-api";
import { env } from "./env.js";

const bot = new TelegramBot(env("TELEGRAM_BOT_TOKEN"), { polling: false });

export const sendTelegramMessage = async (chatId, message) => {
	try {
		await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
	} catch (err) {
		console.error("❌ Помилка надсилання в Telegram:", err);
		throw err;
	}
};
