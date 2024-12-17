import { Prisma, type Product } from "@prisma/client";
import { injectable } from "inversify";
import type {
	IProduct,
	ProductQueryParams,
	UpsertProduct,
} from "../entities/product";
import ErrorCode from "../utils/errorCode";
import type { Failure } from "../utils/failure";
import { getUpdatedProps } from "../utils/getUpdatedProps";
import { prisma } from "../utils/prisma";

@injectable()
export class ProductRepository implements IProduct {
	async getAll(
		params: ProductQueryParams,
	): Promise<PaginatedResult<Product> | Failure> {
		const { search, limit, page } = params;
		const take = limit || 10;
		const skip = (page || 0) * take;

		const where = search
			? {
					OR: [
						{
							name: {
								contains: search,
							},
						},
						{
							description: {
								contains: search,
							},
						},
					],
				}
			: {};

		const items = await prisma.product.findMany({
			where,
			take,
			skip,
		});

		const total = await prisma.product.count({
			where: {
				name: {
					contains: search,
				},
			},
		});

		return {
			items,
			total,
		};
	}

	async getById(id: string): Promise<Product | null> {
		return prisma.product.findUnique({
			where: {
				id,
			},
		});
	}

	async getByUserId(
		userId: string,
	): Promise<PaginatedResult<Product | Failure>> {
		const items = await prisma.product.findMany({
			where: {
				userId,
			},
		});

		const total = await prisma.product.count({
			where: {
				userId,
			},
		});

		return {
			items,
			total,
		};
	}

	async getByCartId(cartId: string): Promise<Product[] | null> {
		const cartProducts = await prisma.cartProduct.findMany({
			where: {
				cartId,
			},
			include: {
				product: true,
			},
		});
		return cartProducts.map((cp) => ({
			...cp.product,
			quantity: cp.quantity,
		}));
	}

	create(product: UpsertProduct): Promise<Product> {
		return prisma.product.create({
			data: product,
		});
	}

	async update(id: string, product: UpsertProduct): Promise<Product | Failure> {
		try {
			const updatedProps = getUpdatedProps(product);
			return prisma.product.update({
				where: {
					id,
				},
				data: updatedProps,
			});
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === "P2025"
			) {
				return {
					errorCode: ErrorCode.NOT_FOUND,
					message: "Note not found",
				};
			}

			return {
				errorCode: ErrorCode.BAD_REQUEST,
				message: "Bad request",
			};
		}
	}

	async delete(id: string): Promise<unknown | Failure> {
		const product = await prisma.product.delete({
			where: {
				id,
			},
		});

		if (!product) {
			return {
				errorCode: ErrorCode.NOT_FOUND,
				message: "Product not found",
			};
		}

		return product;
	}
}
