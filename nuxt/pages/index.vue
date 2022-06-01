<script setup>
import { DateTime } from 'luxon'
import { useLazyFetch } from 'nuxt/app'
// Get services from API
let { pending, data: services } = await useLazyFetch('/api/service')
// Possible background images
const images = [
  'https://imagedelivery.net/5zM6Rdl2uV8Hmr9WxRh20g/fa35b458-67ec-4711-0256-9f68535cbd00/xl',
  'https://imagedelivery.net/5zM6Rdl2uV8Hmr9WxRh20g/b5bd8f82-3b48-4766-18a9-3dc686c77700/xl',
  'https://imagedelivery.net/5zM6Rdl2uV8Hmr9WxRh20g/29fc49b8-6e47-4192-ca52-5025b5dae300/xl',
  'https://imagedelivery.net/5zM6Rdl2uV8Hmr9WxRh20g/ae99ca49-5cb7-4794-3000-2065e3d94100/xl',
  'https://imagedelivery.net/5zM6Rdl2uV8Hmr9WxRh20g/9036aeb5-ffa0-49ef-f5e3-3d40ac6d3800/xl',
  'https://imagedelivery.net/5zM6Rdl2uV8Hmr9WxRh20g/69564523-4f8b-47ab-ad8c-b50426a0bd00/xl',
  'https://imagedelivery.net/5zM6Rdl2uV8Hmr9WxRh20g/aeba9222-aac7-48d8-8328-ff3f1c3da400/xl',
]
</script>

<template>
  <div class="h-full">
    <RAFBanner />
    <div class="h-min-screen lg:h-full flex">
      <div class="flex-1 flex flex-col justify-center lg:flex-none py-20 px-4 sm:px-6 lg:px-20 xl:px-24">

        <div class="mx-auto w-full max-w-md lg:w-[25rem] pb-4 ">
          <img class="h-8 w-auto" src="https://imagedelivery.net/5zM6Rdl2uV8Hmr9WxRh20g/3f01c971-e3db-40a2-5116-659eab771900/md" />
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900" v-if="services.filter(s => !s.is_up).length === 0">All services operational.</h2>
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900" v-else-if="services.filter(s => !s.is_up && !s.is_maintain).length === 0">Scheduled <br>maintenance underway.</h2>
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900" v-else>Houston, <br>we have a problem.</h2>
          <p class="mt-2 text-sm text-gray-600" v-if="services.filter(s => !s.is_up).length === 0">
            Having problems with a service?
            {{ ' ' }}
            <a href="https://www.rakerman.com/contact" class="font-medium" style="color: #586CB2"> Let us know. </a>
          </p>
          <p class="mt-2 text-sm text-gray-600" v-else>
            Sit tight. We are working hard on a fix.
          </p>
        </div>

        <div class="mx-auto w-full max-w-md lg:w-[25rem] overflow-auto pb-1.5">
          <div class="overflow-auto lg:pr-3">
            <ul role="list" class="relative z-0 divide-y divide-gray-200 border-b border-t border-gray-200 overflow-auto">
              <li v-for="service in services" :key="service.name" class="relative py-3 hover:bg-gray-50 snap-center" v-if="!pending">
                <div class="flex items-center justify-between space-x-4">
                  <div class="min-w-0 space-y-2">
                    <div class="flex items-center space-x-3 pl-0.5">
                      <span :class="[service.is_up ? 'bg-green-100' : service.is_maintain ? 'bg-yellow-100' : 'bg-red-100', 'h-4 w-4 px-1 rounded-full flex items-center justify-center']">
                        <span :class="[service.is_up ? 'bg-green-400' : service.is_maintain ? 'bg-yellow-400' : 'bg-red-400', 'h-2 w-2 rounded-full']" />
                      </span>

                      <span class="block">
                        <h2 class="text-sm font-medium text-gray-700">
                          <a :href="'https://' + service.name">
                            <span class="absolute inset-0" aria-hidden="true" />
                            {{ service.name }}
                          </a>
                        </h2>
                      </span>
                    </div>
<!--                    <div class="relative group flex items-center space-x-2.5" v-if="service.is_up">-->
<!--                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">-->
<!--                        <path fill-rule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 9a1 1 0 011 1v.01a1 1 0 11-2 0V10a1 1 0 011-1z" clip-rule="evenodd" />-->
<!--                      </svg>-->
<!--                      <span class="text-sm text-gray-500 font-medium truncate">-->
<!--                        Available<span class="font-normal">, {{ service.trip_time }} ms trip</span>-->
<!--                      </span>-->
<!--                    </div>-->
                    <div class="relative group flex items-center space-x-2.5" v-if="service.is_maintain">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                      </svg>
                      <span class="text-sm text-gray-500 font-medium truncate">
                      Maintenance <span class="font-normal">({{ service.last_err_code }})</span>
                    </span>
                    </div>
                    <div class="relative group flex items-center space-x-2.5" v-else-if="!service.is_up">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                      <span class="text-sm text-gray-500 font-medium truncate">
                      Offline <span class="font-normal">({{ service.last_err_code }})</span>
                    </span>
                    </div>
                  </div>
                  <div class="sm:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="hidden sm:flex flex-col flex-shrink-0 items-end space-y-2">
                    <p class="flex items-center space-x-4">
                      <span v-if="service.is_up" class="text-sm text-gray-500 font-normal">
                        {{ service.location }}, {{ service.trip_time }} ms trip
                      </span>
                      <span v-else class="relative text-sm text-gray-500"> {{ service.location }} </span>
                    </p>
                    <p class="flex text-gray-500 text-sm space-x-2" v-if="!service.is_up">
                      <span>Went down {{ DateTime.fromMillis(parseInt(service.last_up)).toRelative() }}</span>
                    </p>
                  </div>
                </div>
              </li>
              <li class="relative py-3 hover:bg-gray-50 snap-center" v-else>
                <div class="flex items-center justify-center space-x-4">
                  <h2 class="text-sm font-medium">
                    Loading services...
                  </h2>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div class="mx-auto w-full max-w-md lg:w-[25rem] flow-root pr-3">
          <a href="https://github.com/rak3rman/rakerman-status" class="mt-1.5 flex flex-inline items-center text-sm text-gray-400 float-left">
            rak3rman/rakerman-status
            <svg class="pt-1 pl-1 h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M5.965 12.703a5.1 5.1 0 003.327.29 4.877 4.877 0 003.032-2.283c.46-.797.68-1.807.769-2.831.09-1.032.05-2.122-.04-3.11a28.907 28.907 0 00-.561-3.579l-.004-.015-.001-.006-.503.12.503-.12-.646-.377-.005.002L11.82.8l-.056.016a26.659 26.659 0 00-.965.314 28.99 28.99 0 00-2.4.95c-.909.41-1.883.915-2.74 1.505-.85.585-1.621 1.278-2.083 2.076a4.877 4.877 0 00-.461 3.768A5.1 5.1 0 005.082 12.2l-1.527 2.644.88.508 1.53-2.649zm.52-.901c.81.336 1.707.405 2.553.19a3.843 3.843 0 002.39-1.799c.352-.608.552-1.446.635-2.404.083-.95.047-1.974-.039-2.926a27.88 27.88 0 00-.426-2.912 27.97 27.97 0 00-2.772 1.07c-.878.396-1.792.872-2.58 1.414-.794.547-1.423 1.135-1.774 1.742a3.843 3.843 0 00-.361 2.97c.242.86.769 1.617 1.49 2.153l2.83-4.9.88.508-2.826 4.894zM11.841.792l.143.497-.143-.497z"></path>
            </svg>
          </a>
          <p class="mt-2 text-sm text-gray-400 float-right">v2.2.3</p>
        </div>

      </div>
      <div class="hidden lg:block relative w-0 flex-1">
        <img class="absolute inset-0 h-full w-full object-cover" :src="images[Math.floor(Math.random()*images.length)]" alt="" />
      </div>
    </div>
  </div>
</template>