import TelegramBot from "node-telegram-bot-api";
import fs from "node:fs";
import { env } from "./env.js";

const bot = new TelegramBot(env("TELEGRAM_BOT_TOKEN"), {
	polling: false,
});

export const sendTelegramMessage = async (chatId, message) => {
	await bot.sendMessage(chatId, message, {
		parse_mode: "HTML",
	});
};

export const sendTelegramFile = async (chatId, filePath, filename) => {
	await bot.sendDocument(
		chatId,
		fs.createReadStream(filePath),
		{},
		{
			filename,
		}
	);
};
