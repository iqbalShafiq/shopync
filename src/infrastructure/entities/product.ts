import type { Prisma, Product, User } from "@prisma/client";
import type { Failure } from "../utils/failure";

export type ProductQueryParams = {
	search?: string;
	limit?: number;
	page?: number;
};

export type UpsertProduct = {
	name: string;
	price: number;
	quantity: number;
	userId: string;
	description: string;
	imageUrl: string | null;
};

export type UserWithCount = Omit<User, "password"> & {
	count: {
		products: number;
		cart: number;
	};
};

export interface IProduct {
	getAll: (
		params: ProductQueryParams,
	) => Promise<PaginatedResult<Product> | Failure>;
	getById: (
		id: string,
		select?: Prisma.UserSelect,
	) => Promise<(Product & { user: UserWithCount }) | null>;
	getByUserId: (userId: string) => Promise<PaginatedResult<Product | Failure>>;
	getByCartId: (cartId: string) => Promise<Product[] | null>;
	create: (product: UpsertProduct) => Promise<Product>;
	update: (id: string, product: UpsertProduct) => Promise<Product | Failure>;
	delete: (id: string) => Promise<unknown | Failure>;
}
