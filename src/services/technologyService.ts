import { connectDB } from "../lib/mongodb.js"
import { Technology } from "../models/technology.js"

const ML_TRIGGER_URL = process.env.ML_TRIGGER_URL!
const ML_INTERNAL_TOKEN = process.env.ML_INTERNAL_TOKEN!

export async function runMLAndPersist(tech: string): Promise<void> {
  console.log("🤖 Running ML pipeline for:", tech)

  const mlRes = await fetch(`${ML_TRIGGER_URL}/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-token": ML_INTERNAL_TOKEN,
    },
    body: JSON.stringify({ tech }),
  })

  if (!mlRes.ok) {
    const text = await mlRes.text()
    throw new Error(`ML pipeline failed: ${text}`)
  }

  const raw = await mlRes.text()

  const jsonStart = raw.indexOf("{")
  if (jsonStart === -1) {
    throw new Error("ML stdout did not contain JSON")
  }

  const mlJson = JSON.parse(raw.slice(jsonStart))

  const { dashboard, knowledge_graph } = mlJson

  if (!dashboard || !knowledge_graph) {
    throw new Error("Invalid ML payload shape")
  }

  await connectDB()

  await Technology.findOneAndUpdate(
    { name: tech },
    {
      name: tech,
      latest_json: {
        dashboard,
        knowledge_graph,
      },
      ml_status: "completed",
      updated_at: new Date(),
    },
    { upsert: true }
  )

  console.log("💾 Persisted ML result for:", tech)
}
