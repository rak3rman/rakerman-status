export default defineEventHandler(async (event) => {
    let body = await useBody(event)
    // Validate against requested params
    if (!body.is_maintain || !body.start || !body.end) return "Invalid params. token, is_maintain, start, and end is required (in unix epoch format)."
    // Validate against token
    // @ts-ignore
    if (body.token !== await SERVICES.get("token", {type: "text"})) return "Invalid token, please try again."
    // @ts-ignore
    await SERVICES.put("alert", JSON.stringify({
        is_maintain: (body.is_maintain === 'true'),
        start: parseInt(body.start),
        end: parseInt(body.end)
    }), {expiration: parseInt(body.end) / 1000})
    return "Alert added! Data will propagate across the network over the next minute."
})