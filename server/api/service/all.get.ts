export default defineEventHandler(async (event) => {
    // @ts-ignore
    let services = await SERVICES.list()
    // Loop through keys and generate payload
    let payload = [];
    for (const key of services.keys) {
        // @ts-ignore
        let value = await SERVICES.get(key.name, {type: "json"}) // Get service
        value.name = key.name // Add name to payload
        delete value.subscribers // Remove subscribers from payload
        payload.push(value) // Add service to payload array
    }
    return payload;
})