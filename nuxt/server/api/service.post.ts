export default defineEventHandler(async (event) => {
    let body = await useBody(event)
    // Validate against requested params
    if (!body.name || !body.is_maintain || !body.location) return "Invalid params. token, name, is_maintain, and location is required. subscribers is optional."
    // Validate against token
    // @ts-ignore
    if (body.token !== await SERVICES.get("token", {type: "text"})) return "Invalid token, please try again."
    // @ts-ignore
    await SERVICES.put(body.name, JSON.stringify({
        is_maintain: (body.is_maintain === 'true'),
        last_flip: Date.now(),
        location: body.location,
        subscribers: body.subscribers,
    }))
    return "Service added! Data will propagate across the network over the next minute."
})