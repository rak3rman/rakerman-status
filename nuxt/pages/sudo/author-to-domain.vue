<template>
  <div class="flex flex-col isolate bg-primary min-h-screen">
    <Header />
    <main class="flex-1 flex flex-col">
      <Hero>
        <h1
          class="text-4xl font-bold tracking-tight sm:text-center sm:text-6xl text-neutral"
        >
          Author to Domain
        </h1>
        <p class="mt-6 text-lg leading-8 text-accent sm:text-center">
          Sudo Action. Form a link between an Author username and a domain
          authorized to use RAkerman Status.
        </p>
      </Hero>

      <div
        class="w-full relative mx-auto max-w-3xl px-6 lg:max-w-7xl lg:px-8 pb-10"
      >
        <div class="space-y-6 divide-y divide-neutral">
          <div class="space-y-8 divide-y divide-neutral sm:space-y-5">
            <div class="space-y-6 sm:space-y-5">
              <FormHeader
                title="Profile"
                desc="This information will be displayed publicly so be careful what you share."
              />

              <div class="space-y-6 sm:space-y-5">
                <div
                  class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-neutral sm:pt-5"
                >
                  <label
                    for="username"
                    class="block text-sm font-medium text-neutral sm:mt-px sm:pt-2"
                    >Username*</label
                  >
                  <div class="mt-1 sm:col-span-2 sm:mt-0">
                    <div class="flex max-w-lg rounded-md shadow-sm">
                      <span
                        class="inline-flex items-center rounded-l-md border border-r-0 bg-primary-focus border-accent px-3 text-accent sm:text-sm"
                        >author.rakerman.com/profile/</span
                      >
                      <input
                        type="text"
                        name="username"
                        id="username"
                        autocomplete="username"
                        v-model="profile.username"
                        :readonly="!isOnboarding"
                        class="block w-full min-w-0 flex-1 rounded-none rounded-r-md bg-primary-focus border-accent focus:border-secondary focus:ring-secondary sm:text-sm"
                      />
                    </div>
                    <p
                      class="mt-2 text-sm text-red-600"
                      v-if="
                        issues.filter((e) => e.field === 'username').length <
                          1 && isOnboarding
                      "
                    >
                      NOTE: Your username <strong>cannot</strong> be changed
                      after it is set.
                    </p>
                    <p class="mt-2 text-sm text-accent" v-if="!isOnboarding">
                      NOTE: Your username <strong>cannot</strong> be changed.
                    </p>
                    <FormIssues :issues="issues" field="username" />
                  </div>
                </div>

                <div
                  class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-neutral sm:pt-5"
                >
                  <label
                    for="first-name"
                    class="block text-sm font-medium text-neutral sm:mt-px sm:pt-2"
                    >First name*</label
                  >
                  <div class="mt-1 sm:col-span-2 sm:mt-0">
                    <input
                      type="text"
                      name="first-name"
                      id="first-name"
                      autocomplete="given-name"
                      v-model="profile.first"
                      class="block w-full max-w-lg rounded-md bg-primary-focus border-accent shadow-sm focus:border-secondary focus:ring-secondary sm:max-w-xs sm:text-sm"
                    />
                    <FormIssues :issues="issues" field="first" />
                  </div>
                </div>

                <div
                  class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-neutral sm:pt-5"
                >
                  <label
                    for="last-name"
                    class="block text-sm font-medium text-neutral sm:mt-px sm:pt-2"
                    >Last name*</label
                  >
                  <div class="mt-1 sm:col-span-2 sm:mt-0">
                    <input
                      type="text"
                      name="last-name"
                      id="last-name"
                      autocomplete="family-name"
                      v-model="profile.last"
                      class="block w-full max-w-lg rounded-md bg-primary-focus border-accent shadow-sm focus:border-secondary focus:ring-secondary sm:max-w-xs sm:text-sm"
                    />
                    <FormIssues :issues="issues" field="last" />
                  </div>
                </div>

                <div
                  class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-neutral sm:pt-5"
                >
                  <label
                    for="about"
                    class="block text-sm font-medium text-neutral sm:mt-px sm:pt-2"
                    >About</label
                  >
                  <div class="mt-1 sm:col-span-2 sm:mt-0">
                    <textarea
                      id="about"
                      name="about"
                      rows="3"
                      v-model="profile.bio"
                      class="block w-full max-w-lg rounded-md bg-primary-focus border-accent shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
                    />
                    <p class="mt-2 text-sm text-accent">
                      Write a few words about yourself. Used in apps like
                      <NuxtLink
                        to="https://media.rakerman.com"
                        class="text-secondary"
                        >m8</NuxtLink
                      >.
                    </p>
                    <FormIssues :issues="issues" field="bio" />
                  </div>
                </div>

                <div
                  class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-neutral sm:pt-5"
                >
                  <label
                    for="photo"
                    class="block text-sm font-medium text-neutral sm:mt-px sm:pt-2"
                    >Photo*</label
                  >
                  <div class="mt-1 sm:col-span-2 sm:mt-0">
                    <div class="flex items-center">
                      <RadioGroup v-model="selectedPhotoOption">
                        <div
                          class="grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-4"
                        >
                          <RadioGroupOption
                            :key="photoOptions[0]"
                            :value="photoOptions[0]"
                            @click="profile.useBoringAvatars = false"
                            v-slot="{ checked, active }"
                          >
                            <div
                              :class="[
                                checked
                                  ? 'border-transparent'
                                  : 'border-gray-300',
                                active
                                  ? 'border-secondary ring-2 ring-secondary'
                                  : '',
                                'relative flex cursor-pointer rounded-lg border bg-primary-focus p-4 shadow-sm focus:outline-none',
                              ]"
                            >
                              <span class="flex flex-1 pr-3">
                                <span class="flex flex-col">
                                  <RadioGroupLabel
                                    as="span"
                                    class="flex items-center text-sm font-medium text-accent"
                                  >
                                    SSO Provided
                                    <CheckCircleIcon
                                      :class="[
                                        !checked ? 'invisible' : '',
                                        'ml-1 h-5 w-5 text-secondary',
                                      ]"
                                      aria-hidden="true"
                                    />
                                  </RadioGroupLabel>
                                  <RadioGroupDescription
                                    as="span"
                                    class="mt-1 flex items-center text-sm text-accent"
                                  >
                                    Avatar provided by your single sign on
                                    method
                                  </RadioGroupDescription>
                                </span>
                              </span>
                              <img
                                class="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"
                                :src="user.picture"
                                alt=""
                              />
                              <span
                                :class="[
                                  active ? 'border' : 'border-2',
                                  checked
                                    ? 'border-secondary'
                                    : 'border-transparent',
                                  'pointer-events-none absolute -inset-px rounded-lg',
                                ]"
                                aria-hidden="true"
                              />
                            </div>
                          </RadioGroupOption>
                          <RadioGroupOption
                            :key="photoOptions[1]"
                            :value="photoOptions[1]"
                            @click="profile.useBoringAvatars = true"
                            v-slot="{ checked, active }"
                          >
                            <div
                              :class="[
                                checked
                                  ? 'border-transparent'
                                  : 'border-gray-300',
                                active
                                  ? 'border-secondary ring-2 ring-secondary'
                                  : '',
                                'relative flex cursor-pointer rounded-lg border bg-primary-focus p-4 shadow-sm focus:outline-none',
                              ]"
                            >
                              <span class="flex flex-1 pr-3">
                                <span class="flex flex-col">
                                  <RadioGroupLabel
                                    as="span"
                                    class="flex items-center text-sm font-medium text-accent"
                                  >
                                    Random Avatar
                                    <CheckCircleIcon
                                      :class="[
                                        !checked ? 'invisible' : '',
                                        'ml-1 h-5 w-5 text-secondary',
                                      ]"
                                      aria-hidden="true"
                                    />
                                  </RadioGroupLabel>
                                  <RadioGroupDescription
                                    as="span"
                                    class="mt-1 flex items-center text-sm text-accent"
                                  >
                                    A unique avatar generated from your username
                                  </RadioGroupDescription>
                                </span>
                              </span>
                              <Avatar
                                class="rounded-full flex-shrink-0"
                                :size="40"
                                variant="beam"
                                :name="profile.username"
                              />
                              <span
                                :class="[
                                  active ? 'border' : 'border-2',
                                  checked
                                    ? 'border-secondary'
                                    : 'border-transparent',
                                  'pointer-events-none absolute -inset-px rounded-lg',
                                ]"
                                aria-hidden="true"
                              />
                            </div>
                          </RadioGroupOption>
                        </div>
                      </RadioGroup>
                    </div>
                    <FormIssues :issues="issues" field="useBoringAvatars" />
                    <FormIssues :issues="issues" field="pfp" />
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
                <div
                  class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-neutral sm:pt-5"
                >
                  <label
                    for="email"
                    class="block text-sm font-medium text-neutral sm:mt-px sm:pt-2"
                    >Email address*</label
                  >
                  <div class="mt-1 sm:col-span-2 sm:mt-0">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autocomplete="email"
                      v-model="profile.email"
                      readonly
                      class="block w-full max-w-lg rounded-md bg-primary-focus border-accent shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
                    />
                    <p class="mt-2 text-sm text-accent" v-if="!isOnboarding">
                      NOTE: Your email <strong>cannot</strong> be changed while
                      using Auth0.
                    </p>
                    <FormIssues :issues="issues" field="email" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-5">
            <div class="flex justify-end">
              <NuxtLink
                to="/"
                type="button"
                class="rounded-md border bg-primary-focus border-accent py-2 px-4 text-sm font-medium text-neutral shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
              >
                Cancel
              </NuxtLink>
              <button
                @click="sendForm"
                type="button"
                class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-secondary py-2 px-4 text-sm font-medium text-neutral shadow-sm hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                :class="{
                  'opacity-50 bg-primary-focus hover:bg-primary-focus':
                    isSubmitting,
                }"
                :disabled="isSubmitting"
              >
                <svg
                  class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  v-if="isSubmitting"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {{ isSubmitting ? "Submitting..." : "Everything looks good!" }}
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </main>
  </div>
</template>

<script setup>
import Avatar from "vue-boring-avatars";
import {
  RadioGroup,
  RadioGroupDescription,
  RadioGroupLabel,
  RadioGroupOption,
} from "@headlessui/vue";
import { CheckCircleIcon } from "@heroicons/vue/20/solid";

definePageMeta({
  middleware: ["enforce-sudo"],
});

const config = useRuntimeConfig();

let { auth, isAuth, token, userAuth0, userAuthor } = await getAuth0();
</script>