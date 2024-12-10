import type { Cart } from "@prisma/client";
import type { DeleteItem, ICart, UpsertItem } from "../entities/cart";
import ErrorCode from "../utils/errorCode";
import type { Failure } from "../utils/failure";
import { prisma } from "../utils/prisma";

export class CartRepository implements ICart {
	getByUserId(userId: string): Promise<Failure | Cart | null> {
		return prisma.cart.findUnique({
			where: {
				userId,
			},
		});
	}

	createCart(userId: string): Promise<Failure | Cart> {
		return prisma.cart.create({
			data: {
				userId,
			},
		});
	}

	addItem(request: UpsertItem): Promise<unknown | Failure> {
		const { cartId, productId, quantity } = request;
		return prisma.$transaction(async (prisma) => {
			const existingItem = await prisma.cartProduct.findUnique({
				where: {
					cartId_productId: {
						cartId,
						productId,
					},
				},
			});

			if (!existingItem) {
				return {
					errorCode: ErrorCode.NOT_FOUND,
					message: "Product not found",
				};
			}

			const product = await prisma.product.findUnique({
				where: { id: productId },
			});

			if (!product) {
				return {
					errorCode: ErrorCode.NOT_FOUND,
					message: "Product not found",
				};
			}

			const quantityDifference = quantity - existingItem.quantity;

			if (quantityDifference > product.quantity) {
				return {
					errorCode: ErrorCode.BAD_REQUEST,
					message: "Insufficient product quantity",
				};
			}

			await prisma.cartProduct.update({
				where: {
					cartId_productId: {
						cartId,
						productId,
					},
				},
				data: {
					quantity,
				},
			});
		});
	}

	async updateItem(request: UpsertItem): Promise<unknown | Failure> {
		const { cartId, productId, quantity } = request;
		const result = prisma.cartProduct.update({
			where: {
				cartId_productId: {
					cartId,
					productId,
				},
			},
			data: {
				quantity,
			},
		});

		if (!result) {
			return {
				errorCode: ErrorCode.NOT_FOUND,
				message: "Product not found",
			};
		}

		return result;
	}

	async removeItem(request: DeleteItem): Promise<unknown | Failure> {
		const { cartId, productId } = request;
		const cartProduct = await prisma.cartProduct.delete({
			where: {
				cartId_productId: {
					cartId,
					productId,
				},
			},
		});

		if (!cartProduct) {
			return {
				errorCode: ErrorCode.NOT_FOUND,
				message: "Product not found",
			};
		}

		return cartProduct;
	}
}
