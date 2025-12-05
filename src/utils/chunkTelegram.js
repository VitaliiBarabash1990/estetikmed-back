import { TG_MAX } from "../constants/index.js";
import { sendTelegramMessage } from "./telegram.js";

// Надсилання з урахуванням ліміту 4096 символів
export const chunkAndSend = async (chatId, text) => {
	if (text.length <= TG_MAX) {
		await sendTelegramMessage(chatId, text);
		return;
	}
	let start = 0;
	while (start < text.length) {
		let end = Math.min(start + 4000, text.length); // невеличкий запас
		if (end < text.length) {
			const safeBreak = text.lastIndexOf("\n", end);
			if (safeBreak > start + 1000) end = safeBreak; // не робимо міні-чанків
		}
		await sendTelegramMessage(chatId, text.slice(start, end));
		start = end;
	}
};
