<!-- RF Nuxt Header, Rev. 04/05/23 -->

<template>
    <Html class="h-full bg-primary scroll-smooth" lang="en"/>
    <Link rel="icon" type="png" :href="config.meta.favicon"/>
    <Link href="/css/main.css" rel="stylesheet" />
    <Body class="h-full bg-primary"/>
    <div class="h-full bg-primary">
        <NuxtLoadingIndicator color="repeating-linear-gradient(to right,#586CB2 0%,#059669 50%,#CCCCCC 100%)" />
        <NuxtPage/>
    </div>
</template>

<script setup>
const config = useRuntimeConfig()

useServerSeoMeta({
    title: config.meta.title,
    ogTitle: config.meta.title,
    description: config.meta.desc,
    ogDescription: config.meta.desc,
    ogImage: config.meta.img,
})
</script>