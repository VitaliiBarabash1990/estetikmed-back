// utils/mapMediaToClient.js
export const mapMediaToClient = (doc) => {
	if (!doc) return null;
	const obj = doc.toObject();
	return {
		...obj,
		imgs: obj.imgs.map((i) => (typeof i === "string" ? i : i.url)),
		videos: obj.videos.map((v) => (typeof v === "string" ? v : v.url)),
	};
};
