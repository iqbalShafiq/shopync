import bearer from "@elysiajs/bearer";
import jwt from "@elysiajs/jwt";
import type { User } from "@prisma/client";
import { Elysia, t } from "elysia";
import type { CartService } from "../../applications/services/cart.service";
import { container } from "../../infrastructure/ioc/container";
import { TYPES } from "../../infrastructure/ioc/types";
import ErrorCode from "../../infrastructure/utils/errorCode";
import { hasErrorResult } from "../../infrastructure/utils/failure";

const cartService = container.get<CartService>(TYPES.CartService);

const cartRoute = new Elysia({ prefix: "/carts" })
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
		const user = await jwt.verify(authToken);
		return { user: user };
	})
	.onBeforeHandle(({ bearer, set, user }) => {
		if (!bearer) {
			set.status = 401;
			set.headers["WWW-Authenticate"] =
				`Bearer realm='sign', error="invalid_request"`;

			return {
				errorCode: ErrorCode.UNAUTHORIZED,
				message: "Unauthorized",
			};
		}

		if (!user) {
			set.status = 401;
			set.headers["WWW-Authenticate"] =
				`Bearer realm='sign', error="invalid_token"`;
			return {
				errorCode: ErrorCode.UNAUTHORIZED,
				message: "Unauthorized",
			};
		}
	})
	.get(
		"/",
		async ({ query, user, set }) => {
			const productId = query.productId as string | undefined;
			const result = await cartService.getItems({
				userId: (user as User).id,
				productId,
			});

			if (result === null) {
				set.status = 404;
				return {
					errorCode: ErrorCode.NOT_FOUND,
					message: "You haven't added any product to cart",
				};
			}

			return { data: result };
		},
		{
			detail: {
				tags: ["Cart"],
				description: "Get cart by user ID",
				responses: {
					200: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "array",
									items: {
										type: "object",
										properties: {
											quantity: { type: "number" },
											product: {
												type: "object",
												properties: {
													id: { type: "string" },
													name: { type: "string" },
													price: { type: "number" },
													quantity: { type: "number" },
												},
											},
										},
									},
								},
							},
						},
					},
					404: {
						description: "Cart not found",
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
				query: t.Object({
					productId: t.Optional(t.String()),
				}),
			},
		},
	)
	.post(
		"/",
		async ({ body, user, set }) => {
			const result = await cartService.addItem({
				userId: (user as User).id,
				productId: body.productId,
				quantity: body.quantity,
			});

			if (hasErrorResult(result)) {
				set.status = result.errorCode.valueOf();
				return result;
			}

			set.status = 204;
			return;
		},
		{
			beforeHandle: async ({ body, set }) => {
				const { productId, quantity } = body;
				if (!productId || !quantity) {
					set.status = 400;
					return {
						errorCode: ErrorCode.BAD_REQUEST,
						message: "Bad request",
					};
				}
			},
			detail: {
				tags: ["Cart"],
				description: "Create cart",
			},
			body: t.Object({
				productId: t.String(),
				quantity: t.Number(),
			}),
		},
	)
	.patch(
		"/",
		async ({ body, user, set }) => {
			const result = await cartService.updateItem({
				userId: (user as User).id,
				productId: body.productId,
				quantity: body.quantity,
			});

			if (hasErrorResult(result)) {
				set.status = result.errorCode.valueOf();
				return result;
			}

			set.status = 204;
			return;
		},
		{
			beforeHandle: async ({ body, set }) => {
				const { productId, quantity } = body;
				if (!productId || quantity === undefined) {
					set.status = 400;
					return {
						errorCode: ErrorCode.BAD_REQUEST,
						message: "Bad request",
					};
				}
			},
			detail: {
				tags: ["Cart"],
				description: "Update cart",
				responses: {
					200: {
						description: "Success",
					},
					404: {
						description: "Cart not found",
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
				productId: t.String(),
				quantity: t.Number(),
			}),
		},
	);

export default cartRoute;
