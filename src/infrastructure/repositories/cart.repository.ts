import type { Product } from "@prisma/client";
import type { ICart, RemoveItem, UpsertItem } from "../entities/cart";
import ErrorCode from "../utils/errorCode";
import type { Failure } from "../utils/failure";
import { prisma } from "../utils/prisma";

export class CartRepository implements ICart {
	async getByUserId(userId: string): Promise<Failure | Product[] | null> {
		const result = await prisma.productInCart.findMany({
			where: {
				userId,
			},
			include: {
				product: true,
			},
		});

		return result.map((item) => item.product);
	}

	addItem(request: UpsertItem): Promise<unknown | Failure> {
		const { userId, productId, quantity } = request;
		return prisma.$transaction(async (prisma) => {
			const product = await prisma.product.findUnique({
				where: { id: productId },
			});

			if (!product) {
				return {
					errorCode: ErrorCode.NOT_FOUND,
					message: "Product not found",
				};
			}

			if (quantity > product.quantity) {
				return {
					errorCode: ErrorCode.BAD_REQUEST,
					message: "Insufficient product quantity",
				};
			}

			await prisma.productInCart.create({
				data: {
					userId,
					productId,
					quantity,
				},
			});
		});
	}

	async updateItem(request: UpsertItem): Promise<unknown | Failure> {
		const { userId, productId, quantity } = request;
		return prisma.$transaction(async (prisma) => {
			const product = await prisma.product.findUnique({
				where: { id: productId },
			});

			if (!product) {
				return {
					errorCode: ErrorCode.NOT_FOUND,
					message: "Product not found",
				};
			}

			if (quantity > product.quantity) {
				return {
					errorCode: ErrorCode.BAD_REQUEST,
					message: "Insufficient product quantity",
				};
			}

			const result = prisma.productInCart.update({
				where: {
					userId_productId: {
						userId,
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
		});
	}

	async removeItem(request: RemoveItem): Promise<unknown | Failure> {
		const { userId, productId } = request;
		const cartProduct = await prisma.productInCart.delete({
			where: {
				userId_productId: {
					userId,
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
