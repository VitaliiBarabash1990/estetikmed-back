export const extractPublicIdFromUrl = (url) => {
	// Наприклад: https://res.cloudinary.com/demo/image/upload/v1692345678/folder/my-image.jpg
	const parts = url.split("/");
	const fileNameWithExt = parts.pop(); // my-image.jpg
	const fileName = fileNameWithExt.split(".")[0]; // my-image
	const folder = parts.slice(parts.indexOf("upload") + 1).join("/"); // folder
	return `${folder}/${fileName}`; // folder/my-image
};
