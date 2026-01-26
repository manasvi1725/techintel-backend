import { Router, Request, Response } from "express"
import { connectDB } from "../lib/mongodb.js"
import Technology from "../models/technology.js"

const router = Router()

function extractYear(dateStr?: string): number | undefined {
  if (!dateStr) return undefined
  const match = dateStr.match(/\b(20\d{2})\b/)
  return match ? Number(match[1]) : undefined
}

/**
 * GET /api/india
 * Returns India-focused publications, patents, and investments
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    await connectDB()

    /* ================= FETCH DOCUMENTS ================= */

    const indiaDoc = await Technology.findOne({ name: "__india__" })
    const globalDoc = await Technology.findOne({ name: "__global__" })

    if (!indiaDoc?.latest_json?.india) {
      return res.status(404).json({ error: "India signals not available" })
    }

    /* ================= PUBLICATIONS ================= */

    const publicationsRaw = indiaDoc.latest_json.india.publications

    const publications =
      publicationsRaw
        ? Object.values(publicationsRaw.fields ?? {}).flatMap((field: any) =>
            (field.publications || []).map((p: any) => ({
              title: p.title,
              link: p.link,
              year: p.year ?? 0,
              academic_weight: p.citations ?? 0,
            }))
          )
        : []

    publications.sort((a: any, b: any) => {
      if (b.year !== a.year) return b.year - a.year
      return (b.academic_weight ?? 0) - (a.academic_weight ?? 0)
    })

    /* ================= PATENTS ================= */

    const patentsRaw = indiaDoc.latest_json.india.patents

   const institutes = Object.values(
  patentsRaw.institutes as Record<string, any[]>
)

const patents = institutes.flatMap((list) =>
  list.map((p: any) => ({
    title: p.title,
    link: p.link,
    year: p.year ?? 0,
    institute: p.institute,
    strategic_weight: p.year ? Math.max(1, p.year - 2010) : 1,
  }))
)


    patents.sort((a: any, b: any) => {
      if ((b.year ?? 0) !== (a.year ?? 0)) {
        return (b.year ?? 0) - (a.year ?? 0)
      }
      return (b.strategic_weight ?? 0) - (a.strategic_weight ?? 0)
    })

    /* ================= INVESTMENTS (FROM GLOBAL) ================= */

    const india =
      globalDoc?.latest_json?.global?.investments?.countries?.india

    const investments =
      india
        ? Object.values(india.technologies ?? {}).flatMap((tech: any) =>
            (tech.articles || []).map((a: any) => ({
              title: a.title,
              link: a.link,
              year: extractYear(a.date),
              confidence_weight: a.confidence_weight ?? 0,
              source: a.source,
              date: a.date,
            }))
          )
        : []

    investments.sort((a: any, b: any) => {
      if ((b.year ?? 0) !== (a.year ?? 0)) {
        return (b.year ?? 0) - (a.year ?? 0)
      }
      return (b.confidence_weight ?? 0) - (a.confidence_weight ?? 0)
    })

    /* ================= RESPONSE ================= */

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
    return res.status(500).json({ error: "Internal server error" })
  }
})

export default router
