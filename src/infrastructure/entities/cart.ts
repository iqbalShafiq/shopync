import type { Cart, Product } from "@prisma/client";
import type { Failure } from "../utils/failure";

export type UpsertItem = {
	cartId: string;
	productId: string;
	quantity: number;
};

export type DeleteItem = {
	cartId: string;
	productId: string;
};

export interface ICart {
	getByUserId: (userId: string) => Promise<Cart | null | Failure>;
	createCart: (userId: string) => Promise<Cart | Failure>;
	addItem: (request: UpsertItem) => Promise<unknown>;
	updateItem: (request: UpsertItem) => Promise<unknown | Failure>;
	removeItem: (request: DeleteItem) => Promise<unknown | Failure>;
}
