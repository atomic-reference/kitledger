import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { dbConfig } from "../config.js";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as schema from "./schema.js";

export const db = drizzle({
	connection: dbConfig,
	schema: schema,
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsPath = join(__dirname, "./migrations");

export async function runMigrations() {
	await migrate(db, {
		migrationsFolder: migrationsPath,
		migrationsTable: "migrations",
		migrationsSchema: "public",
	});
}
