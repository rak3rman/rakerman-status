<template>
  <div class="flex flex-col isolate bg-primary min-h-screen">
    <Header />
    <main class="flex-1 flex flex-col">
      <Hero>
        <h1
          class="text-4xl font-bold tracking-tight sm:text-center sm:text-6xl text-neutral"
        >
          Tenant List
        </h1>
        <p class="mt-6 text-lg leading-8 text-accent sm:text-center">
          <strong>Sudo Action</strong>. Displays all tenants used in RAkerman
          Status.
        </p>
        <div class="mt-8 flex gap-x-4 sm:justify-center">
          <NuxtLink
            to="/sudo/tenants/add"
            class="inline-block rounded-lg px-4 py-1.5 text-base font-semibold leading-7 text-neutral ring-1 ring-accent hover:ring-accent-focus"
          >
            Add Tenant
            <span class="text-accent" aria-hidden="true">&rarr;</span>
          </NuxtLink>
        </div>
      </Hero>

      <div
        class="w-full relative mx-auto max-w-3xl px-6 lg:max-w-7xl lg:px-8 pb-10"
      >
        <table class="divide-y divide-gray-300 w-full">
          <thead>
            <tr>
              <th
                scope="col"
                class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-neutral sm:pl-0"
              >
                Domain
              </th>
              <th
                scope="col"
                class="px-3 py-3.5 text-left text-sm font-semibold text-neutral"
              >
                Title
              </th>
              <th
                scope="col"
                class="px-3 py-3.5 text-left text-sm font-semibold text-neutral"
              >
                Usernames
              </th>
              <th
                scope="col"
                class="px-3 py-3.5 text-left text-sm font-semibold text-neutral"
              >
                Logo
              </th>
              <!--                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">-->
              <!--                      <span class="sr-only">Edit</span>-->
              <!--                    </th>-->
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="tenant in tenants" :key="tenant.domain">
              <td
                class="whitespace-nowrap py-5 pl-4 pr-3 text-sm text-accent sm:pl-0"
              >
                {{ tenant.domain }}
              </td>
              <td class="whitespace-nowrap px-3 py-5 text-sm text-accent">
                {{ tenant.title }}
              </td>
              <td class="whitespace-nowrap px-3 py-5 text-sm text-accent">
                {{ tenant.usernames }}
              </td>
              <td class="whitespace-nowrap px-3 py-5 text-sm text-accent">
                {{ tenant.logo }}
              </td>
              <!--                    <td-->
              <!--                      class="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0"-->
              <!--                    >-->
              <!--                                            <a-->
              <!--                                              href="#"-->
              <!--                                              class="text-secondary hover:text-secondary-focus"-->
              <!--                                              >Edit<span class="sr-only">, {{ user.first }}</span></a-->
              <!--                                            >-->
              <!--                    </td>-->
            </tr>
          </tbody>
        </table>

        <Footer />
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["enforce-sudo"],
});

const config = useRuntimeConfig();

let { auth, isAuth, token, userAuth0, userAuthor } = await getAuth0();

const { data: tenants } = await useFetch("/api/tenants", {
  method: "GET",
  server: false, // not to Nitro
  baseURL: config.urlBase.back, // backend url
  headers: {
    // auth headers
    Authorization: "Bearer " + token,
  },
});
</script>