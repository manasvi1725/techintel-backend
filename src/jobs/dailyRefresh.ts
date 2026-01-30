import cron from "node-cron"
import fetch from "node-fetch"

const ML_TRIGGER_URL = process.env.ML_TRIGGER_URL
const ML_TOKEN = process.env.ML_INTERNAL_TOKEN

export function startDailyRefreshJob() {
  console.log("⏰ Daily refresh cron registered (02:00 UTC)")
  if (!ML_TRIGGER_URL || !ML_TOKEN) {
      console.warn("⚠️ Daily refresh job disabled (env missing)")
          return
            }

              // Every day at 02:00 UTC
                cron.schedule("0 2 * * *", async () => {
                    console.log("🌙 Starting daily DB refresh")

                        try {
                              const res = await fetch(`${ML_TRIGGER_URL}/internal/refresh-all`, {
                                      method: "POST",
                                              headers: {
                                                        Authorization: `Bearer ${ML_TOKEN}`,
                                                                },
                                                                      })

                                                                            if (!res.ok) {
                                                                                    const text = await res.text()
                                                                                            throw new Error(text)
                                                                                                  }

                                                                                                        console.log("✅ Daily DB refresh completed")
                                                                                                            } catch (err) {
                                                                                                                  console.error("❌ Daily refresh failed:", err)
                                                                                                                      }
                                                                                                                        })
                                                                                                                        }

let isRunning = false

export async function triggerDailyRefresh(source = "manual") {
  if (!ML_TRIGGER_URL || !ML_TOKEN) {
    throw new Error("Missing ML_TRIGGER_URL or ML_INTERNAL_TOKEN")
  }

  if (isRunning) {
    return { status: "skipped", reason: "already running" }
  }

  isRunning = true
  console.log(`🔄 Refresh triggered (${source})`)

  try {
    const res = await fetch(`${ML_TRIGGER_URL}/internal/refresh-all`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ML_TOKEN}`,
      },
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(text)
    }

    return { status: "ok" }
  } finally {
    isRunning = false
  }
}                                                                        