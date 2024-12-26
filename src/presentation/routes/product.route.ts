import { promises as fs } from "node:fs";
import { join } from "node:path";
import bearer from "@elysiajs/bearer";
import jwt from "@elysiajs/jwt";
import staticPlugin from "@elysiajs/static";
import type { User } from "@prisma/client";
import { Elysia, t } from "elysia";
import { nanoid } from "nanoid";
import type { ProductService } from "../../applications/services/product.service";
import { container } from "../../infrastructure/ioc/container";
import { TYPES } from "../../infrastructure/ioc/types";
import ErrorCode from "../../infrastructure/utils/errorCode";
import { hasErrorResult } from "../../infrastructure/utils/failure";

const productService = container.get<ProductService>(TYPES.ProductService);

const productRoute = new Elysia({ prefix: "/products" })
	.use(staticPlugin())
	.use(
		jwt({
			name: "jwt",
			secret: process.env.JWT_SECRET || "secret",
		}),
	)
	.use(bearer())
	.derive(async ({ jwt, headers }) => {
		const bearerToken = headers.authorization;
		const authToken = bearerToken?.split(" ")[1];
		const seller = await jwt.verify(authToken);
		return { seller: seller };
	})
	.onBeforeHandle(({ bearer, set, seller }) => {
		if (!bearer) {
			set.status = 401;
			set.headers["WWW-Authenticate"] =
				`Bearer realm='sign', error="invalid_request"`;

			return {
				errorCode: ErrorCode.UNAUTHORIZED,
				message: "Unauthorized",
			};
		}

		if (!seller) {
			set.status = 401;
			set.headers["WWW-Authenticate"] =
				`Bearer realm='sign', error="invalid_token"`;
			return {
				errorCode: ErrorCode.UNAUTHORIZED,
				message: "Unauthorized",
			};
		}

		console.log(seller);
	})
	.get(
		"/",
		async ({ query, seller }) => {
			const limit = Number.parseInt(query.limit || "10");
			const page = Number.parseInt(query.page || "0");
			const search = query.search || "";
			const userId = query.userId;
			const cartId = query.cartId;

			if (userId) {
				const result = await productService.getByUserId(userId);
				return {
					data: result.items,
					pagination: {
						currentPage: page,
						totalPages: Math.ceil(result.total / limit),
						totalItems: result.total,
						itemsPerPage: limit,
					},
				};
			}

			if (cartId) {
				const result = await productService.getByCartId(cartId);
				return {
					data: result,
				};
			}

			const sellerId = (seller as User).id;
			const result = await productService.getAll({
				sellerId,
				limit,
				page,
				search,
			});

			if (hasErrorResult(result)) {
				return result;
			}

			return {
				data: result.items,
				pagination: {
					currentPage: page,
					totalPages: Math.ceil(result.total / limit),
					totalItems: result.total,
					itemsPerPage: limit,
				},
			};
		},
		{
			detail: {
				tags: ["Product"],
				description: "Get products",
				responses: {
					200: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										data: {
											type: "array",
											items: {
												type: "object",
												properties: {
													id: { type: "number" },
													name: { type: "string" },
													description: { type: "string" },
													price: { type: "number" },
													quantity: { type: "number" },
													userId: { type: "string" },
												},
											},
										},
										pagination: {
											type: "object",
											properties: {
												currentPage: { type: "number" },
												totalPages: { type: "number" },
												totalItems: { type: "number" },
												itemsPerPage: { type: "number" },
											},
										},
									},
								},
							},
						},
					},
				},
			},
			query: t.Object({
				limit: t.Optional(t.String()),
				page: t.Optional(t.String()),
				search: t.Optional(t.String()),
				userId: t.Optional(t.String()),
				cartId: t.Optional(t.String()),
			}),
		},
	)
	.get(
		"/:id",
		async ({ params, set }) => {
			const id = params.id;
			const result = await productService.getById(id, {
				id: true,
				name: true,
				password: false,
			});

			if (result === null) {
				set.status = 404;
				return {
					errorCode: ErrorCode.NOT_FOUND,
					message: "Product not found",
				};
			}

			return { data: result };
		},
		{
			detail: {
				tags: ["Product"],
				description: "Get product by id",
				responses: {
					200: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										id: { type: "number" },
										name: { type: "string" },
										description: { type: "string" },
										price: { type: "number" },
										quantity: { type: "number" },
										userId: { type: "string" },
									},
								},
							},
						},
					},
					404: {
						description: "Product not found",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										errorCode: { type: "string" },
										message: { type: "string" },
									},
								},
							},
						},
					},
				},
			},
			params: t.Object({
				id: t.String(),
			}),
		},
	)
	.post(
		"/",
		async ({ body, seller, set }) => {
			let imageUrl = null;

			if (body.image) {
				// Generate unique filename
				const ext = body.image.name.split(".").pop();
				const filename = `${nanoid()}.${ext}`;

				// Create directory if not exists
				const uploadDir = join(process.cwd(), "public", "uploads");
				await fs.mkdir(uploadDir, { recursive: true });

				// Save file to disk
				const filepath = join(uploadDir, filename);
				const arrayBuffer = await body.image.arrayBuffer();
				await Bun.write(filepath, new Uint8Array(arrayBuffer));

				imageUrl = `/uploads/${filename}`;
			}

			const product = {
				...body,
				imageUrl,
				userId: (seller as User).id,
				price: Number(body.price),
				quantity: Number(body.quantity),
			};
			product.image = undefined;

			set.status = 201;
			const result = await productService.create(product);
			return { data: result };
		},
		{
			detail: {
				tags: ["Product"],
				description: "Create a product",
				responses: {
					201: {
						description: "Created",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										id: { type: "number" },
										name: { type: "string" },
										description: { type: "string" },
										price: { type: "number" },
										quantity: { type: "number" },
										userId: { type: "string" },
									},
								},
							},
						},
					},
				},
			},
			body: t.Object({
				name: t.String(),
				description: t.String(),
				price: t.String(),
				quantity: t.String(),
				image: t.Optional(t.File()),
			}),
		},
	)
	.patch(
		"/:id",
		async ({ params, body, seller, set }) => {
			const { id } = params;

			let imageUrl = body.imageUrl;

			if (body.image) {
				// remove old image
				if (imageUrl) {
					const uploadDir = join(process.cwd(), "public", "uploads");
					const filename = imageUrl.split("/").pop();

					if (filename) {
						const filepath = join(uploadDir, filename);
						await fs.unlink(filepath);
					}
				}

				// Generate unique filename
				const ext = body.image.name.split(".").pop();
				const newFileName = `${nanoid()}.${ext}`;

				// Create directory if not exists
				const uploadDir = join(process.cwd(), "public", "uploads");
				await fs.mkdir(uploadDir, { recursive: true });

				// Save file to disk
				const newFilepath = join(uploadDir, newFileName);
				const arrayBuffer = await body.image.arrayBuffer();
				await Bun.write(newFilepath, new Uint8Array(arrayBuffer));

				imageUrl = `/uploads/${newFileName}`;
			}

			const product = {
				...body,
				price: Number(body.price),
				quantity: Number(body.quantity),
				imageUrl: imageUrl || null,
				userId: (seller as User).id,
			};
			product.image = undefined;

			const result = await productService.update(id, product);

			if (hasErrorResult(result)) {
				set.status = result.errorCode.valueOf();
				return result;
			}

			return { data: result };
		},
		{
			detail: {
				tags: ["Product"],
				description: "Update a product",
				responses: {
					200: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										id: { type: "number" },
										name: { type: "string" },
										description: { type: "string" },
										price: { type: "number" },
										quantity: { type: "number" },
										userId: { type: "string" },
									},
								},
							},
						},
					},
					404: {
						description: "Product not found",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										errorCode: { type: "string" },
										message: { type: "string" },
									},
								},
							},
						},
					},
					400: {
						description: "Bad request",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										errorCode: { type: "string" },
										message: { type: "string" },
									},
								},
							},
						},
					},
				},
			},
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				id: t.String(),
				name: t.String(),
				description: t.String(),
				price: t.String(),
				quantity: t.String(),
				imageUrl: t.Optional(t.String()),
				image: t.Optional(t.File()),
			}),
		},
	)
	.delete(
		"/:id",
		async ({ params, set }) => {
			const id = params.id;
			const result = await productService.delete(id);

			if (hasErrorResult(result)) {
				set.status = result.errorCode.valueOf();
				return result;
			}

			return { data: result };
		},
		{
			detail: {
				tags: ["Product"],
				description: "Delete a product",
				responses: {
					200: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										message: { type: "string" },
									},
								},
							},
						},
					},
					404: {
						description: "Product not found",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										errorCode: { type: "string" },
										message: { type: "string" },
									},
								},
							},
						},
					},
				},
			},
			params: t.Object({
				id: t.String(),
			}),
		},
	);

export default productRoute;
