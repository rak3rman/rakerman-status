<template>
    <div class="mx-auto w-full max-w-md lg:w-[25rem] pb-4 ">
        <img class="h-8 w-auto" :src="props.image" alt="Logo"/>

        <h2 class="mt-6 text-3xl font-extrabold text-gray-900" v-html="
            props.pending ? 'Fetching services...' :
            props.services === null ? 'Whoops, <br> we had a network issue.' :
            props.services.filter(s => !s.is_up).length === 0 ? 'All services operational.' :
            props.services.filter(s => !s.is_up && !s.is_maintain).length === 0 ? 'Scheduled maintenance underway.' :
            'Houston, <br> we have a problem.'
        "/>

        <p class="mt-2 text-sm text-gray-600" v-html="
            props.pending ? 'Loading services...' :
            props.services === null ? 'Failed to communicate with the API server. Try refreshing the page in a few moments.' :
            props.services.filter(s => !s.is_up).length === 0 ? 'Everything is running as expected.' :
            'Sit tight. We are working hard on a fix.'
        "/>
    </div>
</template>

<script setup>
const props = defineProps({
    image: String,
    services: Object,
    pending: Boolean,
})
</script>