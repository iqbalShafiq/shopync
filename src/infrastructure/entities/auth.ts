import type { User } from "@prisma/client";
import type { Failure } from "../utils/failure";

export type Register = {
	email: string;
	name: string;
	password: string;
};

export type Login = {
	email: string;
	password: string;
};

export type AuthResult = Partial<User>;

export interface IAuth {
	register: (request: Register) => Promise<AuthResult | Failure>;
	login: (request: Login) => Promise<AuthResult | Failure>;
}
