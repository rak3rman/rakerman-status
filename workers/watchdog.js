async function triggerEvent(event) {
    // Fetch some data
    console.log('cron processed', event.scheduledTime);
    return "sample data"
}

const worker = {
    async scheduled(event, env, ctx) {
        ctx.waitUntil(triggerEvent(event));
    },
};

export default worker;
