import { Router, Request, Response } from "express"
import { connectDB } from "../lib/mongodb"
import { Technology } from "../models/technology"

const router = Router()

/**
 * GET /api/technology/:name
 */
router.get("/:name", async (req: Request, res: Response) => {
  try {
    const name = Array.isArray(req.params.name) ? req.params.name[0] : req.params.name


    if (!name) {
      return res.status(400).json({ error: "Invalid technology name" })
    }

    const tech = decodeURIComponent(name)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")

    await connectDB()

    const doc = await Technology.findOne({ name: tech })

    if (!doc || !doc.latest_json) {
      return res
        .status(404)
        .json({ error: "No data found. Call /run" })
    }

    return res.json({
      dashboard: doc.latest_json.dashboard ?? null,
      knowledge_graph: doc.latest_json.knowledge_graph ?? null,
    })
  } catch (err) {
    console.error(" Failed to fetch technology:", err)
    return res.status(500).json({ error: "Internal server error" })
  }
})

export default router