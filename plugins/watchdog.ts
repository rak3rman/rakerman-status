export default defineNuxtPlugin(() => {
    console.log("hiyaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    async function pingServers(event) {
        // @ts-ignore
        let services = await SERVICES.list()
        // Loop through keys and generate payload
        for (const key of services.keys) {
            // @ts-ignore
            let value = await SERVICES.get(key.name, {type: "json"}) // Get service
            // @ts-ignore
            await SERVICES.put(value.name, JSON.stringify({
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
    addEventListener('scheduled', event => {
        // @ts-ignore
        event.waitUntil(pingServers(event));
    });
})

