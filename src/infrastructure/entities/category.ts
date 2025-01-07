import type { Category } from "@prisma/client";

export type CategoryInput = {
	name: string;
	description?: string;
};

export interface ICategory {
	getAll(): Promise<Category[]>;
	findOrCreate(categories: CategoryInput[]): Promise<Category[]>;
}
