<template>
  <div class="mx-auto w-full max-w-md lg:w-[25rem] overflow-auto pb-1.5">
    <div class="overflow-auto lg:pr-3">
      <ul
        role="list"
        class="relative z-0 divide-y divide-gray-200 border-b border-t border-gray-200 overflow-auto"
      >
        <li
          v-for="service in props.services"
          :key="service.url"
          class="relative py-3 snap-center"
          v-if="!props.pending"
        >
          <div class="flex items-center justify-between space-x-4">
            <div class="min-w-0 space-y-2">
              <div class="flex items-center space-x-3 pl-0.5">
                <span
                  :class="[
                    service.is_up
                      ? 'bg-green-100'
                      : service.is_maintain
                      ? 'bg-yellow-100'
                      : 'bg-red-100',
                    'h-4 w-4 px-1 rounded-full flex items-center justify-center',
                  ]"
                >
                  <span
                    :class="[
                      service.is_up
                        ? 'bg-green-400'
                        : service.is_maintain
                        ? 'bg-yellow-400'
                        : 'bg-red-400',
                      'h-2 w-2 rounded-full',
                    ]"
                  />
                </span>
                <span class="block">
                  <span class="text-sm font-medium text-gray-700">
                    <a :href="service.url">
                      <span class="absolute inset-0" aria-hidden="true" />
                      {{ service.url.replace(/(^\w+:|^)\/\//, "") }}
                    </a>
                  </span>
                </span>
              </div>
              <div
                class="relative group flex items-center space-x-2.5 sm:hidden"
                v-if="service.is_up"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 9a1 1 0 011 1v.01a1 1 0 11-2 0V10a1 1 0 011-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-sm text-gray-500 font-medium truncate">
                  Available<span class="font-normal"
                    >, {{ service.trip_time }} ms trip</span
                  >
                </span>
              </div>
              <div
                class="relative group flex items-center space-x-2.5"
                v-else-if="service.is_maintain"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-sm text-gray-500 font-medium truncate">
                  Maintenance
                  <span class="font-normal">({{ service.last_err_code }})</span>
                </span>
              </div>
              <div
                class="relative group flex items-center space-x-2.5"
                v-else-if="!service.is_up"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-sm text-gray-500 font-medium truncate">
                  Offline
                  <span class="font-normal">({{ service.last_err_code }})</span>
                </span>
              </div>
            </div>
            <div class="sm:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div
              class="hidden sm:flex flex-col flex-shrink-0 items-end space-y-2"
            >
              <p class="flex items-center space-x-4">
                <span
                  v-if="service.is_up"
                  class="text-sm text-gray-500 font-normal"
                >
                  {{ service.group }}, {{ service.trip_time }} ms trip
                </span>
                <span v-else class="relative text-sm text-gray-500">
                  {{ service.group }}
                </span>
              </p>
              <p
                class="flex text-gray-500 text-sm space-x-2"
                v-if="!service.is_up"
              >
                <span
                  >Went down
                  {{
                    DateTime.fromMillis(parseInt(service.last_up)).toRelative()
                  }}</span
                >
              </p>
            </div>
          </div>
        </li>
        <li class="relative py-3 snap-center" v-else>
          <div class="flex items-center justify-center space-x-4">
            <h2 class="text-sm font-medium">Loading services...</h2>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { DateTime } from "luxon";

const props = defineProps({
  services: Object,
  pending: Boolean,
});
</script>