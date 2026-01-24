import { Router, Request, Response } from "express"
import { validateTech } from "../lib/techValidator"

const router = Router()

/**
 * POST /api/validate-tech
 * Validates a technology query string
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { query } = req.body

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Invalid query" })
    }

    const result = validateTech(query)
    return res.json(result)
  } catch (err) {
    console.error("❌ Validation failed:", err)
    return res.status(500).json({ error: "Internal server error" })
  }
})

export default router