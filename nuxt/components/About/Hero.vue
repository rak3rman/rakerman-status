<template>
  <Hero>
    <h1 class="text-4xl font-bold tracking-tight sm:text-center sm:text-6xl text-neutral">
      Author
    </h1>
    <p class="mt-6 text-lg leading-8 text-accent sm:text-center">
      A centralized user management backbone for all RAkerman Foundation services. Instead of manipulating user data on each RF service, Author serves as a "one-stop-shop" for users (to onboard and edit their profile) and RF services (to query user data).
    </p>
    <div class="mt-8 flex gap-x-4 sm:justify-center">
      <NuxtLink to="/profile" v-if="isAuth"
                class="inline-block rounded-lg bg-secondary px-4 py-1.5 text-base font-semibold leading-7 text-neutral shadow-sm ring-1 ring-secondary hover:bg-secondary-focus hover:ring-secondary-focus">
        Manage Profile
        <span class="text-accent" aria-hidden="true">&rarr;</span>
      </NuxtLink>
      <NuxtLink to="/profile" v-else
                class="inline-block rounded-lg bg-secondary px-4 py-1.5 text-base font-semibold leading-7 text-neutral shadow-sm ring-1 ring-secondary hover:bg-secondary-focus hover:ring-secondary-focus">
        Create an Account
        <span class="text-accent" aria-hidden="true">&rarr;</span>
      </NuxtLink>
      <NuxtLink to="https://status.rakerman.com"
                class="inline-block rounded-lg px-4 py-1.5 text-base font-semibold leading-7 text-neutral ring-1 ring-accent hover:ring-accent-focus">
        Site Status
        <span class="text-accent" aria-hidden="true">&rarr;</span>
      </NuxtLink>
    </div>
  </Hero>
</template>

<script setup>
// Create a new instance of Auth0 Client
let {auth, isAuth, user, token} = await getAuth0()
</script>