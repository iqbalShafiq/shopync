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

		console.log(user);
	})
	.post(
		"/",
		async ({ body, user, set }) => {
			const result = await cartService.addItem((user as User).id, {
				cartId: body.cartId,
				productId: body.productId,
				quantity: body.quantity,
			});

			if (hasErrorResult(result)) {
				set.status = result.errorCode.valueOf();
				return result;
			}

			set.status = 201;
			return;
		},
		{
			beforeHandle: async ({ body, set }) => {
				const { cartId, productId, quantity } = body;
				if (!cartId || !productId || !quantity) {
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
				cartId: t.String(),
				productId: t.String(),
				quantity: t.Number(),
			}),
		},
	)
	.patch(
		"/",
		async ({ body, set }) => {
			const result = await cartService.updateItem({
				cartId: body.cartId,
				productId: body.productId,
				quantity: body.quantity,
			});

			if (hasErrorResult(result)) {
				set.status = result.errorCode.valueOf();
				return result;
			}

			return;
		},
		{
			beforeHandle: async ({ body, set }) => {
				const { cartId, productId, quantity } = body;
				if (!cartId || !productId || !quantity) {
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
				cartId: t.String(),
				productId: t.String(),
				quantity: t.Number(),
			}),
		},
	)
	.delete(
		"/",
		async ({ body, set }) => {
			const result = await cartService.removeItem({
				cartId: body.cartId,
				productId: body.productId,
				quantity: body.quantity,
			});

			if (hasErrorResult(result)) {
				set.status = result.errorCode.valueOf();
				return result;
			}

			return;
		},
		{
			beforeHandle: async ({ body, set }) => {
				const { cartId, productId } = body;
				if (!cartId || !productId) {
					set.status = 400;
					return {
						errorCode: ErrorCode.BAD_REQUEST,
						message: "Bad request",
					};
				}
			},
			detail: {
				tags: ["Cart"],
				description: "Delete cart",
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
				cartId: t.String(),
				productId: t.String(),
				quantity: t.Number(),
			}),
		},
	);

export default cartRoute;
