import { Hono } from "@hono/hono";
import { auth } from "./middleware/auth_middleware.ts";
import { cors } from "@hono/hono/cors";
import { serverConfig } from "../../config.ts";

const server = new Hono();

server.get("/", (c) => {
	return c.text("Hello, Kitledger!");
});

const apiV1Router = new Hono();

apiV1Router.use(cors(serverConfig.cors));
apiV1Router.use(auth);
apiV1Router.get("/", (c) => {
	return c.json({ message: "Welcome to the Kitledger API!" });
});

server.route("/api/v1", apiV1Router);

export default server;
