import bearer from "@elysiajs/bearer";
import jwt from "@elysiajs/jwt";
import type { User } from "@prisma/client";
import { Elysia, t } from "elysia";
import type { ProductService } from "../../applications/services/product.service";
import { container } from "../../infrastructure/ioc/container";
import { TYPES } from "../../infrastructure/ioc/types";
import ErrorCode from "../../infrastructure/utils/errorCode";
import { hasErrorResult } from "../../infrastructure/utils/failure";

const productService = container.get<ProductService>(TYPES.ProductService);

const productRoute = new Elysia({ prefix: "/products" })
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
		async ({ query }) => {
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

			const result = await productService.getAll({
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
			const product = {
				...body,
				imageUrl: body.imageUrl || null,
				userId: (seller as User).id,
			};

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
				price: t.Number(),
				quantity: t.Number(),
				imageUrl: t.Optional(t.String()),
			}),
		},
	)
	.patch(
		"/:id",
		async ({ params, body, seller, set }) => {
			const { id } = params;
			const product = {
				...body,
				imageUrl: body.imageUrl || null,
				userId: (seller as User).id,
			};
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
				price: t.Number(),
				quantity: t.Number(),
				imageUrl: t.Optional(t.String()),
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
