import { beforeEach, describe, expect, mock, test } from "bun:test";
import { type Category, Prisma, type Product } from "@prisma/client";
import type { ProductQueryParams, UpsertProduct } from "../../entities/product";
import ErrorCode from "../../utils/errorCode";
import { ProductRepository } from "../product.repository";
import TransactionClient = Prisma.TransactionClient;

type MockPrismaProduct = Product & {
	categories?: {
		category: Category;
	}[];
};

type PaginatedResult<T> = {
	items: T[];
	total: number;
};

const mockPrismaProduct: MockPrismaProduct = {
	id: "cl1234567",
	name: "Test Product",
	description: "Test Description",
	price: 100.0,
	quantity: 10,
	imageUrl: null,
	userId: "user123",
	createdAt: new Date(),
	updatedAt: new Date(),
};

describe("ProductRepository", () => {
	let productRepository: ProductRepository;

	beforeEach(() => {
		productRepository = new ProductRepository();
	});

	describe("getAll", () => {
		test("should return paginated products with categories", async () => {
			// Prepare mock data
			const mockProductsWithCategories: MockPrismaProduct[] = [
				{
					...mockPrismaProduct,
					categories: [
						{
							category: {
								id: "cat123",
								name: "Test Category",
								description: "Test Category Description",
								createdAt: new Date(),
								updatedAt: new Date(),
							},
						},
					],
				},
			];

			// Setup mock implementations
			const mockFindMany = mock<() => Promise<MockPrismaProduct[]>>(
				async () => mockProductsWithCategories,
			);

			const mockCount = mock<() => Promise<number>>(
				async () => mockProductsWithCategories.length,
			);

			// Override prisma mock
			mock.module("../../../infrastructure/utils/prisma", () => ({
				prisma: {
					product: {
						findMany: mockFindMany,
						count: mockCount,
					},
				},
			}));

			const params: ProductQueryParams = {
				sellerId: "user123",
				search: "",
				limit: 10,
				page: 0,
			};

			// Execute the method
			const result = (await productRepository.getAll(
				params,
			)) as PaginatedResult<MockPrismaProduct>;

			// Assertions
			expect(result).toBeDefined();
			expect(Array.isArray(result.items)).toBe(true);
			expect(result.items.length).toBe(1);
			expect(result.items[0]).toEqual(mockProductsWithCategories[0]);
			expect(result.total).toBe(mockProductsWithCategories.length);

			// Verify specific properties
			const firstItem = result.items[0];
			expect(firstItem).toHaveProperty("id", "cl1234567");
			expect(firstItem).toHaveProperty("name", "Test Product");
			expect(firstItem).toHaveProperty("price", 100.0);
			expect(firstItem).toHaveProperty("quantity", 10);
			expect(firstItem.categories).toBeDefined();
			expect(firstItem.categories?.[0].category.name).toBe("Test Category");
		});
	});

	describe("create", () => {
		test("should create product with categories", async () => {
			// Prepare input data
			const newProduct: UpsertProduct = {
				name: "New Product",
				description: "New Product Description",
				price: 100.0,
				quantity: 10,
				userId: "user123",
				imageUrl: null,
				categories: [
					{
						name: "Test Category",
						description: "Test Category Description",
					},
				],
			};

			// Prepare expected result
			const mockCreatedProduct: MockPrismaProduct = {
				id: "cl1234567",
				name: "New Product",
				description: "New Product Description",
				price: 100.0,
				quantity: 10,
				userId: "user123",
				imageUrl: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				categories: [
					{
						category: {
							id: "cat123",
							name: "Test Category",
							description: "Test Category Description",
							createdAt: new Date(),
							updatedAt: new Date(),
						},
					},
				],
			};

			// Setup mock
			const mockCreate = mock<() => Promise<MockPrismaProduct>>(
				async () => mockCreatedProduct,
			);

			// Override prisma mock
			mock.module("../../../infrastructure/utils/prisma", () => ({
				prisma: {
					product: {
						create: mockCreate,
					},
				},
			}));

			// Execute and assert
			const result = await productRepository.create(newProduct);

			expect(result).toBeDefined();
			expect(result.id).toBe(mockCreatedProduct.id);
			expect(result.name).toBe(newProduct.name);
			expect(result.price).toBe(newProduct.price);
		});
	});

	describe("update", () => {
		test("should update product successfully", async () => {
			// Prepare input data
			const updateProduct: UpsertProduct = {
				name: "Updated Product",
				description: "Updated Description",
				price: 150.0,
				quantity: 5,
				userId: "user123",
				imageUrl: null,
				categories: [
					{
						name: "Updated Category",
						description: "Updated Category Description",
					},
				],
			};

			// Prepare expected result
			const mockUpdatedProduct: MockPrismaProduct = {
				id: "cl1234567",
				name: "Updated Product",
				description: "Updated Description",
				price: 150.0,
				quantity: 5,
				userId: "user123",
				imageUrl: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				categories: [
					{
						category: {
							id: "cat123",
							name: "Updated Category",
							description: "Updated Category Description",
							createdAt: new Date(),
							updatedAt: new Date(),
						},
					},
				],
			};

			// Setup mocks
			const mockDeleteMany = mock<() => Promise<Prisma.BatchPayload>>(
				async () => ({ count: 1 }),
			);

			const mockUpdate = mock<() => Promise<MockPrismaProduct>>(
				async () => mockUpdatedProduct,
			);

			// Override prisma mock
			mock.module("../../../infrastructure/utils/prisma", () => ({
				prisma: {
					product: {
						update: mockUpdate,
					},
					productsOnCategories: {
						deleteMany: mockDeleteMany,
					},
				},
			}));

			// Execute and assert
			const result = await productRepository.update("cl1234567", updateProduct);

			expect(result).not.toHaveProperty("errorCode");
			expect(result).toEqual(mockUpdatedProduct);
		});

		test("should handle product not found error", async () => {
			// Prepare input data
			const updateProduct: UpsertProduct = {
				name: "Updated Product",
				description: "Updated Description",
				price: 150.0,
				quantity: 5,
				userId: "user123",
				imageUrl: null,
				categories: [],
			};

			// Setup mock to throw error
			const mockUpdate = mock<() => Promise<MockPrismaProduct>>(() => {
				throw new Prisma.PrismaClientKnownRequestError("Record not found", {
					code: "P2025",
					clientVersion: "5.0.0",
				});
			});
			const mockDeleteMany = mock<() => Promise<Prisma.BatchPayload>>(
				async () => ({ count: 0 }),
			);

			// Override prisma mock
			mock.module("../../../infrastructure/utils/prisma", () => ({
				prisma: {
					product: {
						update: mockUpdate,
					},
					productsOnCategories: {
						deleteMany: mockDeleteMany,
					},
				},
			}));

			// Execute and assert
			const result = await productRepository.update(
				"nonexistent",
				updateProduct,
			);

			expect(result).toHaveProperty("errorCode", ErrorCode.NOT_FOUND);
			expect(result).toHaveProperty("message", "Product not found");
		});
	});

	describe("delete", () => {
		test("should delete product successfully", async () => {
			// Prepare expected result
			const mockDeletedProduct: MockPrismaProduct = {
				...mockPrismaProduct,
				id: "cl1234567",
			};

			type TransactionClient = {
				productsOnCategories: {
					deleteMany: (params: { where: { productId: string } }) => Promise<{ count: number }>;
				};
				productInCart: {
					deleteMany: (params: { where: { productId: string } }) => Promise<{ count: number }>;
				};
				product: {
					delete: (params: { where: { id: string } }) => Promise<MockPrismaProduct>;
				};
			};

			// Setup mocks for transaction
			const mockTransaction = mock<
				<T>(callback: (tx: TransactionClient) => Promise<T>) => Promise<T>
			>(
				async (callback) => callback({
					productsOnCategories: {
						deleteMany: async () => ({ count: 1 })
					},
					productInCart: {
						deleteMany: async () => ({ count: 1 })
					},
					product: {
						delete: async () => mockDeletedProduct
					}
				})
			);

			// Override prisma mock with transaction support
			mock.module("../../../infrastructure/utils/prisma", () => ({
				prisma: {
					$transaction: mockTransaction
				}
			}));

			// Execute and assert
			const result = await productRepository.delete("cl1234567");

			expect(result).toEqual(mockDeletedProduct);
		});

		test("should handle product not found on delete", async () => {
			// Setup mock to throw error during transaction
			const mockTransaction = mock<
				<T>(callback: (tx: TransactionClient) => Promise<T>) => Promise<T>
			>(
				async () => {
					throw new Prisma.PrismaClientKnownRequestError("Record not found", {
						code: "P2025",
						clientVersion: "5.0.0",
					});
				}
			);

			// Override prisma mock
			mock.module("../../../infrastructure/utils/prisma", () => ({
				prisma: {
					$transaction: mockTransaction
				}
			}));

			// Execute and assert
			const result = await productRepository.delete("nonexistent");

			expect(result).toHaveProperty("errorCode", ErrorCode.NOT_FOUND);
			expect(result).toHaveProperty("message", "Product not found");
		});

		test("should handle cascade deletion errors", async () => {
			// Setup mock to throw a foreign key constraint error
			const mockTransaction = mock<
				<T>(callback: (tx: TransactionClient) => Promise<T>) => Promise<T>
			>(
				async () => {
					throw new Prisma.PrismaClientKnownRequestError("Foreign key constraint failed", {
						code: "P2003",
						clientVersion: "5.0.0",
					});
				}
			);

			// Override prisma mock
			mock.module("../../../infrastructure/utils/prisma", () => ({
				prisma: {
					$transaction: mockTransaction
				}
			}));

			// Execute and assert
			const result = await productRepository.delete("cl1234567");

			expect(result).toHaveProperty("errorCode", ErrorCode.BAD_REQUEST);
			expect(result).toHaveProperty("message", expect.stringContaining("Database error"));
		});
	});
});
