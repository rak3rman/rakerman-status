<template>
  <ul role="list" class="divide-y divide-accent/20">
    <li
      v-for="service in tenant.services"
      :key="service.url"
      class="flex items-center justify-between gap-x-6 py-5"
    >
      <div class="min-w-0">
        <div class="flex items-start gap-x-3">
          <p class="text-sm font-semibold leading-6 text-gray-900">
            {{ service.name }}
          </p>
          <p
            class="rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset text-green-700 bg-green-50 ring-green-600/20"
            v-if="service.is_up"
          >
            Online
          </p>
          <p
            class="rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset text-red-600 bg-red-50 ring-red-500/10"
            v-else
          >
            Offline ({{ service.last_err_code }})
          </p>
          <p
            class="rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset text-yellow-800 bg-yellow-50 ring-yellow-600/20"
            v-if="service.is_maintain"
          >
            Maintenance
          </p>
        </div>
        <div
          class="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500"
        >
          <p class="whitespace-nowrap">
            Last up
            {{ DateTime.fromMillis(parseInt(service.last_up)).toRelative() }}
          </p>
          <svg viewBox="0 0 2 2" class="h-0.5 w-0.5 fill-current">
            <circle cx="1" cy="1" r="1" />
          </svg>
          <p class="whitespace-nowrap">
            Last down
            {{ DateTime.fromMillis(parseInt(service.last_down)).toRelative() }}
          </p>
          <svg viewBox="0 0 2 2" class="h-0.5 w-0.5 fill-current">
            <circle cx="1" cy="1" r="1" />
          </svg>
          <p class="truncate">{{ service.group }}</p>
        </div>
      </div>
      <div class="flex flex-none items-center gap-x-4">
        <NuxtLink
          :to="service.url"
          class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
          >View Site</NuxtLink
        >
        <Menu as="div" class="relative flex-none">
          <MenuButton
            class="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900"
          >
            <span class="sr-only">Open options</span>
            <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
          </MenuButton>
          <transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <MenuItems
              class="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none"
            >
              <!--              <MenuItem v-slot="{ active }">-->
              <!--                <NuxtLink-->
              <!--                  :to="'/services/' + service.url"-->
              <!--                  :class="[-->
              <!--                    active ? 'bg-gray-50' : '',-->
              <!--                    'block px-3 py-1 text-sm leading-6 text-gray-900',-->
              <!--                  ]"-->
              <!--                  >Edit</NuxtLink-->
              <!--                >-->
              <!--              </MenuItem>-->
              <MenuItem v-slot="{ active }">
                <NuxtLink
                  :to="service.repo"
                  :class="[
                    active ? 'bg-gray-50' : '',
                    'block px-3 py-1 text-sm leading-6 text-gray-900',
                  ]"
                  external
                  >Open Repo</NuxtLink
                >
              </MenuItem>
              <!--              <MenuItem v-slot="{ active }">-->
              <!--                <a-->
              <!--                  href="#"-->
              <!--                  :class="[-->
              <!--                    active ? 'bg-gray-50' : '',-->
              <!--                    'block px-3 py-1 text-sm leading-6 text-gray-900',-->
              <!--                  ]"-->
              <!--                  >Delete</a-->
              <!--                >-->
              <!--              </MenuItem>-->
            </MenuItems>
          </transition>
        </Menu>
      </div>
    </li>
  </ul>
</template>

<script setup>
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { EllipsisVerticalIcon } from "@heroicons/vue/20/solid";
import { DateTime } from "luxon";

const config = useRuntimeConfig();

let { auth, isAuth, token, userAuth0, userAuthor } = await getAuth0();

const { data: tenant } = await useFetch("/api/services/cached", {
  method: "GET",
  server: false, // not to Nitro
  baseURL: config.urlBase.back, // backend url
  headers: {
    // auth headers
    Authorization: "Bearer " + token,
  },
});
</script>