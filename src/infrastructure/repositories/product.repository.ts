import { Prisma, type Product } from "@prisma/client";
import { injectable } from "inversify";
import type {
	IProduct,
	ProductQueryParams,
	UpsertProduct,
	UserWithCount,
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
		const { sellerId, search, limit, page } = params;
		const take = limit || 10;
		const skip = (page || 0) * take;

		const andClause = [];
		if (sellerId) {
			andClause.push({
				userId: {
					not: sellerId,
				},
			});
		}

		const where = {
			AND: andClause,
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
		};

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

	async getById(
		id: string,
		select?: Prisma.UserSelect,
	): Promise<(Product & { user: UserWithCount }) | null> {
		const product = await prisma.product.findUnique({
			where: {
				id,
			},
			include: {
				user: { select: { ...select, _count: true, password: false } },
				categories: {
					include: {
						category: true,
					},
				},
			},
		});

		if (product?.user) {
			const { _count, ...user } = product.user;
			const userWithCount: UserWithCount = {
				...user,
				count: _count,
			};

			return { ...product, user: userWithCount };
		}

		return null;
	}

	async getByUserId(
		params: ProductQueryParams,
	): Promise<PaginatedResult<Product | Failure>> {
		const { sellerId, search, limit, page, excludedProductId } = params;
		console.log(
			`sellerId: ${sellerId} | excludedProductId: ${excludedProductId}`,
		);

		const andClause = [];
		andClause.push({
			userId: sellerId,
		});
		if (excludedProductId) {
			andClause.push({
				id: {
					not: excludedProductId,
				},
			});
		}

		const orClause = [];
		orClause.push({
			name: {
				contains: search,
			},
		});
		orClause.push({
			description: {
				contains: search,
			},
		});

		const whereClause = {
			AND: andClause,
			OR: orClause,
		};

		const items = await prisma.product.findMany({
			where: whereClause,
		});

		const total = await prisma.product.count({
			where: whereClause,
		});

		return {
			items,
			total,
		};
	}

	async create(product: UpsertProduct): Promise<Product> {
		const { categories, ...productData } = product;

		return prisma.product.create({
			data: {
				...productData,
				categories: {
					create: categories.map((category) => ({
						category: {
							connectOrCreate: {
								where: { name: category.name },
								create: {
									name: category.name,
									description: category.description,
								},
							},
						},
					})),
				},
			},
			include: {
				categories: {
					include: {
						category: true,
					},
				},
			},
		});
	}

	// Update the update method:
	async update(id: string, product: UpsertProduct): Promise<Product | Failure> {
		try {
			const { categories, ...productData } = product;
			const updatedProps = getUpdatedProps(productData);

			// First delete existing category relationships
			await prisma.productsOnCategories.deleteMany({
				where: { productId: id },
			});

			return prisma.product.update({
				where: { id },
				data: {
					...updatedProps,
					categories: {
						create: categories.map((category) => ({
							category: {
								connectOrCreate: {
									where: { name: category.name },
									create: {
										name: category.name,
										description: category.description,
									},
								},
							},
						})),
					},
				},
				include: {
					categories: {
						include: {
							category: true,
						},
					},
				},
			});
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === "P2025"
			) {
				return {
					errorCode: ErrorCode.NOT_FOUND,
					message: "Product not found",
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
