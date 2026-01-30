import cron from "node-cron"
import { refreshGlobal } from "./refreshGlobal.js"
import { refreshIndia } from "./refreshIndia.js"
import { refreshTechnologies } from "./refreshTechnologies.js"

let isRunning = false

export function startDailyRefreshJob() {
  console.log("⏰ Daily refresh cron registered (02:00 UTC)")

  cron.schedule("0 2 * * *", async () => {
    if (isRunning) {
      console.warn("⚠️ Daily refresh skipped (already running)")
      return
    }

    isRunning = true
    console.log("🌙 Nightly refresh started")

    try {
      await refreshGlobal()
      console.log("🌍 Global refresh done")

      await refreshIndia()
      console.log("🇮🇳 India refresh done")

      await refreshTechnologies()
      console.log("🧠 Technologies refresh done")

      console.log("✅ Nightly refresh finished")
    } catch (err) {
      console.error("❌ Nightly refresh failed:", err)
    } finally {
      isRunning = false
    }
  })
}

export async function triggerDailyRefresh(source = "manual") {
  if (isRunning) {
    return { status: "skipped", reason: "already running" }
  }

  isRunning = true
  console.log(`🔄 Refresh triggered (${source})`)

  try {
    await refreshGlobal()
    return { status: "ok" }
  } finally {
    isRunning = false
  }
}
