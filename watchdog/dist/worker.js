async function pingServers(event, env) {
    let services = await env.SERVICES.list()
    // Loop through keys and generate payload
    for (const key of services.keys) {
        // Get service details
        let value = await env.SERVICES.get(key.name, {type: "json"})
        // Get request ready
        const init = {
            method: 'GET',
            redirect: 'manual',
            // headers: {
            //     'User-Agent': 'cf-worker-status-page',
            // },
        }
        // Ping server
        const req_start = Date.now()
        const res = await fetch('https://' + key.name, init)
        const req_time = Math.round(Date.now() - req_start)
        const is_up = res.status === 200
        // Update service details
        await env.SERVICES.put(key.name, JSON.stringify({
            is_up: is_up,
            is_maintain: value.is_maintain,
            last_up: is_up ? Date.now() : value.last_up,
            last_down: is_up ? value.last_down : Date.now(),
            trip_time: req_time,
            last_err_code: res.status,
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


