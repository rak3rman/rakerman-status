<template>
  <div class="flex flex-col isolate bg-primary min-h-screen">
    <Notification :show="isSubmittedNote" title="Profile Saved" desc="Details will propagate to other RAkerman Foundation services shortly." is-success @close="isSubmittedNote = false"/>
    <Notification :show="isIssuesNote" title="Invalid Profile" :desc="'We found ' + issues.length + ' issue' + (issues.length === 1 ? '' : 's') + ' preventing your profile from being saved. Please correct and try again.'" @close="isIssuesNote = false"/>
    <Header/>
    <main class="flex-1 flex flex-col">
      <Hero>
        <h1 class="text-4xl font-bold tracking-tight sm:text-center sm:text-6xl text-neutral">
          {{ isOnboarding ? 'Onboarding' : 'Profile' }}
        </h1>
        <p class="mt-6 text-lg leading-8 text-accent sm:text-center">
          Welcome to <strong>Author</strong>, a home for your profile data on all RAkerman Foundation
          services.
          {{ isOnboarding ? 'Setup should take only a few seconds &mdash; we did a bit of the work for you.' : 'Updates to your profile will be reflected across all services.' }}
        </p>
        <!--      <div class="mt-8 flex gap-x-4 sm:justify-center">-->
        <!--        <NuxtLink to="https://status.rakerman.com"-->
        <!--                  class="inline-block rounded-lg px-4 py-1.5 text-base font-semibold leading-7 text-neutral ring-1 ring-accent hover:ring-accent-focus">-->
        <!--          Return to chickens.rakerman.com-->
        <!--          <span class="text-accent" aria-hidden="true">&rarr;</span>-->
        <!--        </NuxtLink>-->
        <!--      </div>-->
      </Hero>

      <div class="w-full relative mx-auto max-w-3xl px-6 lg:max-w-7xl lg:px-8 pb-10">
        <div class="space-y-6 divide-y divide-neutral">
          <div class="space-y-8 divide-y divide-neutral sm:space-y-5">
            <div class="space-y-6 sm:space-y-5">
              <FormHeader
                  title="Profile"
                  desc="This information will be displayed publicly so be careful what you share."
              />

              <div class="space-y-6 sm:space-y-5">
                <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-neutral sm:pt-5">
                  <label for="username"
                         class="block text-sm font-medium text-neutral sm:mt-px sm:pt-2">Username*</label>
                  <div class="mt-1 sm:col-span-2 sm:mt-0">
                    <div class="flex max-w-lg rounded-md shadow-sm">
                      <span class="inline-flex items-center rounded-l-md border border-r-0 bg-primary-focus border-accent px-3 text-accent sm:text-sm">author.rakerman.com/profile/</span>
                      <input type="text" name="username" id="username" autocomplete="username" v-model="services.username" :readonly="!isOnboarding"
                             class="block w-full min-w-0 flex-1 rounded-none rounded-r-md bg-primary-focus border-accent focus:border-secondary focus:ring-secondary sm:text-sm"/>
                    </div>
                    <p class="mt-2 text-sm text-red-600" v-if="issues.filter((e) => e.field === 'username').length < 1 && isOnboarding">
                      NOTE: Your username <strong>cannot</strong> be changed after it is set.
                    </p>
                    <p class="mt-2 text-sm text-accent" v-if="!isOnboarding">
                      NOTE: Your username <strong>cannot</strong> be changed.
                    </p>
                    <FormIssues :issues="issues" field="username"/>
                  </div>
                </div>

                <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-neutral sm:pt-5">
                  <label for="first-name" class="block text-sm font-medium text-neutral sm:mt-px sm:pt-2">First
                    name*</label>
                  <div class="mt-1 sm:col-span-2 sm:mt-0">
                    <input type="text" name="first-name" id="first-name" autocomplete="given-name" v-model="services.first"
                           class="block w-full max-w-lg rounded-md bg-primary-focus border-accent shadow-sm focus:border-secondary focus:ring-secondary sm:max-w-xs sm:text-sm"/>
                    <FormIssues :issues="issues" field="first"/>
                  </div>
                </div>

                <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-neutral sm:pt-5">
                  <label for="last-name" class="block text-sm font-medium text-neutral sm:mt-px sm:pt-2">Last
                    name*</label>
                  <div class="mt-1 sm:col-span-2 sm:mt-0">
                    <input type="text" name="last-name" id="last-name" autocomplete="family-name" v-model="services.last"
                           class="block w-full max-w-lg rounded-md bg-primary-focus border-accent shadow-sm focus:border-secondary focus:ring-secondary sm:max-w-xs sm:text-sm"/>
                    <FormIssues :issues="issues" field="last"/>
                  </div>
                </div>

                <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-neutral sm:pt-5">
                  <label for="about"
                         class="block text-sm font-medium text-neutral sm:mt-px sm:pt-2">About</label>
                  <div class="mt-1 sm:col-span-2 sm:mt-0">
                            <textarea id="about" name="about" rows="3" v-model="services.bio"
                                      class="block w-full max-w-lg rounded-md bg-primary-focus border-accent shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"/>
                    <p class="mt-2 text-sm text-accent">Write a few words about yourself. Used in apps like
                      <NuxtLink to="https://media.rakerman.com" class="text-secondary">m8</NuxtLink>.
                    </p>
                    <FormIssues :issues="issues" field="bio"/>
                  </div>
                </div>

                <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-neutral sm:pt-5">
                  <label for="photo" class="block text-sm font-medium text-neutral sm:mt-px sm:pt-2">Photo*</label>
                  <div class="mt-1 sm:col-span-2 sm:mt-0">
                    <div class="flex items-center">
                      <RadioGroup v-model="selectedPhotoOption">
                        <div class="grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-4">
                          <RadioGroupOption :key="photoOptions[0]" :value="photoOptions[0]" @click="services.useBoringAvatars = false" v-slot="{ checked, active }">
                            <div :class="[checked ? 'border-transparent' : 'border-gray-300', active ? 'border-secondary ring-2 ring-secondary' : '', 'relative flex cursor-pointer rounded-lg border bg-primary-focus p-4 shadow-sm focus:outline-none']">
                              <span class="flex flex-1 pr-3">
                                <span class="flex flex-col">
                                  <RadioGroupLabel as="span" class="flex items-center text-sm font-medium text-accent">
                                    SSO Provided
                                    <CheckCircleIcon :class="[!checked ? 'invisible' : '', 'ml-1 h-5 w-5 text-secondary']" aria-hidden="true" />
                                  </RadioGroupLabel>
                                  <RadioGroupDescription as="span" class="mt-1 flex items-center text-sm text-accent">
                                    Avatar provided by your single sign on method
                                  </RadioGroupDescription>
                                </span>
                              </span>
                              <img class="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" :src="user.picture" alt=""/>
                              <span :class="[active ? 'border' : 'border-2', checked ? 'border-secondary' : 'border-transparent', 'pointer-events-none absolute -inset-px rounded-lg']" aria-hidden="true" />
                            </div>
                          </RadioGroupOption>
                          <RadioGroupOption :key="photoOptions[1]" :value="photoOptions[1]" @click="services.useBoringAvatars = true" v-slot="{ checked, active }">
                            <div :class="[checked ? 'border-transparent' : 'border-gray-300', active ? 'border-secondary ring-2 ring-secondary' : '', 'relative flex cursor-pointer rounded-lg border bg-primary-focus p-4 shadow-sm focus:outline-none']">
                              <span class="flex flex-1 pr-3">
                                <span class="flex flex-col">
                                  <RadioGroupLabel as="span" class="flex items-center text-sm font-medium text-accent">
                                    Random Avatar
                                    <CheckCircleIcon :class="[!checked ? 'invisible' : '', 'ml-1 h-5 w-5 text-secondary']" aria-hidden="true" />
                                  </RadioGroupLabel>
                                  <RadioGroupDescription as="span" class="mt-1 flex items-center text-sm text-accent">
                                    A unique avatar generated from your username
                                  </RadioGroupDescription>
                                </span>
                              </span>
                              <Avatar
                                  class="rounded-full flex-shrink-0"
                                  :size="40"
                                  variant="beam"
                                  :name="services.username"
                              />
                              <span :class="[active ? 'border' : 'border-2', checked ? 'border-secondary' : 'border-transparent', 'pointer-events-none absolute -inset-px rounded-lg']" aria-hidden="true" />
                            </div>
                          </RadioGroupOption>
                        </div>
                      </RadioGroup>
                    </div>
                    <FormIssues :issues="issues" field="useBoringAvatars"/>
                    <FormIssues :issues="issues" field="pfp"/>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-6 pt-8 sm:space-y-5 sm:pt-10">
              <FormHeader
                  title="Personal Information"
                  desc="This information is private and only shown to you when authenticated."
              />
              <div class="space-y-6 sm:space-y-5">
                <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-neutral sm:pt-5">
                  <label for="email" class="block text-sm font-medium text-neutral sm:mt-px sm:pt-2">Email
                    address*</label>
                  <div class="mt-1 sm:col-span-2 sm:mt-0">
                    <input id="email" name="email" type="email" autocomplete="email" v-model="services.email" readonly
                           class="block w-full max-w-lg rounded-md bg-primary-focus border-accent shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"/>
                    <p class="mt-2 text-sm text-accent" v-if="!isOnboarding">
                      NOTE: Your email <strong>cannot</strong> be changed while using Auth0.
                    </p>
                    <FormIssues :issues="issues" field="email"/>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-5">
            <div class="flex justify-end">
              <NuxtLink to="/" type="button"
                        class="rounded-md border bg-primary-focus border-accent py-2 px-4 text-sm font-medium text-neutral shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2">
                Cancel
              </NuxtLink>
              <button @click="sendForm" type="button"
                      class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-secondary py-2 px-4 text-sm font-medium text-neutral shadow-sm hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                      :class="{ 'opacity-50 bg-primary-focus hover:bg-primary-focus': isSubmitting }"
                      :disabled="isSubmitting">
                <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" v-if="isSubmitting">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isSubmitting ? 'Submitting...' : 'Everything looks good!' }}
              </button>
            </div>
          </div>
        </div>
        <Footer/>
      </div>
    </main>
  </div>
</template>

<script setup>
import Avatar from 'vue-boring-avatars'
import { RadioGroup, RadioGroupDescription, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue'
import { CheckCircleIcon } from '@heroicons/vue/20/solid'

definePageMeta({
  middleware: ["enforce-auth"]
})

const config = useRuntimeConfig()

let isOnboarding = ref(true)
let isSubmitting = ref(false)
let isIssuesNote = ref(false)
let isSubmittedNote = ref(false)

// Photo options radio group
const photoOptions = ['sso', 'boring', 'custom']
const selectedPhotoOption = ref(photoOptions[0])

// Issues on submit
const issues = reactive([])

// Create a new instance of Auth0 Client
let {auth, isAuth, user, token} = await getAuth0()

let profile = reactive({
  auth0_sub: user?.sub,
  username: '',
  first: user?.given_name || '',
  last: user?.family_name || '',
  email: user?.email || '',
  bio: '',
  useBoringAvatars: false,
  pfp: user?.picture || '',
})

let updateForm = (data) => {
  services.auth0_sub = data.profile.auth0_sub
  services.username = data.profile.username
  services.first = data.profile.first
  services.last = data.profile.last
  services.email = data.profile.email
  services.bio = data.profile.bio
  services.useBoringAvatars = data.profile.useBoringAvatars
  selectedPhotoOption.value = data.profile.useBoringAvatars ? photoOptions[1] : photoOptions[0]
  services.pfp = data.profile.pfp
}

await useFetch('/api/auth0/user', {
  method: 'GET',
  server: false, // not to Nitro
  baseURL: config.urlBase.back, // backend url
  headers: { // auth headers
    Authorization: 'Bearer ' + token
  },
  onResponse({ request, response, options }) {
    console.log(response)
    if (response.ok && response._data.translator && response._data.exists) {
      isOnboarding.value = false
      updateForm(response._data)
    }
  },
  onResponseError({ request, response, options }) {
    // console.log(response)
    // err.value = response.status + ' ' + response._data
  },
  onRequestError({ request, options, error }) {
    // console.log(error)
    // err.value = 'Request Failure: Server Not Reachable'
  },
})

let sendForm = async () => {
  isSubmitting.value = true
  const {data, error} = await useFetch('/api/auth0/user', {
    method: isOnboarding.value ? 'POST' : 'PUT',
    server: false, // not to Nitro
    baseURL: config.urlBase.back, // backend url
    headers: { // auth headers
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify(services),
  })
  // Reset and construct form field issues
  issues.length = 0
  if (error.value) {
    // Add issues to issues array
    error.value.response._data.error.issues.forEach((issue) => {
      issue.path.forEach((pth) => {
        issues.push({
          field: pth,
          message: issue.message
        })
      })
    })
    isIssuesNote.value = true
    isSubmittedNote.value = false
  } else {
    isOnboarding.value = false
    isIssuesNote.value = false
    isSubmittedNote.value = true
  }
  isSubmitting.value = false
}
</script>