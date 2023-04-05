/*
 * RAkerman Status Hono.js Backend
 *
 * Radison Akerman, April 2023
 * RAkerman Foundation, RAkerman Status
 */

import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { cors } from 'hono/cors'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import * as jose from 'jose'

type Bindings = {
    AUTH0_USERNAME: KVNamespace,
    USERS: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', logger())
app.use('*', prettyJSON())

app.use(
    '/api/*',
    cors({
        origin: (origin) => {
            return origin.endsWith('.rakerman.com') ? origin : 'https://rakerman.com'
        },
    })
)

app.get('/', (c) => c.text('RAkerman Status API v1.0'))

const userSchema = z.object({
    auth0_sub: z.string(),
    username: z.string().trim()
        .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" })
        .min(6, { message: "Username must be 6-24 characters long" })
        .max(24, { message: "Username must be 6-24 characters long" }),
    first: z.string().trim()
        .regex(/^[a-zA-Z]+$/, { message: "First name can only contain letters" })
        .min(1, { message: "First name must be 1-16 characters long" })
        .max(16, { message: "First name must be 1-16 characters long" }),
    last: z.string().trim()
        .regex(/^[a-zA-Z]+$/, { message: "Last name can only contain letters" })
        .min(1, { message: "Last name must be 1-16 characters long" })
        .max(16, { message: "Last name must be 1-16 characters long" }),
    email: z.string().trim().email(),
    bio: z.string().trim()
        .max(255, { message: "Bio can be at most 255 characters long" }),
    useBoringAvatars: z.boolean(),
    pfp: z.string().url()
})

/* ============================================================================================== *
 * Auth0 API, to be called by frontend users authenticated using Auth0
 * ============================================================================================== */
const auth0 = new Hono<{ Bindings: Bindings }>()

async function validateJWT(jwt: string) {
    const jwkSet = jose.createRemoteJWKSet(new URL('https://rakerman.us.auth0.com/.well-known/jwks.json'))
    const { payload } = await jose.jwtVerify(jwt, jwkSet)
    return payload
}

/*
 * GET /api/auth0/user
 *
 * Gets user from Author, using Auth0 JWT strategy.
 * Checks JWT integrity, translator from Auth0 sub to username,
 * and username existence in Author. Returns a JSON payload
 * containing user.
 *
 * @param {string} Authorization (header) - Auth0 JWT
 * @returns {json} - {
 *      auth0_sub {string} - Auth0 sub ID requested
 *      translator {boolean} - Does a mapping from Auth0 sub to username exist?
 *      exists {boolean} - Does user exist in Author?
 *      complete {boolean} - Has user completed profile?
 *      profile {json} - User profile details
 * }
 */
auth0.get('/user', async (c) => {
    const jwt = c.req.header('Authorization')
    let payload;

    // 1. Check and validate JWT
    if (jwt === undefined) return c.text('Missing JWT Token', 401)
    try {
        payload = await validateJWT(jwt.toString().replace('Bearer ', ''))
    } catch (e) {
        return c.text('Invalid JWT Token', 401)
    }
    // 2. Create Payload to return
    let body = {
        auth0_sub: payload.sub,
        translator: false,
        exists: false,
        complete: false,
        profile: {}
    }
    // 3. Check if translator exists in CF KV
    const username = await c.env.AUTH0_USERNAME.get(payload.sub, {
        type: 'text',
        cacheTtl: 60 * 60 * 24 // 1 day, rare writes
    })
    if (username === null) return c.json(body)
    body.translator = true
    // 4. Check if user exists in CF KV
    const user = await c.env.USERS.get(username, {
        type: 'text'
    })
    if (user === null) return c.json(body)
    body.profile = JSON.parse(user)
    body.exists = true
    // 5. Check if user is complete
    const result = userSchema.safeParse(body.profile)
    if (result.success) body.complete = true
    // 6. Return body
    return c.json(body)
})

/*
 * POST /api/auth0/user
 *
 * Inserts a new user into Author from Auth0.
 * Checks JWT integrity, translator from Auth0 sub to username,
 * and username existence in Author. Creates translator and user
 * if all checks pass. Returns a JSON payload containing user.
 *
 * @param {string} Authorization (header) - Auth0 JWT
 * @param {json} body - User to be created
 * @returns {json} - Created user
 */
auth0.post('/user',
    zValidator(
        'json',
        userSchema
    ),
    async (c) => {
        const jwt = c.req.header('Authorization')
        const body = await c.req.valid('json')
        let issues = []

        // 1. Check presence of JWT
        if (jwt === undefined) return c.text('Missing JWT Token', 401)
        // 2. Validate JWT
        try {
            let payload = await validateJWT(jwt.toString().replace('Bearer ', ''))
            if (payload.sub !== body.auth0_sub) return c.text('Auth0 Sub Mismatch', 401)
        } catch (e) {
            return c.text('Invalid JWT Token', 401)
        }
        // 3. Check for existing translator (Auth0 sub)
        const username = await c.env.AUTH0_USERNAME.get(body.auth0_sub, { type: 'text' })
        if (username !== null) issues.push({ path: ['username'], message: 'Username already assigned to this Auth0 account' })
        // 4. Check for existing username
        const user = await c.env.USERS.get(body.username, { type: 'text' })
        if (user !== null) issues.push({ path: ['username'], message: 'Username is already in use, try another' })
        // 5. Return if issues exist
        if (issues.length > 0) return c.json({ error: { issues: issues, name: 'KVValidationError' }}, 400)
        // 6. Create user, auth0 -> username translation in CF KV
        await c.env.USERS.put(body.username, JSON.stringify(body))
        await c.env.AUTH0_USERNAME.put(body.auth0_sub, body.username)
        // 7. Return body
        return c.json(body)
    }
)

/*
 * PUT /api/auth0/user
 *
 * Updates an existing user in Author from Auth0.
 * Checks JWT integrity, translator from Auth0 sub to username,
 * and username existence in Author. Updates user if all checks
 * pass. Returns a JSON payload containing user.
 *
 * @param {string} Authorization (header) - Auth0 JWT
 * @param {json} body - User to be updated
 * @returns {json} - Updated user
 */
auth0.put('/user',
    zValidator(
        'json',
        userSchema
    ),
    async (c) => {
        const jwt = c.req.header('Authorization')
        const body = await c.req.valid('json')
        let issues = []

        // 1. Check presence of JWT
        if (jwt === undefined) return c.text('Missing JWT Token', 401)
        // 2. Validate JWT
        try {
            let payload = await validateJWT(jwt.toString().replace('Bearer ', ''))
            if (payload.sub !== body.auth0_sub) return c.text('Auth0 Sub Mismatch', 401)
        } catch (e) {
            return c.text('Invalid JWT Token', 401)
        }
        // 3. Validate translator (Auth0 sub)
        const username = await c.env.AUTH0_USERNAME.get(body.auth0_sub, { type: 'text' })
        if (username === null) issues.push({ path: ['username'], message: 'Auth0 account not assigned to a username' })
        else if (username !== body.username) issues.push({ path: ['username'], message: 'Auth0 account assigned to a different username' })
        // 4. Validate user/username
        const user = await c.env.USERS.get(body.username, { type: 'text' })
        if (user === null) issues.push({ path: ['username'], message: 'User does not exist with this username' })
        // 5. Return if issues exist
        if (issues.length > 0) return c.json({ error: { issues: issues, name: 'KVValidationError' }}, 400)
        // 6. Create user, auth0 -> username translation in CF KV
        await c.env.USERS.put(body.username, JSON.stringify(body))
        // 7. Return body
        return c.json(body)
    }
)

/* ============================================================================================== *
 * RF API, to be called by backend RAkerman Foundation services
 * ============================================================================================== */
const rf = new Hono<{ Bindings: Bindings }>() // RAkerman Foundation API, to be called by backend services

// GET User, FROM Internal RF Service Token
// Example: m8, public user hits users public profile, m8 requests public user details
app.get('/api/rf/user/:username', (c) => c.text('RF Service Internal Route'))

app.route('/api/auth0', auth0)
app.route('/api/rf', rf)

export default app