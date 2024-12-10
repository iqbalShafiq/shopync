import bearer from "@elysiajs/bearer";
import jwt from "@elysiajs/jwt";
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
		const author = await jwt.verify(auth.value);
		return { author: author };
	})
	.onBeforeHandle(({ bearer, set, author }) => {
		if (!bearer) {
			set.status = 401;
			set.headers["WWW-Authenticate"] =
				`Bearer realm='sign', error="invalid_request"`;

			return {
				errorCode: ErrorCode.UNAUTHORIZED,
				message: "Unauthorized",
			};
		}

		if (!author) {
			set.status = 401;
			set.headers["WWW-Authenticate"] =
				`Bearer realm='sign', error="invalid_token"`;
			return {
				errorCode: ErrorCode.UNAUTHORIZED,
				message: "Unauthorized",
			};
		}

		console.log(author);
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
	);

export default productRoute;
