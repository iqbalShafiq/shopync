import type { Cart } from "@prisma/client";
import type { Failure } from "../utils/failure";

export type UpsertItem = {
	userId: string;
	productId: number;
	quantity: number;
};

export type DeleteItem = {
	userId: string;
	productId: number;
};

export interface ICart {
	getByUserId: (userId: string) => Promise<Cart | null | Failure>;
	createCart: (userId: string) => Promise<Cart | Failure>;
	addItem: (request: UpsertItem) => Promise<undefined | Failure>;
	updateItem: (request: UpsertItem) => Promise<undefined | Failure>;
	removeItem: (request: DeleteItem) => Promise<undefined | Failure>;
}
