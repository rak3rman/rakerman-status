export default defineNuxtPlugin(() => {
    console.log("hiyaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    function pingServers(event) {
        console.log(event)
        return "successful pinging"
    }
    addEventListener('scheduled', event => {
        // @ts-ignore
        event.waitUntil(pingServers(event));
    });
})

