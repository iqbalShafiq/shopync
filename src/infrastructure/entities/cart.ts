import type { Product } from "@prisma/client";
import type { Failure } from "../utils/failure";

export type UpsertItem = {
	userId: string;
	productId: string;
	quantity: number;
};

export type RemoveItem = {
	userId: string;
	productId: string;
};

export interface ICart {
	getByUserId: (userId: string) => Promise<Product[] | null | Failure>;
	addItem: (request: UpsertItem) => Promise<unknown | Failure>;
	updateItem: (request: UpsertItem) => Promise<unknown | Failure>;
	removeItem: (request: RemoveItem) => Promise<unknown | Failure>;
}
