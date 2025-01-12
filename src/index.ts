import { Elysia } from "elysia";
import "reflect-metadata";
import staticPlugin from "@elysiajs/static";
import swagger from "@elysiajs/swagger";
import authRoute from "./presentation/routes/auth.route";
import cartRoute from "./presentation/routes/cart.route";
import categoryRoute from "./presentation/routes/category.route";
import productRoute from "./presentation/routes/product.route";

const app = new Elysia()
	.use(
		staticPlugin({
			assets: "public",
			prefix: "/",
			alwaysStatic: true
		}),
	)
	.use(
		swagger({
			path: "/docs",
		}),
	)
	.use(authRoute)
	.use(categoryRoute)
	.use(productRoute)
	.use(cartRoute)
	.listen(8000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
