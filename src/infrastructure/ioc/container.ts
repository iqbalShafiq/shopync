import { Container } from "inversify";
import { AuthService } from "../../applications/services/auth.service";
import { CartService } from "../../applications/services/cart.service";
import { CategoryService } from "../../applications/services/category.service";
import { ProductService } from "../../applications/services/product.service";
import type { IAuth } from "../entities/auth";
import type { ICart } from "../entities/cart";
import type { ICategory } from "../entities/category";
import type { IProduct } from "../entities/product";
import { AuthRepository } from "../repositories/auth.repository";
import { CartRepository } from "../repositories/cart.repository";
import { CategoryRepository } from "../repositories/category.repository";
import { ProductRepository } from "../repositories/product.repository";
import { TYPES } from "./types";

const container = new Container();

container.bind<IAuth>(TYPES.AuthRepository).to(AuthRepository);
container.bind<AuthService>(TYPES.AuthService).to(AuthService);

container.bind<IProduct>(TYPES.ProductRepository).to(ProductRepository);
container.bind<ProductService>(TYPES.ProductService).to(ProductService);

container.bind<ICart>(TYPES.CartRepository).to(CartRepository);
container.bind<CartService>(TYPES.CartService).to(CartService);

container.bind<ICategory>(TYPES.CategoryRepository).to(CategoryRepository);
container.bind<CategoryService>(TYPES.CategoryService).to(CategoryService);

export { container };
