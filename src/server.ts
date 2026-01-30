import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import technologyRoutes from "./routes/technology/technology.js"
import technologyRunRoutes from "./routes/technology/technologyRun.js"
import validateRoutes from "./routes/validate.js"
import globalRoutes from "./routes/global.js"
import indiaRoutes from "./routes/india.js"

import { startDailyRefreshJob } from "./jobs/dailyRefresh.js"
import internalRefreshRoutes from "./routes/internalRefresh.js"



dotenv.config()

const app = express()

/* ---------------- MIDDLEWARE ---------------- */

app.use(cors())
app.use(express.json())

/* ---------------- HEALTH CHECK ---------------- */

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "techintel-backend" })
})

/* ---------------- API ROUTES ---------------- */

/**
 * Technology-specific
 */
app.use("/api/technology", technologyRoutes)
app.use("/api/technology", technologyRunRoutes)

/**
 * Validation
 */
app.use("/api/validate-tech", validateRoutes)

/**
 * Aggregated intelligence
 */
app.use("/api/global", globalRoutes)
app.use("/api/india", indiaRoutes)

/* ---------------- FALLBACK ---------------- */

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" })
})

/* ---------------- SERVER START ---------------- */

const PORT = process.env.PORT || 3001

if (!process.env.MONGODB_URI) {
  console.warn("⚠️  MONGODB_URI not set")
}

if (!process.env.ML_INTERNAL_TOKEN) {
  console.warn("⚠️  ML_INTERNAL_TOKEN not set")
}


app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`)
})

startDailyRefreshJob()

app.use("/internal", internalRefreshRoutes)

export default app