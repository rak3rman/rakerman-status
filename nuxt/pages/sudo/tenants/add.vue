<template>
  <div class="flex flex-col isolate bg-primary min-h-screen">
    <Notification
      :show="isSubmittedNote"
      title="Tenant Saved"
      desc="Tenant was save successfully. Redirecting to Tenant List..."
      is-success
      @close="isSubmittedNote = false"
    />
    <Notification
      :show="isIssuesNote"
      title="Invalid Tenant"
      :desc="
        'We found ' +
        issues.length +
        ' issue' +
        (issues.length === 1 ? '' : 's') +
        ' preventing your tenant from being saved. Please correct and try again.'
      "
      @close="isIssuesNote = false"
    />
    <Header />
    <main class="flex-1 flex flex-col">
      <Hero>
        <h1
          class="text-4xl font-bold tracking-tight sm:text-center sm:text-6xl text-neutral"
        >
          Add Tenant
        </h1>
        <p class="mt-6 text-lg leading-8 text-accent sm:text-center">
          <strong>Sudo Action</strong>. Create a new tenant for RAkerman Status
          using the form below.
        </p>
        <div class="mt-8 flex gap-x-4 sm:justify-center">
          <NuxtLink
            to="/sudo/tenants"
            class="inline-block rounded-lg px-4 py-1.5 text-base font-semibold leading-7 text-neutral ring-1 ring-accent hover:ring-accent-focus"
          >
            Return to Tenant List
            <span class="text-accent" aria-hidden="true">&rarr;</span>
          </NuxtLink>
        </div>
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

              <div class="space-y-6 sm:space-y-5 text-neutral">
                <div
                  class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-neutral sm:pt-5"
                >
                  <label
                    for="domain"
                    class="block text-sm font-medium text-neutral sm:mt-px sm:pt-2"
                    >Domain*</label
                  >
                  <div class="mt-1 sm:col-span-2 sm:mt-0">
                    <input
                      type="text"
                      name="domain"
                      id="domain"
                      v-model="tenant.domain"
                      :readonly="!isNew"
                      class="block w-full max-w-lg rounded-md bg-primary-focus border-accent shadow-sm focus:border-secondary focus:ring-secondary sm:max-w-xs sm:text-sm"
                    />
                    <p
                      class="mt-2 text-sm text-error"
                      v-if="
                        issues.filter((e) => e.field === 'domain').length < 1 &&
                        isNew
                      "
                    >
                      NOTE: Your domain <strong>cannot</strong> be changed after
                      it is set.
                    </p>
                    <p class="mt-2 text-sm text-accent" v-if="!isNew">
                      NOTE: Your domain <strong>cannot</strong> be changed.
                    </p>
                    <FormIssues :issues="issues" field="domain" />
                  </div>
                </div>

                <div
                  class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-neutral sm:pt-5"
                >
                  <label
                    for="title"
                    class="block text-sm font-medium text-neutral sm:mt-px sm:pt-2"
                    >Title*</label
                  >
                  <div class="mt-1 sm:col-span-2 sm:mt-0">
                    <input
                      type="text"
                      name="title"
                      id="title"
                      v-model="tenant.title"
                      class="block w-full max-w-lg rounded-md bg-primary-focus border-accent shadow-sm focus:border-secondary focus:ring-secondary sm:max-w-xs sm:text-sm"
                    />
                    <FormIssues :issues="issues" field="title" />
                  </div>
                </div>

                <div
                  class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-neutral sm:pt-5"
                >
                  <label
                    for="logo"
                    class="block text-sm font-medium text-neutral sm:mt-px sm:pt-2"
                    >Logo*</label
                  >
                  <div class="mt-1 sm:col-span-2 sm:mt-0">
                    <input
                      type="text"
                      name="logo"
                      id="logo"
                      v-model="tenant.logo"
                      class="block w-full max-w-lg rounded-md bg-primary-focus border-accent shadow-sm focus:border-secondary focus:ring-secondary sm:max-w-xl sm:text-sm"
                    />
                    <FormIssues :issues="issues" field="logo" />
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
                class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-secondary py-2 px-4 text-sm font-medium text-secondary-content shadow-sm hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
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
definePageMeta({
  middleware: ["enforce-sudo"],
});

const config = useRuntimeConfig();
const route = useRoute();

// Issues on submit
const issues = reactive([]);

// Create a new instance of Auth0 Client
let { auth, isAuth, token, userAuth0, userAuthor } = await getAuth0();

let tenant = reactive({
  domain: "",
  title: "",
  usernames: [userAuthor.value.profile.username],
  logo: "",
});

console.log(tenant);

let isNew = ref(true);
let isSubmitting = ref(false);
let isIssuesNote = ref(false);
let isSubmittedNote = ref(false);

const sendForm = async () => {
  isSubmitting.value = true;
  const { data, error } = await useFetch("/api/tenant", {
    method: isNew.value ? "POST" : "PUT",
    server: false, // not to Nitro
    baseURL: config.urlBase.back, // backend url
    headers: {
      // auth headers
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(tenant),
  });
  // Reset and construct form field issues
  issues.length = 0;
  if (error.value) {
    // Add issues to issues array
    error.value.response._data.error.issues.forEach((issue) => {
      issue.path.forEach((pth) => {
        issues.push({
          field: pth,
          message: issue.message,
        });
      });
    });
    isIssuesNote.value = true;
    isSubmittedNote.value = false;
  } else {
    isNew.value = false;
    isIssuesNote.value = false;
    isSubmittedNote.value = true;
    await navigateTo("/sudo/tenants");
  }
  isSubmitting.value = false;
};
</script>