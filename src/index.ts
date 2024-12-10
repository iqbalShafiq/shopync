import { Elysia } from "elysia";
import "reflect-metadata";
import swagger from "@elysiajs/swagger";
import authRoute from "./presentation/routes/auth.route";
import productRoute from "./presentation/routes/product.route";

const app = new Elysia()
	.use(
		swagger({
			path: "/docs",
		}),
	)
	.use(authRoute)
	.use(productRoute)
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
