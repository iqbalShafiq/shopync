import type { Product } from "@prisma/client";
import type { Failure } from "../utils/failure";

export type UpsertProduct = {
	name: string;
	price: number;
	description: string;
	imageUrl: string | null;
};

export interface IProduct {
	getAll: () => Promise<Product[] | Failure>;
	getById: (id: string) => Promise<Product | Failure>;
	getByUserId: (userId: string) => Promise<Product[] | Failure>;
	create: (product: UpsertProduct) => Promise<Product | Failure>;
	update: (id: string, product: UpsertProduct) => Promise<Product | Failure>;
	delete: (id: string) => Promise<Product | Failure>;
}
