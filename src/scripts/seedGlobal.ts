import fs from "fs"
import path from "path"
import { connectDB } from "../lib/mongodb.js"
import { Technology } from"../models/technology.js"

async function seedGlobal() {
  await connectDB()

  const patents = JSON.parse(
    fs.readFileSync(path.join("data/global/global_patents.json"), "utf-8")
  )
  const trends = JSON.parse(
    fs.readFileSync(path.join("data/global/global_trends.json"), "utf-8")
  )
  const investments = JSON.parse(
    fs.readFileSync(path.join("data/global/global_investments.json"), "utf-8")
  )

  await Technology.findOneAndUpdate(
    { name: "__global__" },
    {
      name: "__global__",
      latest_json: {
        global: {
          patents,
          trends,
          investments,
        },
      },
    },
    { upsert: true, new: true }
  )

  console.log("✅ Global data seeded")
  process.exit(0)
}

seedGlobal().catch(console.error)
export {}
