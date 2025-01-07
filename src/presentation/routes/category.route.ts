import bearer from "@elysiajs/bearer";
import jwt from "@elysiajs/jwt";
import { Elysia } from "elysia";
import type { CategoryService } from "../../applications/services/category.service";
import { container } from "../../infrastructure/ioc/container";
import { TYPES } from "../../infrastructure/ioc/types";
import ErrorCode from "../../infrastructure/utils/errorCode";

const categoryService = container.get<CategoryService>(TYPES.CategoryService);

const categoryRoute = new Elysia({ prefix: "/categories" })
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
	})
	.get(
		"/",
		async () => {
			const categories = await categoryService.getAll();
			return { data: categories };
		},
		{
			detail: {
				tags: ["Category"],
				description: "Get all categories",
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
											id: { type: "string" },
											name: { type: "string" },
											description: { type: "string" },
										},
									},
								},
							},
						},
					},
				},
			},
		},
	);

export default categoryRoute;
