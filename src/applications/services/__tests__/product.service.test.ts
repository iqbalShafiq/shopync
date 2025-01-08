import { expect, test, mock, describe } from "bun:test";
import { ProductService } from "../product.service";
import type { Product } from "@prisma/client";
import type {
	IProduct,
	ProductQueryParams,
	UpsertProduct,
} from "../../../infrastructure/entities/product";

const mockProductData = {
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

const mockProductRepository: IProduct = {
	getAll: mock(async () => ({
		items: [],
		total: 0,
	})),
	getById: mock(async () => null),
	getByUserId: mock(async () => ({
		items: [],
		total: 0,
	})),
	create: mock(async () => mockProductData as Product),
	update: mock(async () => mockProductData as Product),
	delete: mock(async () => mockProductData),
};

describe("ProductService", () => {
	const productService = new ProductService(mockProductRepository);

	describe("getAll", () => {
		test("should return paginated products", async () => {
			const mockProducts = [
				{
					...mockProductData,
					id: "cl1234567",
				},
				{
					...mockProductData,
					id: "cl1234568",
					name: "Product 2",
				},
			];

			mockProductRepository.getAll = mock(async () => ({
				items: mockProducts,
				total: mockProducts.length,
			}));

			const params: ProductQueryParams = {
				sellerId: "user123",
				limit: 10,
				page: 0,
			};

			const result = await productService.getAll(params);

			expect(result).toHaveProperty("items");
			expect(result).toHaveProperty("total");
			expect(mockProductRepository.getAll).toHaveBeenCalledWith(params);
		});
	});

	describe("getById", () => {
		test("should return product with user details", async () => {
			const mockProduct = {
				...mockProductData,
				user: {
					id: "user123",
					email: "test@example.com",
					name: "Test User",
					count: {
						products: 1,
						productInCarts: 0,
					},
				},
				categories: [
					{
						category: {
							id: "cat123",
							name: "Test Category",
							description: "Test Category Description",
						},
					},
				],
			};

			mockProductRepository.getById = mock(async () => mockProduct);

			const result = await productService.getById("cl1234567");

			expect(result).toEqual(mockProduct);
			expect(mockProductRepository.getById).toHaveBeenCalledWith(
				"cl1234567",
				undefined,
			);
		});
	});

	describe("create", () => {
		test("should create new product", async () => {
			const mockProduct: UpsertProduct = {
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

			const mockCreatedProduct = {
				...mockProduct,
				id: "cl1234567",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockProductRepository.create = mock(
				async () => mockCreatedProduct as Product,
			);

			const result = await productService.create(mockProduct);

			expect(result).toEqual(mockCreatedProduct);
			expect(mockProductRepository.create).toHaveBeenCalledWith(mockProduct);
		});
	});
});
