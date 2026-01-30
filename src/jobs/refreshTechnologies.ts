import fetch from "node-fetch"
import {Technology} from "../models/technology.js"
import { connectDB } from "../lib/mongodb.js"

const ML_TRIGGER_URL = process.env.ML_TRIGGER_URL
const ML_TOKEN = process.env.ML_INTERNAL_TOKEN

type  TechnologyDoc = {
  name: string
  latest_json?: unknown
  last_refreshed_at?: Date | null
  updated_at?: Date
}


const ONE_DAY = 24 * 60 * 60 * 1000
const MAX_CONCURRENT = 2

export async function refreshTechnologies() {
  await connectDB()

  const techs = (await Technology.find(
    { name: { $not: /^__/ } },
    { name: 1, last_refreshed_at: 1 }
  ).lean()) as TechnologyDoc[]

  const stale = techs.filter((tech) => {
    if (!tech.last_refreshed_at) return true

    const last = new Date(tech.last_refreshed_at).getTime()
    return Date.now() - last > ONE_DAY
  })

  console.log(`🧠 Refreshing ${stale.length} technologies`)

  for (let i = 0; i < stale.length; i += MAX_CONCURRENT) {
    const batch = stale.slice(i, i + MAX_CONCURRENT)

    await Promise.all(
      batch.map(async (tech) => {
        console.log(`🔄 [tech] ${tech.name}`)

        const res = await fetch(
          `${ML_TRIGGER_URL}/internal/run?tech=${encodeURIComponent(
            tech.name
          )}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${ML_TOKEN}`,
            },
          }
        )

        if (!res.ok) {
          const text = await res.text()
          console.error(`❌ ML failed for ${tech.name}:`, text)
          return
        }

        const payload = await res.json()

        await Technology.findOneAndUpdate(
          { name: tech.name },
          {
            latest_json: payload,
            last_refreshed_at: new Date(),
            updated_at: new Date(),
          }
        )
      })
    )
  }

  console.log("✅ Technology refresh completed")
}