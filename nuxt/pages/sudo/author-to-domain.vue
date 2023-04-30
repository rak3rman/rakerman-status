<template>
  <div class="flex flex-col isolate bg-primary min-h-screen">
    <Header />
    <main class="flex-1 flex flex-col">
      <Hero>
        <h1
          class="text-4xl font-bold tracking-tight sm:text-center sm:text-6xl text-neutral"
        >
          User List
        </h1>
        <p class="mt-6 text-lg leading-8 text-accent sm:text-center">
          <strong>Sudo Action</strong>. Displays all users stored in Author.
        </p>
      </Hero>

      <div class="px-4 sm:px-6 lg:px-8">
        <div class="mt-8 flow-root">
          <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div
              class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8"
            >
              <table class="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-neutral sm:pl-0"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-neutral"
                    >
                      Username
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-neutral"
                    >
                      Strategy
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-neutral"
                    >
                      Auth ID
                    </th>
                    <!--                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">-->
                    <!--                      <span class="sr-only">Edit</span>-->
                    <!--                    </th>-->
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="user in users" :key="user.username">
                    <td
                      class="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0"
                    >
                      <div class="flex items-center">
                        <div class="h-11 w-11 flex-shrink-0">
                          <Avatar
                            class="rounded-full flex-shrink-0"
                            :size="40"
                            variant="beam"
                            :name="user.username"
                            v-if="user.useBoringAvatars"
                          />
                          <img
                            class="h-11 w-11 rounded-full"
                            :src="user.pfp"
                            alt=""
                            v-else
                          />
                        </div>
                        <div class="ml-4">
                          <div class="font-medium text-neutral">
                            {{ user.first }} {{ user.last }}
                          </div>
                          <div class="mt-1 text-accent">
                            {{ user.email }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-5 text-sm text-accent">
                      {{ user.username }}
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-5 text-sm text-gray-500"
                    >
                      <span
                        class="inline-flex rounded-full bg-success px-2 text-xs font-semibold leading-5 text-white"
                        >Auth0</span
                      >
                    </td>
                    <td class="whitespace-nowrap px-3 py-5 text-sm text-accent">
                      {{ user.auth0_sub }}
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
            </div>
          </div>
        </div>
      </div>

      <div
        class="w-full relative mx-auto max-w-3xl px-6 lg:max-w-7xl lg:px-8 pb-10"
      >
        <Footer />
      </div>
    </main>
  </div>
</template>

<script setup>
import Avatar from "vue-boring-avatars";

definePageMeta({
  middleware: ["enforce-sudo"],
});

const config = useRuntimeConfig();

let { auth, isAuth, token, userAuth0, userAuthor } = await getAuth0();

const { data: users } = await useFetch("/api/auth0/users", {
  method: "GET",
  server: false, // not to Nitro
  baseURL: config.urlBase.back, // backend url
  headers: {
    // auth headers
    Authorization: "Bearer " + token,
  },
});
</script>