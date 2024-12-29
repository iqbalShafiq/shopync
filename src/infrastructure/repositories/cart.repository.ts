import type {
	CartQueryParams,
	ICart,
	ProductInCart,
	UpsertItem,
} from "../entities/cart";
import ErrorCode from "../utils/errorCode";
import type { Failure } from "../utils/failure";
import { prisma } from "../utils/prisma";

export class CartRepository implements ICart {
	async get(
		params: CartQueryParams,
	): Promise<Failure | ProductInCart[] | null> {
		const { userId, productId } = params;
		const whereClause: { userId: string; productId?: string } = { userId };

		if (productId) {
			whereClause.productId = productId;
		}

		const result = await prisma.productInCart.findMany({
			where: whereClause,
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
				const totalItem = productInCart.quantity + quantity;
				const updateRequest = {
					userId,
					productId,
					quantity: totalItem,
				};
				return await this.updateItem(updateRequest);
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

			console.log(`Removing ${quantity} product ${productId} from cart`);
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
