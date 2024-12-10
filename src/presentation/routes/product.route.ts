import bearer from "@elysiajs/bearer";
import jwt from "@elysiajs/jwt";
import type { User } from "@prisma/client";
import { Elysia, t } from "elysia";
import type { ProductService } from "../../applications/services/product.service";
import { container } from "../../infrastructure/ioc/container";
import { TYPES } from "../../infrastructure/ioc/types";
import ErrorCode from "../../infrastructure/utils/errorCode";

const productService = container.get<ProductService>(TYPES.ProductService);

const productRoute = new Elysia({ prefix: "/product" })
	.use(
		jwt({
			name: "jwt",
			secret: process.env.JWT_SECRET || "secret",
		}),
	)
	.use(bearer())
	.derive(async ({ jwt, cookie: { auth } }) => {
		const seller = await jwt.verify(auth.value);
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
			const page = Number.parseInt(query.page || "1");
			const search = query.search || "";

			return await productService.getAll({
				limit,
				page,
				search,
			});
		},
		{
			detail: {
				tags: ["Product"],
				description: "Get all product",
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
			}),
		},
	)
	.get(
		"/:id",
		async ({ params }) => {
			const id = params.id;
			return await productService.getById(id);
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
	.get(
		"/user/:userId",
		async ({ params }) => {
			const userId = params.userId;
			return await productService.getByUserId(userId);
		},
		{
			detail: {
				tags: ["Product"],
				description: "Get product by user id",
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
				userId: t.String(),
			}),
		},
	)
	.post(
		"/",
		async ({ body, seller }) => {
			const product = {
				...body,
				imageUrl: body.imageUrl || null,
				userId: (seller as User).id,
			};

			return await productService.create(product);
		},
		{
			detail: {
				tags: ["Product"],
				description: "Create a product",
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
		"/",
		async ({ body, seller }) => {
			const product = {
				...body,
				imageUrl: body.imageUrl || null,
				userId: (seller as User).id,
			};

			return await productService.update(body.id, product);
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
			body: t.Object({
				id: t.String(),
				name: t.String(),
				description: t.String(),
				price: t.Number(),
				quantity: t.Number(),
				imageUrl: t.Optional(t.String()),
			}),
		},
	);

export default productRoute;
