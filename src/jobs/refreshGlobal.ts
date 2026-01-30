import fetch from "node-fetch"
import { connectDB } from "../lib/mongodb.js"
import {Global} from "../models/technology.js"

const ML_TRIGGER_URL = process.env.ML_TRIGGER_URL
const ML_TOKEN = process.env.ML_INTERNAL_TOKEN

type GlobalMLResponse = {
  global: {
    patents?: unknown
    trends?: unknown
    investments?: unknown
  }
}

export async function refreshGlobal() {
  if (!ML_TRIGGER_URL || !ML_TOKEN) {
    throw new Error("Missing ML_TRIGGER_URL or ML_INTERNAL_TOKEN")
  }

  console.log("🌍 [refreshGlobal] Fetching global data from ML")

  /* ================= CALL ML ================= */

  const res = await fetch(`${ML_TRIGGER_URL}/internal/run-global`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ML_TOKEN}`,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`ML global pipeline failed: ${text}`)
  }

  const payload = (await res.json()) as GlobalMLResponse

  if (!payload.global) {
    throw new Error("ML response missing `global` key")
  }

  const { patents, trends, investments } = payload.global

  console.log("📦 [refreshGlobal] Sections received:", {
    patents: !!patents,
    trends: !!trends,
    investments: !!investments,
  })

  /* ================= STORE IN DB ================= */

  await connectDB()

  await Global.findOneAndUpdate(
    { name: "__global__" },
    {
      name: "__global__",
      latest_json: {
        global: {
          patents,
          trends,
          investments,
        },
      },
      last_refreshed_at: new Date(),
      updated_at: new Date(),
    },
    { upsert: true, new: true }
  )

  console.log("✅ [refreshGlobal] Global data stored in MongoDB")
}
