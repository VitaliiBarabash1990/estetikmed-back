import { model, Schema } from "mongoose";

const contactsSchema = new Schema(
	{
		number: {
			type: String,
			required: true,
		},
		telegram: {
			type: String,
			required: true,
		},
		instagram: {
			type: String,
			required: false,
		},
		facebook: {
			type: String,
			required: false,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const ContactsCollection = model("contacts", contactsSchema);
