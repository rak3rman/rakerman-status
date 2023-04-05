<template>
  <Html class="h-full bg-white scroll-smooth">
  <Head>
    <Meta charset="UTF-8" />
    <Title>{{ title }}</Title>
    <Meta name="HandheldFriendly" content="True" />
    <Meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <Meta name="referrer" content="no-referrer-when-downgrade" />
    <Link href="/css/main.css" rel="stylesheet" />
    <Link rel="icon" type="png" href="https://imagedelivery.net/5zM6Rdl2uV8Hmr9WxRh20g/cbeec7ce-7b51-4cc2-81bb-e72289777900/sm" />
    <Link rel="canonical" :content="url" />
    <Meta property="og:site_name" :content="title" />
    <Meta property="og:title" :content="title" />
    <Meta name="description" :content="desc" />
    <Meta property="og:description" :content="desc" />
    <Meta property="og:type" content="website" />
    <Meta property="og:url" :content="url" />
    <Meta property="og:image" content="https://imagedelivery.net/5zM6Rdl2uV8Hmr9WxRh20g/aeba9222-aac7-48d8-8328-ff3f1c3da400/md" />
    <Meta property="og:image:width" content="600" />
    <Meta property="og:image:height" content="450" />
  </Head>
  </Html>
  <Body class="h-full" />
  <div class="h-full">
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </div>
  <Script src="/api/alert" />
</template>

<script>
const title = "RAkerman Status"
const desc = "A globally-distributed, real-time status monitor for all RAkerman services"
const url = "https://status.rakerman.com/"

export default {
  data () {
    return {
      title,
      desc,
      url,
    }
  },
}
</script>
