import { Elysia } from "elysia";
import "reflect-metadata";
import swagger from "@elysiajs/swagger";
import authRoute from "./presentation/routes/auth.route";

const app = new Elysia()
	.use(
		swagger({
			path: "/docs",
		}),
	)
	.use(authRoute)
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
