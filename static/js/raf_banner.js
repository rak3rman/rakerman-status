/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
Filename : rakerman-status/static/js/raf_banner.js
Desc     : pings fallback server to check for alert,
           displays banner if alert needs to be posted
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/

let raf_alert_tag = "";

// Check if we should display banner
function ping_raf_alert() {
  $.ajax({
    url: 'https://api.status.rakerman.com/api/alert',
    success: function(result) {
      // Update global tag
      raf_alert_tag = result.tag;
      // Check if we should display banner
      if (!window.localStorage.getItem('raf_alert_' + raf_alert_tag)) {
        // Construct and display banner
        if (result.type === "maintenance") {
          document.getElementById("raf_alert_title").innerHTML = "Site Maintenance";
          document.getElementById("raf_alert_desc").innerHTML = "Expect extended downtime on all services";
          document.getElementById("raf_alert_time").innerHTML = moment(result.start).format("MMM Do, ha") + "-" + moment(result.end).format("ha");
          document.getElementById("raf_alert_banner").className = "bg-red-500";
          document.getElementById("raf_alert_icon").className = "flex p-2 rounded-lg bg-red-600";
          document.getElementById("raf_alert_hide").className = "-mr-1 flex p-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2 bg-transparent bg-none border-none";
        } else if (result.type === "interrupt") {
          document.getElementById("raf_alert_title").innerHTML = "Service Interruption";
          document.getElementById("raf_alert_desc").innerHTML = "Expect minor interruptions on select services";
          document.getElementById("raf_alert_time").innerHTML = moment(result.start).format("MMM Do, ha");
          document.getElementById("raf_alert_banner").className = "bg-yellow-500";
          document.getElementById("raf_alert_icon").className = "flex p-2 rounded-lg bg-yellow-600";
          document.getElementById("raf_alert_hide").className = "-mr-1 flex p-2 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2 bg-transparent bg-none border-none";
        }
      }
    },
  });
}
ping_raf_alert();

// Hide banner and update local storage
function hide_raf_alert() {
  window.localStorage.setItem('raf_alert_' + raf_alert_tag, true);
  document.getElementById("raf_alert_banner").className = "hidden";
}
