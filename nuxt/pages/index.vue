<template>
    <div class="h-full">
        <div class="h-min-screen lg:h-full flex">
            <div class="flex-1 flex flex-col justify-center lg:flex-none py-20 px-4 sm:px-6 lg:px-20 xl:px-24">

                <HomeHeader :image="logo" :services="services" :pending="pending"/>
                <HomeServices :services="services" :pending="pending"/>
                <HomeFooter />

            </div>
            <div class="hidden lg:block relative w-0 flex-1">
                <img class="absolute inset-0 h-full w-full object-cover" :src="images[Math.floor(Math.random()*images.length)]" alt="" />
            </div>
        </div>
    </div>
</template>

<script setup>
const config = useRuntimeConfig()

const logo = 'https://imagedelivery.net/5zM6Rdl2uV8Hmr9WxRh20g/3f01c971-e3db-40a2-5116-659eab771900/md'
const images = [
    'https://imagedelivery.net/5zM6Rdl2uV8Hmr9WxRh20g/fa35b458-67ec-4711-0256-9f68535cbd00/2xl',
    'https://imagedelivery.net/5zM6Rdl2uV8Hmr9WxRh20g/29fc49b8-6e47-4192-ca52-5025b5dae300/2xl',
    'https://imagedelivery.net/5zM6Rdl2uV8Hmr9WxRh20g/ae99ca49-5cb7-4794-3000-2065e3d94100/2xl',
    'https://imagedelivery.net/5zM6Rdl2uV8Hmr9WxRh20g/aeba9222-aac7-48d8-8328-ff3f1c3da400/2xl',
]

// Get services from API
let { pending, data: services } = await useLazyFetch('/api/services', {
    method: 'GET',
    server: false, // not to Nitro
    baseURL: config.urlBase.back, // backend url
})
</script>