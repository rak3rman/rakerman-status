export default defineEventHandler(async (event) => {
    let body = await useBody(event)
    // Validate against requested params
    if (!body.name || !body.is_maintain || !body.location) return "Invalid params. token, name, is_maintain, and location is required. subscribers is optional."
    // Validate against token
    if (body.token !== "#") return "Invalid token, please try again."
    // @ts-ignore
    await SERVICES.put(body.name, JSON.stringify({
        is_up: false,
        is_maintain: (body.is_maintain === 'true'),
        last_up: Date.now(),
        last_down: Date.now(),
        trip_time: "?",
        location: body.location,
        subscribers: body.subscribers,
    }))
    return "Right on! Data will propagate across the network over the next minute."
})