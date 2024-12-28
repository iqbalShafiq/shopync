import type { ICart, ProductInCart, UpsertItem } from "../entities/cart";
import ErrorCode from "../utils/errorCode";
import type { Failure } from "../utils/failure";
import { prisma } from "../utils/prisma";

export class CartRepository implements ICart {
	async getByUserId(userId: string): Promise<Failure | ProductInCart[] | null> {
		const result = await prisma.productInCart.findMany({
			where: {
				userId,
			},
			include: {
				product: true,
			},
		});

		return result.map((item) => ({
			quantity: item.quantity,
			product: item.product,
		}));
	}

	addItem(request: UpsertItem): Promise<unknown | Failure> {
		const { userId, productId, quantity } = request;
		return prisma.$transaction(async (prisma) => {
			const productInCart = await prisma.productInCart.findUnique({
				where: {
					userId_productId: {
						userId,
						productId,
					},
				},
			});

			if (productInCart) {
				return await this.updateItem(request);
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

			if (quantity === 0) {
				const result = prisma.productInCart.delete({
					where: {
						userId_productId: {
							userId,
							productId,
						},
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
}
