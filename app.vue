<template>
  <Html class="h-full bg-white scroll-smooth">
  <Head>
    <Meta charset="UTF-8" />
    <Title>{{ title }}</Title>
    <Meta name="HandheldFriendly" content="True" />
    <Meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <Meta name="referrer" content="no-referrer-when-downgrade" />
    <Link href="/css/main.css" rel="stylesheet" />
    <Link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <Link rel="canonical" :content="url" />
    <Meta property="og:site_name" :content="title" />
    <Meta property="og:title" :content="title" />
    <Meta name="description" :content="desc" />
    <Meta property="og:description" :content="desc" />
    <Meta property="og:type" content="website" />
    <Meta property="og:url" :content="url" />
    <Meta property="og:image" :content="url + 'img/spread.jpg'" />
    <Meta property="og:image:width" content="2000" />
    <Meta property="og:image:height" content="2000" />
  </Head>
  </Html>
  <Body class="h-full" />
  <div class="h-full">
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </div>
</template>

<script>
const title = "RAkerman Status"
const desc = "A real-time status monitor for RAkerman services"
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
