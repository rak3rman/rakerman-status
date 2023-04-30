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
  TENANTS: KVNamespace;
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

const tenantSchema = z.object({
  domain: z.string().trim(),
  usernames: z.array(z.string()),
  title: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9 ]+$/, {
      message: "Title can only contain letters, numbers, and spaces",
    })
    .min(6, { message: "Title must be 6-24 characters long" })
    .max(24, { message: "Title must be 6-24 characters long" }),
  logo: z.string().url(),
});

const serviceSchema = z.object({
  url: z.string().url(),
  name: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9 ]+$/, {
      message: "Name can only contain letters, numbers, and spaces",
    })
    .min(6, { message: "Name must be 6-24 characters long" })
    .max(24, { message: "Name must be 6-24 characters long" }),
  group: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9 ]+$/, {
      message: "Group can only contain letters, numbers, and spaces",
    })
    .min(6, { message: "Group must be 6-24 characters long" })
    .max(24, { message: "Group must be 6-24 characters long" }),
  repo: z.string().url(),
  is_maintain: z.boolean(),
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

async function authorFetchAuth0User(c: Context) {
  // Fetch user from Author
  const userAuthor = await fetch(
    "https://api.author.rakerman.com/api/auth0/user",
    {
      method: "GET",
      headers: {
        Authorization: c.req.header("Authorization") || "",
      },
    }
  );
  // Return
  return await userAuthor.json();
}

async function authorFetchRFUser(username: string) {
  // Fetch user from Author
  const userAuthor = await fetch(
    "https://api.author.rakerman.com/api/rf/user/" + username,
    {
      method: "GET",
    }
  );
  // Return
  return await userAuthor.json();
}

/*
 * GET /api/tenants
 *
 * Sudo action. Returns a JSON payload containing all
 * tenants using RAkerman Status.
 *
 * @header {string} Authorization - auth0 JWT
 *
 * @returns {json[]} payload - array of tenants
 *
 * @returns {string} payload[].domain - domain of tenant, key in KV
 * @returns {string[]} payload[].usernames - admin usernames from Author
 * @returns {string} payload[].title - title of tenant
 * @returns {string} payload[].logo - logo url
 */
app.get("/api/tenants", async (c) => {
  // Fetch user from Author
  const authorUser = await authorFetchAuth0User(c);
  // Enforce author validations
  if (!authorUser.complete) return c.text("User is not complete", 401);
  else if (!authorUser.profile.sudo) return c.text("User is not sudo", 401);
  // Fetch all tenants
  const domains = await c.env.TENANTS.list();
  let tenants = [];
  for (let i = 0; i < domains.keys.length; i++) {
    let tenant = await c.env.TENANTS.get(domains.keys[i].name, {
      type: "text",
    });
    if (tenant === null) return c.text("Tenant listed was null", 500);
    tenants.push(JSON.parse(tenant));
  }
  return c.json(tenants);
});

/*
 * POST /api/tenant
 *
 * Inserts a new tenant into KV store. Checks that Author user
 * is a sudo user, and that the tenant does not already exist.
 * Returns a JSON payload containing the tenant.
 *
 * @header {string} Authorization - auth0 JWT
 *
 * @body {string} body.domain - domain of tenant, key in KV
 * @body {string} body.title - title of tenant
 * @body {string} body.logo - logo url
 *
 * @returns {json} payload - tenant
 *
 * @returns {string} payload.domain - domain of tenant, key in KV
 * @returns {string[]} payload.usernames[] - admin usernames from Author
 * @returns {string} payload.title - title of tenant
 * @returns {string} payload.logo - logo url
 *
 * OR THROWS ISSUES
 *
 * @returns {json} payload.error - error object containing issues
 *
 * @returns {json[]} payload.error.issues - array of issues
 * @returns {string} payload.error.name - where issues were thrown (Zod or KVValidation)
 *
 * @returns {string[]} error.issues[].path - path to issue, what field(s) is incorrect
 * @returns {string} error.issues[].message - message describing issue
 */
app.post("/api/tenant", zValidator("json", tenantSchema), async (c) => {
  let body = await c.req.valid("json");
  let issues = [];

  // Fetch user from Author
  const authorUser = await authorFetchAuth0User(c);
  // Enforce author validations
  if (!authorUser.complete) return c.text("User is not complete", 401);
  else if (!authorUser.profile.sudo) return c.text("User is not sudo", 401);
  // Check for existing tenant
  const tenant = await c.env.TENANTS.get(body.domain, { type: "text" });
  if (tenant !== null)
    issues.push({
      path: ["domain"],
      message: "Domain is already registered as a tenant, try another",
    });
  // Check that usernames are valid in Author
  for (let i = 0; i < body.usernames.length; i++) {
    const user = await authorFetchRFUser(body.usernames[i]);
    if (user === null)
      issues.push({
        path: ["usernames"],
        message:
          "Username '" + body.usernames[i] + "' does not exist in Author",
      });
  }
  // Return if issues exist
  if (issues.length > 0)
    return c.json(
      { error: { issues: issues, name: "KVValidationError" } },
      400
    );
  // Insert tenant into KV
  await c.env.TENANTS.put(body.domain, JSON.stringify(body));
  // Return body
  return c.json(body);
});

/*
 * GET /api/services
 *
 * Returns a JSON payload containing all services
 * for a tenant using RAkerman Status.
 *
 * @returns {string} title - title of tenant
 * @returns {string} logo - logo url
 * @returns {json[]} services - array of services
 *
 * @returns {string} services[].name - name of service
 */
app.get("/api/services", async (c) => {
  // Fetch tenant from KV and verify
  const tenant = await c.env.TENANTS.get(c.req.headers.get("host") || "", {
    type: "json",
  });
  if (tenant === null) return c.text("Tenant is not registered", 401);
  // Fetch all services
  const services = await c.env.SERVICES.list({ prefix: tenant.domain + ":" });
  let payload = [];
  for (let i = 0; i < services.keys.length; i++) {
    const service = await c.env.SERVICES.get(services.keys[i].name, {
      type: "text",
    });
    if (service === null) return c.text("Service listed was null", 500);
    payload.push(JSON.parse(service));
  }
  // Return
  return c.json({
    title: tenant.title,
    logo: tenant.logo,
    services: payload,
  });
});

/*
 * GET /api/service
 */
app.get("/api/service", async (c) => {
  return c.text("Broken route", 418);
});

/*
 * POST /api/service
 *
 * Inserts a new service into KV store. Checks that Author user
 * matches a tenant admin, and that the service does not already exist.
 * Returns a JSON payload containing the service.
 *
 * @header {string} Authorization - auth0 JWT
 *
 * @body {string} body.url - url of service, partial key in KV
 * @body {string} body.name - name of service
 * @body {string} body.group - service group (server region, etc)
 * @body {string} body.repo - repository url
 * @body {boolean} body.is_maintain - is the service in maintenance mode
 *
 * @returns {json} payload - service
 *
 * @returns {string} payload.url - url of service, partial key in KV
 * @returns {string} payload.name - name of service
 * @returns {string} payload.group - service group (server region, etc)
 * @returns {string} payload.repo - repository url
 * @returns {boolean} payload.is_maintain - is the service in maintenance mode
 *
 * OR THROWS ISSUES
 *
 * @returns {json} payload.error - error object containing issues
 *
 * @returns {json[]} payload.error.issues - array of issues
 * @returns {string} payload.error.name - where issues were thrown (Zod or KVValidation)
 *
 * @returns {string[]} error.issues[].path - path to issue, what field(s) is incorrect
 * @returns {string} error.issues[].message - message describing issue
 */
app.post("/api/service", zValidator("json", serviceSchema), async (c) => {
  let body = await c.req.valid("json");
  let issues = [];

  // Fetch user from Author
  const authorUser = await authorFetchAuth0User(c);
  // Enforce author validations
  if (!authorUser.complete) return c.text("User is not complete", 401);
  // Fetch tenant from KV and verify
  const tenant = await c.env.TENANTS.get(c.req.headers.get("host") || "", {
    type: "json",
  });
  if (tenant === null) return c.text("Tenant is not registered", 401);
  // Check for existing service
  const service = await c.env.SERVICES.get(tenant.domain + ":" + body.url, {
    type: "json",
  });
  if (service !== null)
    issues.push({
      path: ["url"],
      message:
        "URL is already registered as a service for this tenant, try another",
    });
  // Return if issues exist
  if (issues.length > 0)
    return c.json(
      { error: { issues: issues, name: "KVValidationError" } },
      400
    );
  // Insert service into KV
  await c.env.SERVICES.put(
    tenant.domain + ":" + body.url,
    JSON.stringify(body)
  );
  // Return body
  return c.json(body);
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
  const username = await c.env.TENANTS.get(c.req.url, {
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