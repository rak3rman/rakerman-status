async function pingServers(event, env) {
    // Get list of service keys from CF KV
    let services = await env.SERVICES.list()
    let payload = [];
    // Loop through keys and generate payload
    for (const key of services.keys) {
        // We are looking for a service, not a payload
        if (key.name !== "payload") {
            // Get service details from CF KV
            let orig_serv = await env.SERVICES.get(key.name, {type: 'json'})
            // Ping server
            const req_start = Date.now()
            const response = await fetch('https://' + key.name, {
                method: 'GET',
                redirect: orig_serv.redirect ? orig_serv.redirect : 'manual',
            })
            const req_time = Math.round(Date.now() - req_start)
            const is_up = response.status === 200
            // Update existing service with updated data
            let updated_serv = {
                is_up: is_up,
                is_maintain: orig_serv.is_maintain,
                last_up: is_up ? Date.now() : orig_serv.last_up,
                last_down: is_up ? orig_serv.last_down : Date.now(),
                trip_time: req_time,
                last_err_code: response.status,
                redirect: orig_serv.redirect,
                location: orig_serv.location,
                subscribers: orig_serv.subscribers,
            }
            // Update service details to CF KV
            await env.SERVICES.put(key.name, JSON.stringify(updated_serv))
            // Push into services payload
            updated_serv.name = key.name // Add name to payload
            delete updated_serv.redirect // Remove redirect method from payload
            delete updated_serv.subscribers // Remove subscribers from payload
            payload.push(updated_serv) // Add service to payload array
        }
    }
    // Sort services payload by last_down
    payload.sort(function(a, b) {
        return b.last_down - a.last_down;
    });
    // Update services payload to CF KV
    await env.SERVICES.put('payload', JSON.stringify(payload))
    // Return that we finished
    return true
}

const worker = {
    async scheduled(event, env, ctx) {
        ctx.waitUntil(await pingServers(event, env));
    },
};

export default worker;


