import jwt from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import type { AuthService } from "../../applications/services/auth.service";
import { container } from "../../infrastructure/ioc/container";
import { TYPES } from "../../infrastructure/ioc/types";
import ErrorCode from "../../infrastructure/utils/errorCode";
import {
	type Failure,
	hasErrorResult,
} from "../../infrastructure/utils/failure";

const authService = container.get<AuthService>(TYPES.AuthService);

const authRoute = new Elysia({ prefix: "/auth" })
	.use(
		jwt({
			name: "jwt",
			secret: process.env.JWT_SECRET || "secret",
		}),
	)
	.post(
		"/register",
		async ({ body, set }) => {
			const result = await authService.register({
				email: body.email,
				password: body.password,
				name: body.name,
			});
			if (hasErrorResult(result)) {
				const failureResult = result as Failure;
				set.status = failureResult.errorCode.valueOf();
				return failureResult;
			}

			return {
				data: result,
			};
		},
		{
			beforeHandle: async ({ body, set }) => {
				const { email, password } = body;
				if (!email || !password) {
					set.status = 400;
					return {
						errorCode: ErrorCode.BAD_REQUEST,
						message: "Bad request",
					};
				}
			},
			detail: {
				tags: ["Auth"],
				description: "Register user",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									email: {
										type: "string",
									},
									name: {
										type: "string",
									},
									password: {
										type: "string",
									},
								},
							},
						},
					},
				},
				responses: {
					409: {
						description: "Duplicate",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										message: {
											type: "string",
										},
									},
								},
							},
						},
					},
					200: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										data: {
											type: "object",
											properties: {
												id: {
													type: "number",
												},
												email: {
													type: "string",
												},
												name: {
													type: "string",
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
			body: t.Object({
				email: t.String({
					format: "email",
				}),
				name: t.String(),
				password: t.String(),
			}),
		},
	)

	.post(
		"/login",
		async ({ jwt, cookie: { auth }, body, set }) => {
			const result = await authService.login({
				email: body.email,
				password: body.password,
			});
			if (hasErrorResult(result)) {
				const failureResult = result as Failure;
				set.status = failureResult.errorCode.valueOf();
				return failureResult;
			}

			const { password, ...user } = result;

			auth.set({
				value: await jwt.sign(user),
				httpOnly: true,
				maxAge: 7 * 24 * 60 * 60 * 1000,
			});

			return {
				data: {
					...user,
					token: auth.value,
				},
			};
		},
		{
			detail: {
				tags: ["Auth"],
				description: "Login",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									email: {
										type: "string",
									},
									password: {
										type: "string",
									},
								},
							},
						},
					},
				},
				responses: {
					404: {
						description: "Not found",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										message: {
											type: "string",
										},
									},
								},
							},
						},
					},
					401: {
						description: "Unauthorized",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										message: {
											type: "string",
										},
									},
								},
							},
						},
					},
					200: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										data: {
											type: "object",
											properties: {
												id: {
													type: "number",
												},
												email: {
													type: "string",
												},
												name: {
													type: "string",
												},
												token: {
													type: "string",
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
			body: t.Object({
				email: t.String(),
				password: t.String(),
			}),
		},
	);

export default authRoute;
