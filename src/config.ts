import { config } from "dotenv";
import { AlgorithmTypes } from "hono/utils/jwt/jwa";

config();

/*
 * 1) Define the types
 */

type AuthConfig = {
	secret: string;
	pastSecrets: string[];
	algorithm: AlgorithmTypes;
};

type CacheConfig = {
	url: string;
};

type CorsConfig = {
	origin: string | string[],
	allowMethods?: string[],
	allowHeaders?: string[];
	maxAge?: number;
	credentials?: boolean;
	exposeHeaders?: string[];
};

type DbConfig = {
	url: string;
	ssl: boolean;
	max: number;
};

type ServerConfig = {
	port: number;
	cors: CorsConfig;
};

type SessionConfig = {
	ttl: number;
	maxLifetime: number;
}

/*
 * 2) Define the logic for complex values.
 */

/**
 * Authentication algorithm configuration values and defaults.
 * This is used to sign and verify JWTs. Comes from Hono's JWT utilities.
 */
const authAlgorithm = "HS256" as AlgorithmTypes;

/**
 * Authentication secrets configuration values and defaults.
 */
const authSecret = process.env.KL_AUTH_SECRET;
if (!authSecret) {
	throw new Error("KL_AUTH_SECRET environment variable is not set.");
}
const pastSecretsString = process.env.KL_AUTH_PAST_SECRETS;
const pastSecrets = pastSecretsString ? pastSecretsString.split(",") : [];

/**
 * CORS configuration values and defaults.
 */
const corsDefaultHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'];
const corsAllowedHeaders = [...new Set([...corsDefaultHeaders, ...(process.env.KL_CORS_ALLOWED_HEADERS?.split(",") || [])])];
const corsAllowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
const corsAllowedOrigins = process.env.KL_CORS_ALLOWED_ORIGINS ? process.env.KL_CORS_ALLOWED_ORIGINS.split(",") : "*";
const corsCredentials = false;
const corsExposeHeaders :string[] = [];
const corsMaxAge = parseInt(process.env.KL_CORS_MAX_AGE || "86400");

/**
 * Session configuration values and defaults.
 * This is used to manage session lifetimes and time-to-live (TTL).
 */
const sessionTtl = parseInt(process.env.KL_SESSION_TTL || "3600"); // 1 hour default
const sessionMaxLifetime = parseInt(process.env.KL_SESSION_MAX_LIFETIME || "86400"); // Default to 1 week.

// Error out if session TTL is greater than max lifetime or if either is not set.
if (sessionTtl > sessionMaxLifetime || (sessionTtl <= 0 || sessionMaxLifetime <= 0)) {
	throw new Error("KL_SESSION_MAX_LIFETIME value in seconds must be greater than KL_SESSION_TTL value in seconds, and both must be positive integers.");
}


/*
 * 3) Export the configuration objects.
 */

/**
 * Export pre-assembled configuration values for authentication.
 * Values are a mix of environment variables and defaults.
 */
export const authConfig: AuthConfig = {
	secret: authSecret,
	pastSecrets: pastSecrets,
	algorithm: authAlgorithm,
};

/**
 * Export pre-assembled configuration values for the cache.
 * Values are a mix of environment variables and defaults.
 */
export const cacheConfig: CacheConfig = {
	url: process.env.KL_VALKEY_URL || "redis://localhost:6379",
};

/**
 * Export pre-assembled configuration values for the database.
 * Values are a mix of environment variables and defaults.
 */
export const dbConfig: DbConfig = {
	url: process.env.KL_POSTGRES_URL || "postgres://localhost:5432/kitledger",
	ssl: process.env.KL_POSTGRES_SSL === "true",
	max: parseInt(process.env.KL_POSTGRES_MAX_CONNECTIONS || "10"),
};

/**
 * Export pre-assembled configuration values for the HTTP server.
 * Values are a mix of environment variables and defaults.
 */
export const serverConfig: ServerConfig = {
	port: process.env.KL_SERVER_PORT ? parseInt(process.env.KL_SERVER_PORT) : 8888,
	cors: {
		origin: corsAllowedOrigins,
		allowMethods: corsAllowedMethods,
		allowHeaders: corsAllowedHeaders,
		exposeHeaders: corsExposeHeaders,
		credentials: corsCredentials,
		maxAge: corsMaxAge,
	},
};

/**
 * Export pre-assembled configuration values for session management.
 * Values are a mix of environment variables and defaults.
 */
export const sessionConfig: SessionConfig = {
	ttl: sessionTtl,
	maxLifetime: sessionMaxLifetime,
};
