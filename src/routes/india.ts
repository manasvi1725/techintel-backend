import { Router, Request, Response } from "express"
import { connectDB } from "../lib/mongodb"
import { Technology } from "../models/technology"

const router = Router()

/**
 * GET /api/india
 * Returns India-focused publications, patents, and investments
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    await connectDB()

    // assuming India data is stored in a fixed document
    const doc = await Technology.findOne({ name: "__india__" })

    if (!doc || !doc.latest_json?.india) {
      return res
        .status(404)
        .json({ error: "India signals not available" })
    }

    const { publications = [], patents = [], investments = [] } =
      doc.latest_json.india

    return res.json({
      summary: {
        publications: publications.length,
        patents: patents.length,
        investments: investments.length,
      },
      signals: {
        publications,
        patents,
        investments,
      },
    })
  } catch (err) {
    console.error("❌ India signals route error:", err)
    return res
      .status(500)
      .json({ error: "Internal server error" })
  }
})

export default router