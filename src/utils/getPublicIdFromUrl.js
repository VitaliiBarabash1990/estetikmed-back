// utils/getPublicIdFromUrl.js
export const getPublicIdFromUrl = (url) => {
	if (!url) return null;
	const parts = url.split("/");
	const filename = parts.at(-1);
	return filename?.split(".")[0] || null;
};
