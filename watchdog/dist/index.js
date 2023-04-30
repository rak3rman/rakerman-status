async function ping_service(service_url, tenant_domain) {
  // Ping server
  const req_start = Date.now();
  const response = await fetch(service_url, {
    method: "GET",
    redirect: "follow",
  });
  // Return the data we want
  return {
    req_time: Math.round(Date.now() - req_start),
    res_ok:
      response.status === 200 &&
      (response.url !== "https://status.rakerman.com" ||
        service_url === "status.rakerman.com"),
    res_code:
      response.url === "https://status.rakerman.com" &&
      service_url !== "status.rakerman.com"
        ? 500
        : response.status,
  };
}

async function ping_all(event, env) {
  // Loop over all tenants
  const tenants = await env.TENANTS.list();
  for (let i = 0; i < tenants.keys.length; i++) {
    console.log(
      "Looping over tenant " + tenants.keys[i].name + " at " + Date.now()
    );
    // Get cache for tenant from CF KV
    const old_cache = await env.CACHED.get(tenants.keys[i].name, {
      type: "json",
    });
    let new_cache = [];

    // Loop over all services in tenant
    const services = await env.SERVICES.list({
      prefix: tenants.keys[i].name + ":",
    });
    for (let j = 0; j < services.keys.length; j++) {
      console.log(
        "Pinging service " + services.keys[j].name + " at " + Date.now()
      );
      // Get service details from CF KV
      const service = await env.SERVICES.get(services.keys[j].name, {
        type: "text",
      });

      // Get cached service details from old_cache
      const cached_service = old_cache.find((serv) => {
        return serv.name === service.name;
      });
      console.log(cached_service);

      // Ping service, 1st check
      let ping_data = await ping_service(service.url, tenants.keys[i].name);
      console.log(ping_data);

      //   // If state change from last cache, ping again to confirm
      //   if (cached_service?.is_up !== ping_data.res_ok) {
      //     ping_data = await ping_service(service.url, tenants.keys[i].name);
      //   }
      //
      //   // If state retained from last cache, notify admins
      //   if (cached_service?.is_up !== ping_data.res_ok) {
      //     console.log(
      //       "State change detected for " +
      //         service.name +
      //         " in " +
      //         tenants.keys[i].name +
      //         " from " +
      //         cached_service?.is_up +
      //         " to " +
      //         ping_data.res_ok +
      //         " at " +
      //         Date.now() +
      //         " with code " +
      //         ping_data.res_code +
      //         " and trip time " +
      //         ping_data.req_time
      //     );
      //   }
      //
      //   // Construct new cache
      //   new_cache.push({
      //     url: service.url,
      //     name: service.name,
      //     group: service.group,
      //     repo: service.repo,
      //     is_maintain: service.is_maintain,
      //     is_up: ping_data.res_ok,
      //     last_up: ping_data.res_ok
      //       ? Date.now()
      //       : cached_service?.is_up !== ping_data.res_ok
      //       ? Date.now()
      //       : cached_service?.last_flip,
      //     last_down: ping_data.res_ok
      //       ? cached_service?.is_up !== ping_data.res_ok
      //         ? Date.now()
      //         : cached_service?.last_flip
      //       : Date.now(),
      //     trip_time: ping_data.req_time,
      //     last_err_code: ping_data.res_code,
      //   });
    }

    // // Sort services in new_cache by last_down
    // if (new_cache.filter((serv) => !serv.is_up).length > 0) {
    //   new_cache.sort(function (a, b) {
    //     return b.last_down - a.last_down;
    //   });
    // } else {
    //   new_cache.sort(function (a, b) {
    //     let aa = a.name.split(".");
    //     let bb = b.name.split(".");
    //     if (aa[aa.length - 2] === bb[bb.length - 2]) {
    //       return a.name.localeCompare(b.name);
    //     }
    //     return aa[aa.length - 2].localeCompare(bb[bb.length - 2]);
    //   });
    // }
    //
    // // Update services new_cache to CF KV
    // await env.CACHED.put(tenants.keys[i].name, JSON.stringify(new_cache));
  }
  return true;
}

const index = {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(await ping_all(event, env));
  },
};

export default index;