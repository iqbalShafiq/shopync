import { Container } from "inversify";
import { AuthService } from "../../applications/services/auth.service";
import { ProductService } from "../../applications/services/product.service";
import type { IAuth } from "../entities/auth";
import type { IProduct } from "../entities/product";
import { AuthRepository } from "../repositories/auth.repository";
import { ProductRepository } from "../repositories/product.repository";
import { TYPES } from "./types";

const container = new Container();

container.bind<IAuth>(TYPES.AuthRepository).to(AuthRepository);
container.bind<AuthService>(TYPES.AuthService).to(AuthService);
container.bind<IProduct>(TYPES.ProductRepository).to(ProductRepository);
container.bind<ProductService>(TYPES.ProductService).to(ProductService);

export { container };
