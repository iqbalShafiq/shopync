import type { Product } from "@prisma/client";
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

export interface IProduct {
	getAll: (params: ProductQueryParams) => Promise<Product[] | Failure>;
	getById: (id: string) => Promise<Product | null>;
	getByUserId: (userId: string) => Promise<Product[] | null>;
	getByCartId: (cartId: string) => Promise<Product[] | null>;
	create: (product: UpsertProduct) => Promise<Product>;
	update: (id: string, product: UpsertProduct) => Promise<Product | Failure>;
	delete: (id: string) => Promise<unknown | Failure>;
}
