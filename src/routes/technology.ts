import { Router, Request, Response } from "express"
import { connectDB } from "../lib/mongodb.js"
import { Technology } from "../models/technology.js"

const router = Router()

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL
const ML_INTERNAL_TOKEN = process.env.ML_INTERNAL_TOKEN

console.log("BACKEND_BASE_URL:", BACKEND_BASE_URL)
console.log("ML_INTERNAL_TOKEN exists:", !!ML_INTERNAL_TOKEN)

/**
 * GET /api/technology/:name
 */
router.get("/:name", async (req: Request, res: Response) => {
  try {
    const name = req.params.name

    if (!name) {
      return res.status(400).json({ error: "Invalid technology name" })
    }

    const tech = decodeURIComponent(name)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")

    await connectDB()

    const doc = await Technology.findOne({ name: tech }).lean()

    // ✅ DATA EXISTS → RETURN IT
    if (doc?.latest_json) {
      return res.json({
        status: "ready",
        dashboard: doc.latest_json.dashboard ?? null,
        knowledge_graph: doc.latest_json.knowledge_graph ?? null,
      })
    }

    // ⚠️ CACHE MISS → TRIGGER ML INTERNALLY
    console.warn(`⚠️ Cache miss for "${tech}". Triggering ML internally.`)

    if (!BACKEND_BASE_URL || !ML_INTERNAL_TOKEN) {
      console.error("❌ Missing backend ML env vars")
      return res.status(500).json({ error: "ML pipeline not configured" })
    }

    // Fire-and-forget ML trigger
    fetch(`${BACKEND_BASE_URL}/api/technology/${tech}/run`, {
      method: "POST",
      headers: {
        "x-internal-token": ML_INTERNAL_TOKEN,
      },
    }).catch((err) => {
      console.error("❌ Failed to trigger ML:", err)
    })

    return res.status(202).json({
      status: "processing",
      message: "Technology data is being generated",
    })
  } catch (err) {
    console.error("❌ Failed to fetch technology:", err)
    return res.status(500).json({ error: "Internal server error" })
  }
})

export default router
