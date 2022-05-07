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
                redirect: 'follow',
            })
            const req_time = Math.round(Date.now() - req_start)
            const res_ok = response.status === 200 && response.url !== "https://status.rakerman.com"
            const res_code = response.url === "https://status.rakerman.com" ?  500 : response.status
            // Update service details to CF KV if is_up changed
            if (orig_serv.is_up !== res_ok) {
                await env.SERVICES.put(key.name, JSON.stringify({
                    is_up: res_ok,
                    is_maintain: orig_serv.is_maintain,
                    last_flip: Date.now(),
                    location: orig_serv.location,
                    subscribers: orig_serv.subscribers,
                }))
            }
            // Push into services payload
            payload.push({
                name: key.name,
                is_up: res_ok,
                is_maintain: orig_serv.is_maintain,
                last_up: res_ok ? Date.now() : orig_serv.last_flip,
                last_down: res_ok ? orig_serv.last_flip : Date.now(),
                trip_time: req_time,
                last_err_code: res_code,
                location: orig_serv.location,
            })
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


