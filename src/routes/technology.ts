import { Router, Request, Response } from "express"
import { connectDB } from "../lib/mongodb.js"
import { Technology } from "../models/technology.js"

const router = Router()

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

    if (!doc || !doc.latest_json) {
      return res.status(404).json({
        error: "Technology data not available",
        hint: "Trigger /api/technology/:name/run to generate data",
      })
    }

    return res.json({
      dashboard: doc.latest_json.dashboard ?? null,
      knowledge_graph: doc.latest_json.knowledge_graph ?? null,
    })
  } catch (err) {
    console.error("❌ Failed to fetch technology:", err)
    return res.status(500).json({ error: "Internal server error" })
  }
})

export default router
