import fetch from "node-fetch"
import { connectDB } from "../lib/mongodb.js"
import {Global} from "../models/technology.js"

const ML_TRIGGER_URL = process.env.ML_TRIGGER_URL
const ML_TOKEN = process.env.ML_INTERNAL_TOKEN

const headers = {
  Authorization: `Bearer ${ML_TOKEN}`,
}

// src/types/ml.ts

type GlobalInvestmentsResponse = {
  investments: {
    generated_at: string
    counts: number
    countries: Record<string, any>
  }
}

type GlobalPatentsResponse = {
  patents: {
    generated_at: string
    counts: number
    signals: any[]
  }
}

type GlobalTrendsResponse = {
  trends: {
    generated_at: string
    counts: number
    signals: any[]
  }
}


export async function refreshGlobal() {
  console.log("🌍 [refreshGlobal] Starting sequential global refresh")

  await connectDB()

  const doc =
    (await Global.findOne({ name: "__global__" })) ??
    new Global({ name: "__global__", latest_json: {} })

  /* ================= INVESTMENTS ================= */

  console.log("💰 Fetching global investments")
  const invRes = await fetch(`${ML_TRIGGER_URL}/internal/run-global-investments`, {
    method: "POST",
    headers,
  })
  if (!invRes.ok) throw new Error("Investments pipeline failed")

  const { investments } = await invRes.json() as GlobalInvestmentsResponse
  doc.latest_json.global = doc.latest_json.global || {}
  doc.latest_json.global.investments = investments
  await doc.save()

  /* ================= PATENTS ================= */

  console.log("📄 Fetching global patents")
  const patRes = await fetch(`${ML_TRIGGER_URL}/internal/run-global-patents`, {
    method: "POST",
    headers,
  })
  if (!patRes.ok) throw new Error("Patents pipeline failed")

  const { patents } = await patRes.json() as GlobalPatentsResponse
  doc.latest_json.global.patents = patents
  await doc.save()

  /* ================= TRENDS ================= */

  console.log("📈 Fetching global trends")
  const trendRes = await fetch(`${ML_TRIGGER_URL}/internal/run-global-trends`, {
    method: "POST",
    headers,
  })
  if (!trendRes.ok) throw new Error("Trends pipeline failed")

  const { trends } = await trendRes.json() as GlobalTrendsResponse
  doc.latest_json.global.trends = trends

  /* ================= FINALIZE ================= */

  doc.updated_at = new Date()
  doc.latest_json.global.generated_at = new Date().toISOString()

  await doc.save()

  console.log("✅ Global refresh completed successfully")
}
