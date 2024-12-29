import { inject, injectable } from "inversify";
import type {
	CartQueryParams,
	ICart,
	UpsertItem,
} from "../../infrastructure/entities/cart";
import { TYPES } from "../../infrastructure/ioc/types";

@injectable()
export class CartService {
	constructor(
		@inject(TYPES.CartRepository)
		private cartRepository: ICart,
	) {}

	async getItems(params: CartQueryParams) {
		return await this.cartRepository.get(params);
	}

	async addItem(request: UpsertItem) {
		return this.cartRepository.addItem(request);
	}

	async updateItem(request: UpsertItem) {
		return this.cartRepository.updateItem(request);
	}
}
