import jwt from "jsonwebtoken";
import { IUser } from "../interfaces";

export const signToken = (_id: string, email: string) => {
	if (!process.env.JWT_SECRET_SEED) {
		throw new Error("No hay semilla de JWT - Revisar variables de entorno");
	}

	return jwt.sign(
		// payload
		{ _id, email },

		// Seed
		process.env.JWT_SECRET_SEED,

		// Opciones
		{ expiresIn: "30d" }
	);
};

export const isValidToken = async (
	token: string
): Promise<{ token: string; user?: IUser }> => {
	try {
		const request = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/auth/validate-token`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ token: token }),
			}
		);

		const data = await request.json();

		return { token: data.token, user: data.user };
	} catch (error) {
		console.error(error);
		return { token: "" };
	}
};
