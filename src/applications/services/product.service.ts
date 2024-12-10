import { inject, injectable } from "inversify";
import type {
	IProduct,
	ProductQueryParams,
	UpsertProduct,
} from "../../infrastructure/entities/product";
import { TYPES } from "../../infrastructure/ioc/types";

@injectable()
export class ProductService {
	constructor(
		@inject(TYPES.ProductRepository)
		private productRepository: IProduct,
	) {}

	async getAll(params: ProductQueryParams) {
		return this.productRepository.getAll(params);
	}

	async getById(id: string) {
		return this.productRepository.getById(id);
	}

	async getByUserId(userId: string) {
		return this.productRepository.getByUserId(userId);
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
