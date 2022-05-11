export default defineEventHandler(async (event) => {
    // @ts-ignore
    return await SERVICES.get('payload', {type: 'json'})
})