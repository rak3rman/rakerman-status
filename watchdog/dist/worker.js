async function pingServers(event, env) {
    let services = await env.SERVICES.list()
    // Loop through keys and generate payload
    for (const key of services.keys) {
        console.log(key.name);
        let value = await env.SERVICES.get(key.name, {type: "json"}) // Get service
        await env.SERVICES.put(key.name, JSON.stringify({
            is_up: true,
            is_maintain: value.is_maintain,
            last_up: Date.now(),
            last_down: Date.now(),
            location: value.location,
            subscribers: value.subscribers,
        }))
    }
    return true
}

const worker = {
    async scheduled(event, env, ctx) {
        ctx.waitUntil(await pingServers(event, env));
    },
};

export default worker;


