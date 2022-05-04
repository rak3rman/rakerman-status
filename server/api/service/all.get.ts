export default defineEventHandler(async (event) => {
    // @ts-ignore
    let services = await SERVICES.list()
    // Loop through keys and generate payload
    let payload = [];
    for (const key of services.keys) {
        // @ts-ignore
        let value = await SERVICES.get(key.name, {type: "json"});
        value.name = key.name;
        payload.push(value)
    }
    return payload;
})