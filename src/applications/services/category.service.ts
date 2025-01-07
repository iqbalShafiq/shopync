import { inject, injectable } from "inversify";
import type {
	CategoryInput,
	ICategory,
} from "../../infrastructure/entities/category";
import { TYPES } from "../../infrastructure/ioc/types";

@injectable()
export class CategoryService {
	constructor(
		@inject(TYPES.CategoryRepository)
		private categoryRepository: ICategory,
	) {}

	async getAll() {
		return this.categoryRepository.getAll();
	}

	async findOrCreate(categories: CategoryInput[]) {
		return this.categoryRepository.findOrCreate(categories);
	}
}
