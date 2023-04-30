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
          Below are all services you've created on RAkerman Status.
        </p>
        <div class="mt-8 flex gap-x-4 sm:justify-center">
          <NuxtLink
            to="/services/add"
            class="inline-block rounded-lg px-4 py-1.5 text-base font-semibold leading-7 text-neutral ring-1 ring-accent hover:ring-accent-focus"
          >
            Add Service
            <span class="text-accent" aria-hidden="true">&rarr;</span>
          </NuxtLink>
        </div>
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
definePageMeta({
  middleware: ["enforce-auth"],
});
</script>