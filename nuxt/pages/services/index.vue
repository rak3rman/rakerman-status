<template>
  <div class="flex flex-col isolate bg-primary min-h-screen">
    <Header />
    <main class="flex-1 flex flex-col">
      <Hero>
        <h1
          class="text-4xl font-bold tracking-tight sm:text-center sm:text-6xl text-neutral"
        >
          Services
        </h1>
        <p class="mt-6 text-lg leading-8 text-accent sm:text-center">
          Below are all services you've created on RAkerman Status. Add more
          using the plus button in the bottom right.
        </p>
      </Hero>

      <div
        class="w-full relative mx-auto max-w-3xl px-6 lg:max-w-7xl lg:px-8 pb-10"
      >
        <ServicesList />
        <Footer />
      </div>
    </main>
  </div>
</template>

<script setup>
import Avatar from "vue-boring-avatars";
import {
  RadioGroup,
  RadioGroupDescription,
  RadioGroupLabel,
  RadioGroupOption,
} from "@headlessui/vue";
import { CheckCircleIcon } from "@heroicons/vue/20/solid";

definePageMeta({
  middleware: ["enforce-auth"],
});

const config = useRuntimeConfig();

// Create a new instance of Auth0 Client
// let { auth, isAuth, user, token } = await getAuth0();

// await useFetch('/api/auth0/user', {
//     method: 'GET',
//     server: false, // not to Nitro
//     baseURL: config.urlBase.back, // backend url
//     headers: { // auth headers
//         Authorization: 'Bearer ' + token
//     },
//     onResponse({ request, response, options }) {
//         console.log(response)
//         if (response.ok && response._data.translator && response._data.exists) {
//             isOnboarding.value = false
//             updateForm(response._data)
//         }
//     },
//     onResponseError({ request, response, options }) {
//         // console.log(response)
//         // err.value = response.status + ' ' + response._data
//     },
//     onRequestError({ request, options, error }) {
//         // console.log(error)
//         // err.value = 'Request Failure: Server Not Reachable'
//     },
// })
</script>