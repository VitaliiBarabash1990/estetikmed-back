import multer from "multer";
import { TEMP_UPLOAD_DIR } from "../constants/index.js";

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, TEMP_UPLOAD_DIR);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now();
		cb(null, `${uniqueSuffix}_${file.originalname}`);
	},
});

// дозволені типи
const allowedMimeTypes = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const upload = multer({
	storage,
	fileFilter: (req, file, cb) => {
		if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
		else cb(new Error("Invalid file type"), false);
	},
});
