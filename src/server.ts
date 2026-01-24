import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import technologyRoutes from "./routes/technology"
import technologyRunRoutes from "./routes/technologyRun"
import validateRoutes from "./routes/validate"
import globalRoutes from "./routes/global"
import indiaRoutes from "./routes/india"

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

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`)
})

export default app