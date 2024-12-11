import bcrypt from "bcrypt";
import { inject, injectable } from "inversify";
import type {
	IAuth,
	Login,
	Register,
} from "../../infrastructure/entities/auth";
import { TYPES } from "../../infrastructure/ioc/types";

@injectable()
export class AuthService {
	constructor(
		@inject(TYPES.AuthRepository)
		private authRepository: IAuth,
	) {}

	async profile(email: string) {
		return this.authRepository.profile(email);
	}

	async register(request: Register) {
		const saltRounds = Number.parseInt(process.env.SALT_ROUNDS || "10");
		const hashedPassword = await bcrypt.hash(request.password, saltRounds);
		return this.authRepository.register({
			...request,
			password: hashedPassword,
		});
	}

	async login(request: Login) {
		return this.authRepository.login(request);
	}
}
