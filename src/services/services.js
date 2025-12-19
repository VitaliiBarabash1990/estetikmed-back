import { ServicesCollection } from "../db/models/services.js";

export const createServicesService = async (payload) => {
	return ServicesCollection.create(payload);
};

export const updateServicesService = async (id, payload) => {
	return ServicesCollection.findByIdAndUpdate(id, payload, { new: true });
};

export const getAllServicesService = async () => {
	return ServicesCollection.find();
};

export const getServicesByIdService = async (id) => {
	return ServicesCollection.findById(id);
};

export const deleteServicesService = async (id) => {
	return ServicesCollection.findByIdAndDelete(id);
};
