import { Prisma, type Product } from "@prisma/client";
import { injectable } from "inversify";
import type {
	IProduct,
	ProductQueryParams,
	UpsertProduct,
} from "../entities/product";
import ErrorCode from "../utils/errorCode";
import type { Failure } from "../utils/failure";
import { prisma } from "../utils/prisma";

@injectable()
export class ProductRepository implements IProduct {
	async getAll(params: ProductQueryParams): Promise<Failure | Product[]> {
		const { search, limit, page } = params;
		const take = limit || 10;
		const skip = (page || 0) * take;

		const where = search
			? {
					OR: [
						{
							name: {
								contains: search,
								mode: "insensitive",
							},
						},
						{
							description: {
								contains: search,
								mode: "insensitive",
							},
						},
					],
				}
			: {};

		return prisma.product.findMany({
			where,
			take,
			skip,
		});
	}

	async getById(id: string): Promise<Product | null> {
		return prisma.product.findUnique({
			where: {
				id,
			},
		});
	}

	getByUserId(userId: string): Promise<Product[] | null> {
		return prisma.product.findMany({
			where: {
				userId,
			},
		});
	}

	create(product: UpsertProduct): Promise<Product> {
		return prisma.product.create({
			data: product,
		});
	}

	async update(id: string, product: UpsertProduct): Promise<Product | Failure> {
		try {
			return prisma.product.update({
				where: {
					id,
				},
				data: product,
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
