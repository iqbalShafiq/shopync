import type { Product } from "@prisma/client";
import type { Failure } from "../utils/failure";

export type CartQueryParams = {
	userId: string;
	productId?: string;
};

export type UpsertItem = {
	userId: string;
	productId: string;
	quantity: number;
};

export type ProductInCart = {
	quantity: number;
	product: Product;
};

export interface ICart {
	get: (params: CartQueryParams) => Promise<ProductInCart[] | null | Failure>;
	addItem: (request: UpsertItem) => Promise<unknown | Failure>;
	updateItem: (request: UpsertItem) => Promise<unknown | Failure>;
}
