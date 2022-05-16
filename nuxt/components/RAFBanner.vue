<template>
  <div class="bg-red-500 bg-yellow-500 hidden" id="raf_alert_banner">
    <div class="mx-auto py-3 px-3 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between flex-wrap">
        <div class="w-0 flex-1 flex items-center" onclick="window.open('https://status.rakerman.com', '_blank');">
                <span class="flex p-2 rounded-lg bg-red-600 bg-yellow-600" id="raf_alert_icon">
                    <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </span>
          <p class="ml-3 text-sm sm:text-md leading-4 text-white truncate">
            <strong><span id="raf_alert_title">Site Maintenance</span>:</strong> <span id="raf_alert_time">Through Next Hour</span>
            <br>
            <span class="text-xs sm:text-sm" id="raf_alert_desc">Unable to retrieve description from status.rakerman.com</span>
          </p>
        </div>
        <div class="flex-shrink-0 sm:ml-3">
          <button type="button" class="-mr-1 flex p-2 rounded-md hover:bg-red-600 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2 bg-transparent bg-none border-none" onclick="hide_raf_alert()" id="raf_alert_hide">
            <span class="sr-only">Dismiss</span>
            <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
