export default defineNuxtPlugin(() => {
    return {
        provide: {
            async scheduled(event, env, ctx) {
                ctx.waitUntil(console.log("scheduled"));
            },
        }
    }
})

