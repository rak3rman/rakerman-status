/*
 * RAkerman Status Hono.js Backend
 *
 * Radison Akerman, April 2023
 * RAkerman Foundation, RAkerman Status
 */

import { Context, Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import * as jose from "jose";

type Bindings = {
  URL_USERNAME: KVNamespace;
  SERVICES: KVNamespace;
  CACHED: KVNamespace;
  IMAGES: KVNamespace;
  ENVIRONMENT: string;
};

const prodDomains = ["rakerman.com", "rakerman.workers.dev"];
const devDomains = ["rakerman.workers.dev", "localhost:3000", "localhost:8787"];

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => c.text("RAkerman Status API v2.3.0"));

app.use("*", logger());
app.use("*", prettyJSON());

function isValidOrigin(origin: string | null, c: Context) {
  if (origin === null) return false;
  // Set domains based on environment
  let domains: string[] = [];
  if (c.env.ENVIRONMENT === "production") domains = prodDomains;
  else if (c.env.ENVIRONMENT === "dev") domains = devDomains;
  // Loop over domains in environment
  for (const domain of domains) {
    if (origin.endsWith(domain)) return true;
  }
  // Couldn't find a valid domain, return false
  console.log("Invalid Origin: '" + origin + "'");
  return false;
}

app.use("/api/*", async (c, next) => {
  const corsMiddleware = cors({
    origin: (origin) => {
      return isValidOrigin(origin, c) ? origin : "https://rakerman.com";
    },
  });
  return corsMiddleware(c, next);
});

const serviceSchema = z.object({
  url: z.string().url(),
  is_maintain: z.boolean(),
  group: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Group name can only contain letters, numbers, and underscores",
    })
    .min(6, { message: "Group name must be 6-24 characters long" })
    .max(24, { message: "Group name must be 6-24 characters long" }),
  email: z.string().trim().email(),
});

/* ============================================================================================== *
 * Auth0 API, to be called by frontend users authenticated using Auth0
 * ============================================================================================== */

async function auth0ValidateJWT(jwt: string | undefined) {
  if (jwt === undefined) {
    throw new Error();
  }
  try {
    const jwkSet = jose.createRemoteJWKSet(
      new URL("https://rakerman.us.auth0.com/.well-known/jwks.json")
    );
    const { payload } = await jose.jwtVerify(
      jwt.replace("Bearer ", ""),
      jwkSet
    );
    return payload;
  } catch (e) {
    throw new Error();
  }
}

/*
 * GET /api/services
 *
 * Gets and returns a cached JSON payload containing
 * the status of all services, from CACHED KV.
 *
 * @returns {json} - [] of services
 */
app.get("/api/services", async (c) => {
  return c.text("Broken route", 418);
});

/*
 * GET /api/service
 *
 * Gets and returns a JSON payload containing
 * the editable portion of the service's data.
 * Must be authenticated through Author to access.
 *
 * @returns {json} - service
 */
app.get("/api/service", async (c) => {
  return c.text("Broken route", 418);
});

/*
 * POST /api/service
 *
 * Gets and returns a JSON payload containing
 * the editable portion of the service's data.
 * Must be authenticated through Author to access.
 *
 * @returns {json} - service
 */
app.post("/api/service", async (c) => {
  return c.text("Broken route", 418);
});

/*
 * PUT /api/service
 *
 * Gets and returns a JSON payload containing
 * the editable portion of the service's data.
 * Must be authenticated through Author to access.
 *
 * @returns {json} - service
 */
app.put("/api/service", async (c) => {
  return c.text("Broken route", 418);
});

/*
 * GET /api/images
 *
 * Gets and returns a JSON payload containing
 * an array of images to display in the UI, from IMAGES KV.
 *
 * @returns {json} - [] of image urls
 */
app.get("/api/images", async (c) => {
  const username = await c.env.URL_USERNAME.get(c.req.url, {
    type: "text",
    cacheTtl: 60 * 60 * 24, // 1 day, rare writes
  });

  if (username === null)
    return c.text("Source URL not linked to an Author account", 404);

  return c.json(
    await c.env.IMAGES.get(username, {
      type: "json",
    })
  );
});

/*
 * PUT /api/images
 *
 * Gets and returns a JSON payload containing
 * the editable portion of the service's data.
 * Must be authenticated through Author to access.
 *
 * @returns {json} - service
 */
app.put("/api/images", async (c) => {
  return c.text("Broken route", 418);
});

export default app;