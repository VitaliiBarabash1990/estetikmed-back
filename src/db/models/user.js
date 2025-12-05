import { model, Schema } from "mongoose";

const usersSchema = new Schema(
	{
		user: { type: String, required: true },
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: { type: String, required: true },
		role: {
			type: String,
			enum: ["user", "admin", "manager"],
			default: "user",
		},
	},
	{ timestamps: true, versionKey: false }
);

usersSchema.methods.toJSON = function () {
	const obj = this.toObject();
	delete obj.password;
	return obj;
};

export const UsersCollection = model("users", usersSchema);
