import { Router, Request, Response } from "express"
import { connectDB } from "../lib/mongodb.js"
import { Technology } from "../models/technology.js"
import { runMLAndPersist } from "../services/technologyService.js"

const router = Router()
const ML_TOKEN = process.env.ML_INTERNAL_TOKEN!

router.post("/:name/run", async (req: Request, res: Response) => {
  try {
    const token = req.headers["x-internal-token"]
    if (token !== ML_TOKEN) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const tech = decodeURIComponent(req.params.name)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")

    console.log("🔁 Force recompute ML for:", tech)

    await runMLAndPersist(tech)

    await connectDB()
    const doc = await Technology.findOne({ name: tech }).lean()

    if (!doc?.latest_json) {
      throw new Error("ML completed but data missing in DB")
    }

    return res.json({
      status: "refreshed",
      technology: tech,
      dashboard: doc.latest_json.dashboard,
      knowledge_graph: doc.latest_json.knowledge_graph,
    })
  } catch (err) {
    console.error("❌ POST run failed:", err)
    return res.status(500).json({ error: "Internal server error" })
  }
})

export default router
