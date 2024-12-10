import type { Cart } from "@prisma/client";
import { inject, injectable } from "inversify";
import type { ICart, UpsertItem } from "../../infrastructure/entities/cart";
import { TYPES } from "../../infrastructure/ioc/types";

@injectable()
export class CartService {
	constructor(
		@inject(TYPES.CartRepository)
		private cartRepository: ICart,
	) {}

	async addItem(userId: string, request: UpsertItem) {
		let cart = await this.cartRepository.getByUserId(userId);
		if (!cart) {
			cart = await this.cartRepository.createCart(userId);
		}

		await this.cartRepository.addItem({
			...request,
			cartId: (cart as Cart).id,
		});
	}

	async updateItem(request: UpsertItem) {
		await this.cartRepository.updateItem(request);
	}

	async removeItem(request: UpsertItem) {
		await this.cartRepository.removeItem(request);
	}
}
