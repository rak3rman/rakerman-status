<template>
  <div class="h-full">
    <RAFBanner />
    <div class="h-min-screen lg:h-full flex">
      <div class="flex-1 flex flex-col justify-center lg:flex-none py-20 px-4 sm:px-6 lg:px-20 xl:px-24">

        <div class="mx-auto w-full max-w-md lg:w-[25rem] pb-4 ">
          <img class="h-8 w-auto" src="/images/rakerman-logo-dark.png" />
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900" v-if="total_inactive === 0">All services operational.</h2>
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900" v-else-if="total_inactive > 0 && total_maintain > 0">Scheduled <br>maintenance underway.</h2>
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900" v-else>Houston, <br>we have a problem.</h2>
          <p class="mt-2 text-sm text-gray-600" v-if="total_inactive === 0">
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
              <li v-for="service in services" :key="service.name" class="relative py-3 hover:bg-gray-50 snap-center">
                <div class="flex items-center justify-between space-x-4">
                  <div class="min-w-0 space-y-2">
                    <div class="flex items-center space-x-3 pl-0.5">
                    <span :class="[service.active ? 'bg-green-100' : service.maintain ? 'bg-yellow-100' : 'bg-red-100', 'h-4 w-4 px-1 rounded-full flex items-center justify-center']">
                      <span :class="[service.active ? 'bg-green-400' : service.maintain ? 'bg-yellow-400' : 'bg-red-400', 'h-2 w-2 rounded-full']" />
                    </span>

                      <span class="block">
                      <h2 class="text-sm font-medium">
                        <a :href="service.href">
                          <span class="absolute inset-0" aria-hidden="true" />
                          {{ service.name }}
                        </a>
                      </h2>
                    </span>
                    </div>
                    <div class="relative group flex items-center space-x-2.5" v-if="service.active">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 9a1 1 0 011 1v.01a1 1 0 11-2 0V10a1 1 0 011-1z" clip-rule="evenodd" />
                      </svg>
                      <span class="text-sm text-gray-500 font-medium truncate">
                      Available
                    </span>
                    </div>
                    <div class="relative group flex items-center space-x-2.5" v-else-if="service.maintain">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                      </svg>
                      <span class="text-sm text-gray-500 font-medium truncate">
                      Maintenance
                    </span>
                    </div>
                    <div class="relative group flex items-center space-x-2.5" v-else>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                      <span class="text-sm text-gray-500 font-medium truncate">
                      Offline
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
                      <a :href="service.href" class="relative text-sm text-gray-500 hover:text-gray-900 font-medium"> Visit site </a>
                    </p>
                    <p class="flex text-gray-500 text-sm space-x-2">
                      <span>{{ service.location }}</span>
                      <span aria-hidden="true">&middot;</span>
                      <span v-if="service.active">Last incident {{ service.uptime }}</span>
                      <span v-else>Went down {{ service.downtime }}</span>
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div class="mx-auto w-full max-w-md lg:w-[25rem] flow-root pr-3">
          <a href="https://github.com/rak3rman/rakerman-status" class="mt-2 text-sm text-gray-400 float-left">rak3rman/rakerman-status</a>
          <p class="mt-2 text-sm text-gray-400 float-right">v2.2.0</p>
        </div>

      </div>
      <div class="hidden lg:block relative w-0 flex-1">
        <img class="absolute inset-0 h-full w-full object-cover" :src="'/images/bg' + img + '.jpeg'" alt="" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Index",
  data () {
    return {
      services: {},
      total_inactive: 1,
      total_maintain: 0,
      img: Math.floor(Math.random() * (7)) + 1,
    }
  },
  async fetch() {
    // Fetch list of services from api
    this.services = await this.$axios.$get('/api/service/status');
    // Calculate total number of services offline
    this.total_inactive = 0;
    this.total_maintain = 0;
    this.services.forEach(service => {
      if (!service.active) this.total_inactive++;
      if (service.maintain) this.total_maintain++;
    })
  },
}
</script>