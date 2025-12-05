import { SORT_ORDER } from "../constants/index.js";

const parseSortOrder = (sortOrder) => {
	const isKnownOrder = [SORT_ORDER.ASC, SORT_ORDER.DESC].includes(sortOrder);
	if (isKnownOrder) return sortOrder;
	return SORT_ORDER.ASC;
};

const parseSortBy = (sortBy) => {
	const keysOfContact = [
		"_id",
		"img",
		"imgsvg",
		"stars",
		"text",
		"price",
		"reviews",
		"wages",
		"description_title",
		"description_text",
		"benefits_title",
		"benefits_text",
		"Regulations_title",
		"Regulations_text",
		"brand",
		"view",
		"wage",
		"volume",
		"country",
		"createdAt",
		"updatedAt",
	];
	if (keysOfContact.includes(sortBy)) {
		return sortBy;
	}
	return "_id";
};

export const parseSortParams = (query) => {
	const { sortOrder, sortBy } = query;

	const parsedSortOrder = parseSortOrder(sortOrder);
	const parsedSortBy = parseSortBy(sortBy);

	return {
		sortOrder: parsedSortOrder,
		sortBy: parsedSortBy,
	};
};
