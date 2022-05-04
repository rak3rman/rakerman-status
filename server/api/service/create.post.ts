export default defineEventHandler(async (event) => {
    let example = {
        name: "www.rakerman.com",
        location: "US Central S1"
    }
    let key = example.name
    delete example.name
    console.log(example)
    // @ts-ignore
    return await SERVICES.put(key, JSON.stringify(example))
})