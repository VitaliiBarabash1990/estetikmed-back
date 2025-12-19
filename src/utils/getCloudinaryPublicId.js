export const getCloudinaryPublicId = (url) => {
	if (!url) return null;

	try {
		const parts = url.split("/");
		const uploadIndex = parts.findIndex((p) => p === "upload");
		if (uploadIndex === -1) return null;

		const publicIdWithExt = parts.slice(uploadIndex + 2).join("/");

		return publicIdWithExt.replace(/\.[^/.]+$/, "");
	} catch {
		return null;
	}
};
