export default defineNuxtPlugin(() => {
    return {
        provide: {
            ping() {
                return "successful ping"
            },
            async scheduled(event, env, ctx) {
                ctx.waitUntil(this.ping());
            },
        }
    }
})

