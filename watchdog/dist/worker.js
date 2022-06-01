async function ping_server(name) {
    // Ping server
    const req_start = Date.now()
    const response = await fetch('https://' + name, {
        method: 'GET',
        redirect: 'follow',
    })
    // Return the data we want
    return {
        req_time: Math.round(Date.now() - req_start),
        res_ok: response.status === 200 && (response.url !== "https://status.rakerman.com" || name === "status.rakerman.com"),
        res_code: (response.url === "https://status.rakerman.com" && name !== "status.rakerman.com") ? 500 : response.status
    }
}

async function ping_all(event, env) {
    // Get list of service keys from CF KV
    let services = await env.SERVICES.list()
    let payload = [];
    // Loop through keys and generate payload
    for (const key of services.keys) {
        // We are looking for a service, not a payload
        const skips = ["payload", "token", "alert"]
        if (!skips.includes(key.name)) {
            // Get service details from CF KV
            const orig_serv = await env.SERVICES.get(key.name, {type: 'json'})
            // Ping server
            let ping_data = await ping_server(key.name)
            // Sanity check
            if (orig_serv.is_up !== ping_data.res_ok) ping_data = await ping_server(key.name)
            // Update service details to CF KV if is_up changed
            if (orig_serv.is_up !== ping_data.res_ok) {
                await env.SERVICES.put(key.name, JSON.stringify({
                    is_up: ping_data.res_ok,
                    is_maintain: orig_serv.is_maintain,
                    last_flip: Date.now(),
                    location: orig_serv.location,
                    subscribers: orig_serv.subscribers,
                }))
            }
            // Push into services payload
            payload.push({
                name: key.name,
                is_up: ping_data.res_ok,
                is_maintain: orig_serv.is_maintain,
                last_up: ping_data.res_ok ? Date.now() : (orig_serv.is_up !== ping_data.res_ok ? Date.now() : orig_serv.last_flip),
                last_down: ping_data.res_ok ? (orig_serv.is_up !== ping_data.res_ok ? Date.now() : orig_serv.last_flip) : Date.now(),
                trip_time: ping_data.req_time,
                last_err_code: ping_data.res_code,
                location: orig_serv.location,
            })
        }
    }
    // Sort services payload by last_down
    console.log(payload.filter(serv => !serv.is_up).length)
    if (payload.filter(serv => !serv.is_up).length > 0) {
        payload.sort(function(a, b) {
            return b.last_down - a.last_down;
        });
    } else {
        payload.sort(function(a, b) {
            let aa = a.name.split(".")
            let bb = b.name.split(".")
            if (bb[bb.length-2] === aa[aa.length-2]) {
                return b.name - a.name;
            }
            return bb[bb.length-2] - aa[aa.length-2];
        });
    }
    // Update services payload to CF KV
    await env.SERVICES.put('payload', JSON.stringify(payload))
    // Return that we finished
    return true
}

const worker = {
    async scheduled(event, env, ctx) {
        ctx.waitUntil(await ping_all(event, env));
    },
};

export default worker;


