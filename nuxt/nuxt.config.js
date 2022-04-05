export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'RAkerman Status',
    htmlAttrs: {
      lang: 'en',
      class: 'h-full'
    },
    bodyAttrs: {
      class: 'h-full'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'A real-time status monitor for rakerman.com' },
      { name: 'og:description', content: 'A real-time status monitor for rakerman.com' },
      { name: 'og:site_name', content: 'RAkerman Status' },
      { name: 'og:title', content: 'RAkerman Status' },
      { name: 'og:type', content: 'website' },
      { name: 'og:url', content: 'https://status.rakerman.com/' },
      { name: 'og:image', content: 'https://status.rakerman.com/images/bg5.jpeg' },
      { name: 'author', content: 'Radison Akerman' },
      { name: 'publisher', content: 'Radison Akerman' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    script: [
      {
        src: "/api/alert"
      }
    ]
  },

  // Server configuration: https://nuxtjs.org/docs/features/configuration/#edit-host-and-port
  server: {
    port: 3000
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '@/static/css/custom.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
    '@nuxtjs/http',
    '@nuxtjs/axios'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  },

  // axios: {
  //   baseURL:'https://status.rakerman.com'
  // },

  serverMiddleware: [
    '~/api/app.js'
  ]
}
