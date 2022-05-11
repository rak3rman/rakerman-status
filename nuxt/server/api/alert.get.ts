import { DateTime } from 'luxon'

export default defineEventHandler(async (event) => {
    // @ts-ignore
    let alert = await SERVICES.get('alert', {type: 'json'})
    if (!alert) return ""
    let payload = ""
    let dt1 = DateTime.fromMillis(alert.start)
    let dt2 = DateTime.now().plus({ hours: 12 })
    if (dt1 < dt2) {
        payload = "let raf_alert_tag = \"" + alert.start + "\";\n" +
            "window.onload = function() {\n" +
            "  let raf_sd = new Date(\"" + alert.start + "\");console.log(raf_sd);\n" +
            "  let raf_ed = new Date(\"" + alert.end + "\");console.log(raf_ed);\n" +
            "  function formatAMPM(date) {\n" +
            "    let hours = date.getHours();\n" +
            "    let ampm = hours >= 12 ? 'pm' : 'am';\n" +
            "    hours = hours % 12;\n" +
            "    hours = hours ? hours : 12;\n" +
            "    return hours + ampm;\n" +
            "  }\n" +
            "  (function () {\n" +
            "    if (!window.localStorage.getItem('raf_alert_' + raf_alert_tag)) {\n" +
            "      document.getElementById(\"raf_alert_title\").innerHTML = \"" + (alert.maintain ? "Site Maintenance" : "Service Interruption") + "\";\n" +
            "      document.getElementById(\"raf_alert_desc\").innerHTML = \"" + (alert.maintain ? "Expect extended downtime on all services" : "Expect minor interruptions on select services") + "\";\n" +
            "      document.getElementById(\"raf_alert_time\").innerHTML = raf_sd.toLocaleString('en-us', { month: 'short' }) + \" \" + raf_sd.getDate() + (raf_sd.getDate() > 0 ? ['th', 'st', 'nd', 'rd'][(raf_sd.getDate() > 3 && raf_sd.getDate() < 21) || raf_sd.getDate() % 10 > 3 ? 0 : raf_sd.getDate() % 10] : '') + \", \" + formatAMPM(raf_sd) + \"-\" + formatAMPM(raf_ed)\n" +
            "      document.getElementById(\"raf_alert_banner\").className = \"bg-" + (alert.maintain ? "red" : "yellow") + "-500\";\n" +
            "      document.getElementById(\"raf_alert_icon\").className = \"flex p-2 rounded-lg bg-" + (alert.maintain ? "red" : "yellow") + "-600\";\n" +
            "      document.getElementById(\"raf_alert_hide\").className = \"-mr-1 flex p-2 rounded-md hover:bg-" + (alert.maintain ? "red" : "yellow") + "-600 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2 bg-transparent bg-none border-none\";\n" +
            "    }\n" +
            "  })();\n" +
            "};\n" +
            "function hide_raf_alert() {\n" +
            "  window.localStorage.setItem('raf_alert_' + raf_alert_tag, true);\n" +
            "  document.getElementById(\"raf_alert_banner\").className = \"hidden\";\n" +
            "}\n"
    }
    return payload
})