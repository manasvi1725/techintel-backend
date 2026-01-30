import fetch from "node-fetch"
import { connectDB } from "../lib/mongodb.js"
import {India} from "../models/technology.js"

const ML_TRIGGER_URL = process.env.ML_TRIGGER_URL
const ML_TOKEN = process.env.ML_INTERNAL_TOKEN

type IndiaMLResponse = {
  india: {
    patents?: unknown
    publications?: unknown
  }
}

export async function refreshIndia() {
  if (!ML_TRIGGER_URL || !ML_TOKEN) {
    throw new Error("Missing ML_TRIGGER_URL or ML_INTERNAL_TOKEN")
  }

  console.log("🇮🇳 [refreshIndia] Fetching India data from ML")

  /* ================= CALL ML ================= */

  const res = await fetch(`${ML_TRIGGER_URL}/internal/run-india`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ML_TOKEN}`,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`ML India pipeline failed: ${text}`)
  }

  const payload = (await res.json()) as IndiaMLResponse

  if (!payload.india) {
    throw new Error("ML response missing `india` key")
  }

  const { patents, publications } = payload.india

  console.log("📦 [refreshIndia] Sections received:", {
    patents: !!patents,
    publications: !!publications,
  })

  /* ================= STORE IN DB ================= */

  await connectDB()

  await India.findOneAndUpdate(
    { name: "__india__" },
    {
      name: "__india__",
      latest_json: {
        india: {
          patents,
          publications,
        },
      },
      last_refreshed_at: new Date(),
      updated_at: new Date(),
    },
    { upsert: true, new: true }
  )

  console.log("✅ [refreshIndia] India data stored in MongoDB")
}
