const parseFillerType = (fillerType) => {
	const isString = typeof fillerType === "string";
	if (!isString) return;
	const isFillerType = (fillerType) =>
		["work", "home", "personal"].includes(fillerType);

	if (isFillerType(fillerType)) return fillerType;
};

// const parseIsFavourite = (isFavourite) => {
//   const isBoolean = typeof isFavourite === 'boolean';
//   if (!isBoolean) return;
//   return isFavourite;
// };

const parseIsFavourite = (IsFavourite) => {
	if (typeof IsFavourite === "boolean") return IsFavourite;
	if (typeof IsFavourite === "string") {
		if (IsFavourite.toLowerCase() === "true") return true;
		if (IsFavourite.toLowerCase() === "false") return false;
	}
	return;
};

export const parseFilterParams = (query) => {
	const { fillerType, isFavourite } = query;

	const parsedFillerType = parseFillerType(fillerType);
	const parsedIsFafourite = parseIsFavourite(isFavourite);

	return {
		fillerType: parsedFillerType,
		isFavourite: parsedIsFafourite,
	};
};
