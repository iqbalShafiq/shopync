import { Container } from "inversify";
import { AuthService } from "../../applications/services/auth.service";
import type { IAuth } from "../entities/auth";
import { AuthRepository } from "../repositories/auth.repository";
import { TYPES } from "./types";

const container = new Container();

container.bind<IAuth>(TYPES.AuthRepository).to(AuthRepository);
container.bind<AuthService>(TYPES.AuthService).to(AuthService);

export { container };
