import { Router, Request, Response } from "express"
import { connectDB } from "../lib/mongodb.js"
import { Technology } from "../models/technology.js"




const router = Router()

/**
 * GET /api/global
  * Returns global patents, trends, and investments
   */
   router.get("/", async (_req: Request, res: Response) => {
     try {
         await connectDB()

             // Global intelligence stored under a fixed document
                 const doc = await Technology.findOne({ name: "__global__" })

                     if (!doc || !doc.latest_json?.global) {
                           return res
                                   .status(404)
                                           .json({ error: "Global signals not available" })
                                               }

                                                   const { patents, trends, investments } = doc.latest_json.global

                                                       return res.json({
                                                             generated_at: {
                                                                     patents: patents?.generated_at ?? null,
                                                                             trends: trends?.generated_at ?? null,
                                                                                     investments: investments?.generated_at ?? null,
                                                                                           },
                                                                                                 counts: {
                                                                                                         patents:
                                                                                                                   patents?.counts ?? patents?.signals?.length ?? 0,
                                                                                                                           trends:
                                                                                                                                     trends?.counts ?? trends?.signals?.length ?? 0,
                                                                                                                                             investments:
                                                                                                                                                       investments?.counts ??
                                                                                                                                                                 Object.keys(investments?.countries ?? {}).length,
                                                                                                                                                                       },
                                                                                                                                                                             patents: patents?.signals ?? [],
                                                                                                                                                                                   trends: trends?.signals ?? [],
                                                                                                                                                                                         investments: investments?.countries ?? {},
                                                                                                                                                                                             })
                                                                                                                                                                                               } catch (err) {
                                                                                                                                                                                                   console.error("❌ Global signals route error:", err)
                                                                                                                                                                                                       return res
                                                                                                                                                                                                             .status(500)
                                                                                                                                                                                                                   .json({ error: "Internal server error" })
                                                                                                                                                                                                                     }
                                                                                                                                                                                                                     })

                                                                                                                                                                                                                     export default router