// controllers/mainController.ts
import { MainCollection } from "../db/models/main.js";
import {
	createMainService,
	deleteMainService,
	getAllMainService,
	getMainByIdService,
	updateMainService,
} from "../services/main.js";
import { env } from "../utils/env.js";
import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js";
import { saveFileToUploadDir } from "../utils/saveFileToUploadDir.js";

// Створення
export const createMainController = async (req, res, next) => {
	console.log("DATA", req.body);
	try {
		const { body, files } = req;

		let imgPaths = [];

		if (files && files.length > 0) {
			if (env("ENABLE_CLOUDINARY") === "true") {
				imgPaths = await Promise.all(files.map(saveFileToCloudinary));
			} else {
				imgPaths = await Promise.all(files.map(saveFileToUploadDir));
			}
		}

		const payload = {
			ua: {
				title: body.titleUa,
				subTitleOne: body.subTitleOneUa,
				subTitleTwo: body.subTitleTwoUa,
			},
			en: {
				title: body.titleEn,
				subTitleOne: body.subTitleOneEn,
				subTitleTwo: body.subTitleTwoEn,
			},
			pl: {
				title: body.titlePl,
				subTitleOne: body.subTitleOnePl,
				subTitleTwo: body.subTitleTwoPl,
			},
			de: {
				title: body.titleDe,
				subTitleOne: body.subTitleOneDe,
				subTitleTwo: body.subTitleTwoDe,
			},
			img: imgPaths,
		};

		const doc = await createMainService(payload);

		res
			.status(201)
			.json({ status: 201, message: "Created successfully", data: doc });
	} catch (error) {
		next(error);
	}
};

// Оновлення

export const updateMainController = async (req, res, next) => {
	try {
		const { body, files = [], params } = req;

		// 1) parse existingImg (safe)
		let existingFromBody = [];
		if (body.existingImg) {
			try {
				existingFromBody =
					typeof body.existingImg === "string"
						? JSON.parse(body.existingImg)
						: body.existingImg;
				if (!Array.isArray(existingFromBody)) existingFromBody = [];
			} catch (err) {
				existingFromBody = [];
			}
		}

		// 2) save incoming files -> отримуємо шляхи (в тому ж порядку, що files[])
		const savedPaths = [];
		if (files && files.length > 0) {
			if (env("ENABLE_CLOUDINARY") === "true") {
				for (const f of files) {
					const p = await saveFileToCloudinary(f);
					savedPaths.push(p);
				}
			} else {
				for (const f of files) {
					const p = await saveFileToUploadDir(f);
					savedPaths.push(p);
				}
			}
		}

		// 3) створюємо мапу для файлів: якщо fieldname має індекс (img[2]) — запам'ятовуємо index->path,
		// інакше кладемо у список unindexed (щоб далі заповнювати вакантні місця)
		const indexedFilesMap = {}; // { index: path }
		const unindexedNewFiles = []; // [path, path, ...]

		for (let i = 0; i < files.length; i++) {
			const f = files[i];
			const savedPath = savedPaths[i];
			const m = (f.fieldname || "").match(/img\[(\d+)\]/); // шукаємо img[<index>]
			if (m) {
				const idx = Number(m[1]);
				indexedFilesMap[idx] = savedPath;
			} else {
				// якщо fieldname === "img" або інше — вважаємо неіндексованим
				unindexedNewFiles.push(savedPath);
			}
		}

		// 4) Отримуємо поточний документ з DB, щоб знати початкову послідовність
		const currentDoc = await MainCollection.findById(params.id).lean();
		const originalImgs = Array.isArray(currentDoc?.img)
			? currentDoc.img.slice()
			: [];

		// Якщо DB порожня, але клієнт прислав existingFromBody (малоймовірно),
		// почнемо з existingFromBody
		let finalImgs = originalImgs.length
			? originalImgs.slice()
			: existingFromBody.length
			? existingFromBody.slice()
			: [];

		// 5) Маркуємо позиції, які були видалені на клієнті як null
		const keepSet = new Set(existingFromBody || []);
		for (let i = 0; i < finalImgs.length; i++) {
			if (!keepSet.has(finalImgs[i])) {
				finalImgs[i] = null; // vacancy
			}
		}

		// 6) Поставляємо індексовані нові файли на їх місця
		Object.entries(indexedFilesMap).forEach(([idxStr, path]) => {
			const idx = Number(idxStr);
			finalImgs[idx] = path;
		});

		// 7) Заповнюємо вакантні місця unindexedNewFiles (по порядку)
		for (let i = 0; i < finalImgs.length && unindexedNewFiles.length > 0; i++) {
			if (finalImgs[i] == null) {
				finalImgs[i] = unindexedNewFiles.shift();
			}
		}

		// 8) Якщо лишились нові файли — додаємо їх в кінець
		while (unindexedNewFiles.length > 0) {
			finalImgs.push(unindexedNewFiles.shift());
		}

		// 9) Якщо ніяких originalImgs (наприклад перше створення) і є savedPaths, то finalImgs = savedPaths
		if (!finalImgs.length && savedPaths.length) {
			finalImgs = savedPaths.slice();
		}

		// 10) Відфільтровуємо null/undefined
		finalImgs = finalImgs.filter((v) => v != null);

		// 11) Формуємо payload (map полів локалізацій як у тебе)
		const payload = {
			ua: {
				title: body.titleUa,
				subTitleOne: body.subTitleOneUa,
				subTitleTwo: body.subTitleTwoUa,
			},
			en: {
				title: body.titleEn,
				subTitleOne: body.subTitleOneEn,
				subTitleTwo: body.subTitleTwoEn,
			},
			pl: {
				title: body.titlePl,
				subTitleOne: body.subTitleOnePl,
				subTitleTwo: body.subTitleTwoPl,
			},
			de: {
				title: body.titleDe,
				subTitleOne: body.subTitleOneDe,
				subTitleTwo: body.subTitleTwoDe,
			},
			img: finalImgs, // ОНОВЛЕНІ шляхи
		};

		const doc = await updateMainService(params.id, payload);

		res.status(200).json({
			status: 200,
			message: "Updated successfully",
			data: doc,
		});
	} catch (error) {
		next(error);
	}
};

// Отримати всі
export const getAllMainController = async (req, res, next) => {
	try {
		const docs = await getAllMainService();
		console.log("docs", docs);
		res.json({ status: 200, data: docs });
	} catch (error) {
		next(error);
	}
};

// Отримати по id
export const getMainByIdController = async (req, res, next) => {
	try {
		const { id } = req.params;
		const doc = await getMainByIdService(id);
		res.json({ status: 200, data: doc });
	} catch (error) {
		next(error);
	}
};

// Видалення
export const deleteMainController = async (req, res, next) => {
	try {
		const { id } = req.params;
		await deleteMainService(id);
		res.json({ status: 200, message: "Deleted successfully" });
	} catch (error) {
		next(error);
	}
};
