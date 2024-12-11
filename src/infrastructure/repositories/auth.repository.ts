import bcrypt from "bcrypt";
import { injectable } from "inversify";
import type { AuthResult, IAuth, Login, Register } from "../entities/auth";
import ErrorCode from "../utils/errorCode";
import type { Failure } from "../utils/failure";
import { prisma } from "../utils/prisma";

@injectable()
export class AuthRepository implements IAuth {
	async profile(email: string): Promise<AuthResult | Failure> {
		const user = await prisma.user.findUnique({
			where: {
				email,
			},
		});

		if (!user) {
			return {
				errorCode: ErrorCode.NOT_FOUND,
				message: "User not found",
			};
		}

		return user;
	}

	async register(request: Register): Promise<AuthResult | Failure> {
		const hasRegistered = await prisma.user.findUnique({
			where: {
				email: request.email,
			},
		});

		if (hasRegistered) {
			return {
				errorCode: ErrorCode.CONFLICT,
				message: "User already exists",
			};
		}

		return prisma.user.create({
			data: request,
		});
	}

	async login(request: Login): Promise<AuthResult | Failure> {
		const user = await prisma.user.findUnique({
			where: {
				email: request.email,
			},
		});

		if (!user) {
			return {
				errorCode: ErrorCode.NOT_FOUND,
				message: "User not found",
			};
		}

		const passwordValid = await bcrypt.compare(request.password, user.password);
		if (!passwordValid) {
			return {
				errorCode: ErrorCode.UNAUTHORIZED,
				message: "Invalid password",
			};
		}

		return user;
	}
}
