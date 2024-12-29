import type { Prisma, Product, User } from "@prisma/client";
import type { Failure } from "../utils/failure";

export type ProductQueryParams = {
	sellerId: string;
	search?: string;
	limit?: number;
	page?: number;
	excludedProductId?: string;
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
		productInCarts: number;
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
	getByUserId: (
		params: ProductQueryParams,
	) => Promise<PaginatedResult<Product | Failure>>;
	create: (product: UpsertProduct) => Promise<Product>;
	update: (id: string, product: UpsertProduct) => Promise<Product | Failure>;
	delete: (id: string) => Promise<unknown | Failure>;
}
