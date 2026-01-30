console.log("📦 internalrefresh.ts loaded")


import { Router } from "express"
import { triggerDailyRefresh } from "../jobs/dailyRefresh.js"

const router = Router()

router.post("/refresh", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "")

  if (token !== process.env.ML_INTERNAL_TOKEN) {
    return res.status(403).json({ error: "Forbidden" })
  }

  try {
    const result = await triggerDailyRefresh("manual")
    res.json(result)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
