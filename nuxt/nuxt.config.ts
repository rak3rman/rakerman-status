const {gitDescribe, gitDescribeSync} = require('git-describe')

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    typescript: {
        shim: false,
    },
    ssr: false,
    modules: [
        '@nuxtjs/tailwindcss'
    ],
    runtimeConfig: {
        public: {
            urlBase: {
                front: process.env.NODE_ENV == 'production' ? 'https://status.rakerman.com' : 'http://localhost:3000',
                back: process.env.NODE_ENV == 'production' ? 'https://api.status.rakerman.com' : 'http://localhost:8787',
            },
            meta: {
                title: 'RAkerman Status',
                desc: 'A globally-distributed, real-time status monitor for all RAkerman services',
                url: 'https://status.rakerman.com',
                favicon: 'https://imagedelivery.net/5zM6Rdl2uV8Hmr9WxRh20g/cbeec7ce-7b51-4cc2-81bb-e72289777900/sm',
                img: 'https://imagedelivery.net/5zM6Rdl2uV8Hmr9WxRh20g/9036aeb5-ffa0-49ef-f5e3-3d40ac6d3800/md',
            },
            auth0: {
                domain: 'rakerman.us.auth0.com',
                client_id: 'khPGZMLGaERG1xGRncMBkW4Y5pLrFBMy',
                redirect_url: '/dashboard',
            },
            gitMasterTag: gitDescribeSync().hash,
            version: '2.3.0'
        }
    }
})