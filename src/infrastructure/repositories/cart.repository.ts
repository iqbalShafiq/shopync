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

	upsertItem(request: UpsertItem): Promise<unknown | Failure> {
		const { userId, productId, quantity, increment } = request;
		return prisma.$transaction(async (prisma) => {
			// Check if product exists
			const product = await prisma.product.findUnique({
				where: { id: productId },
			});

			if (!product) {
				return {
					errorCode: ErrorCode.NOT_FOUND,
					message: "Product not found",
				};
			}

			// Remove from cart if quantity is 0
			if (quantity === 0) {
				return this.removeFromCart(userId, productId);
			}

			if (increment) {
				const productInCart = await prisma.productInCart.findUnique({
					where: {
						userId_productId: {
							userId,
							productId,
						},
					},
				});

				if (productInCart) {
					const newQuantity = productInCart.quantity + quantity;
					if (newQuantity > product.quantity) {
						return {
							errorCode: ErrorCode.BAD_REQUEST,
							message: `Cannot add ${quantity} items. Current stock is ${product.quantity}, and you already have ${productInCart?.quantity || 0} in your cart.`,
						};
					}

					return prisma.productInCart.update({
						where: {
							userId_productId: {
								userId,
								productId,
							},
						},
						data: {
							quantity: newQuantity,
						},
					});
				}
			}

			// Stock validation
			if (quantity > product.quantity) {
				return {
					errorCode: ErrorCode.BAD_REQUEST,
					message: "Insufficient product quantity",
				};
			}

			// Upsert item to cart
			return prisma.productInCart.upsert({
				where: {
					userId_productId: {
						userId,
						productId,
					},
				},
				update: {
					quantity: quantity,
				},
				create: {
					userId,
					productId,
					quantity,
				},
			});
		});
	}

	async removeFromCart(
		userId: string,
		productId: string,
	): Promise<unknown | Failure> {
		try {
			return await prisma.productInCart.delete({
				where: {
					userId_productId: {
						userId,
						productId,
					},
				},
			});
		} catch (error) {
			return {
				errorCode: ErrorCode.NOT_FOUND,
				message: "Product not found in cart",
			};
		}
	}
}
