import { connectDB } from "../lib/mongodb.js"
import { Technology } from "../models/technology.js"

const ML_TRIGGER_URL = process.env.ML_TRIGGER_URL!
const ML_INTERNAL_TOKEN = process.env.ML_INTERNAL_TOKEN!

export async function runMLAndPersist(tech: string): Promise<void> {
  console.log("🤖 Running ML pipeline for:", tech)

    const mlRes = await fetch(`${ML_TRIGGER_URL}/run`, {
        method: "POST",
            headers: {
                  "Content-Type": "application/json",
                        "x-internal-token": ML_INTERNAL_TOKEN,
                            },
                                body: JSON.stringify({ tech }),
                                  })

                                    if (!mlRes.ok) {
                                        const text = await mlRes.text()
                                            throw new Error(`ML pipeline failed: ${text}`)
                                              }

                                                // ⬇️ This is FastAPI JSON, NOT subprocess stdout
                                                  const mlJson = await mlRes.json()

                                                    if (!mlJson?.data) {
                                                        throw new Error("ML response missing data field")
                                                          }

                                                            const { dashboard, knowledge_graph } = mlJson.data

                                                              if (!dashboard || !knowledge_graph) {
                                                                  throw new Error("ML data missing dashboard or knowledge_graph")
                                                                    }

                                                                      await connectDB()

                                                                        await Technology.findOneAndUpdate(
                                                                            { name: tech },
                                                                                {
                                                                                      name: tech,
                                                                                            latest_json: {
                                                                                                    dashboard,
                                                                                                            knowledge_graph,
                                                                                                                  },
                                                                                                                        ml_status: "completed",
                                                                                                                              updated_at: new Date(),
                                                                                                                                  },
                                                                                                                                      { upsert: true }
                                                                                                                                        )

                                                                                                                                          console.log("💾 Persisted ML result for:", tech)
                                                                                                                                          }
                                                                                                                                          