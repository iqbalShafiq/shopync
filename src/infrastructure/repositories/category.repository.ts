import type { Category } from "@prisma/client";
import { injectable } from "inversify";
import type { CategoryInput, ICategory } from "../entities/category";
import { prisma } from "../utils/prisma";

@injectable()
export class CategoryRepository implements ICategory {
	async getAll(): Promise<Category[]> {
		return prisma.category.findMany({
			orderBy: { name: "asc" },
		});
	}

	async findOrCreate(categories: CategoryInput[]): Promise<Category[]> {
		return await Promise.all(
			categories.map(async (category) => {
				return prisma.category.upsert({
					where: { name: category.name },
					update: {},
					create: {
						name: category.name,
						description: category.description,
					},
				});
			}),
		);
	}
}
