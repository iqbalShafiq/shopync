import { inject, injectable } from "inversify";
import type {
	IProduct,
	ProductQueryParams,
	UpsertProduct,
} from "../../infrastructure/entities/product";
import { TYPES } from "../../infrastructure/ioc/types";
import type { Prisma } from "@prisma/client";

@injectable()
export class ProductService {
	constructor(
		@inject(TYPES.ProductRepository)
		private productRepository: IProduct,
	) {}

	async getAll(params: ProductQueryParams) {
		return this.productRepository.getAll(params);
	}

	async getById(id: string, select?: Prisma.UserSelect) {
		return this.productRepository.getById(id, select);
	}

	async getByUserId(params: ProductQueryParams) {
		return this.productRepository.getByUserId(params);
	}

	async create(product: UpsertProduct) {
		return this.productRepository.create(product);
	}

	async update(id: string, product: UpsertProduct) {
		return this.productRepository.update(id, product);
	}

	async delete(id: string) {
		return this.productRepository.delete(id);
	}
}
