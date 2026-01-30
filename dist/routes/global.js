import { Router } from "express";
import { connectDB } from "../lib/mongodb.js";
import { Global } from "../models/technology.js";
const router = Router();
/**
 * GET /api/global
 * Returns global patents, trends, and investments
 */
router.get("/", async (_req, res) => {
    try {
        console.log("🌍 [/api/global] request received");
        await connectDB();
        console.log("🌍 [/api/global] MongoDB connected");
        const doc = await Global.findOne({ name: "__global__" });
        if (!doc) {
            console.error("❌ [/api/global] __global__ document NOT FOUND");
            return res.status(404).json({ error: "Global document not found" });
        }
        console.log("📦 [/api/global] latest_json keys:", Object.keys(doc.latest_json ?? {}));
        if (!doc.latest_json?.global) {
            console.error("❌ [/api/global] latest_json.global is MISSING", doc.latest_json);
            return res.status(404).json({ error: "Global signals not available" });
        }
        console.log("📊 [/api/global] global section keys:", Object.keys(doc.latest_json.global));
        const { patents, trends, investments } = doc.latest_json.global;
        console.log("🧪 [/api/global] patents exists:", !!patents);
        console.log("🧪 [/api/global] trends exists:", !!trends);
        console.log("🧪 [/api/global] investments exists:", !!investments);
        if (investments?.countries) {
            console.log("🌐 [/api/global] investment countries:", Object.keys(investments.countries));
        }
        else {
            console.warn("⚠️ [/api/global] investments.countries is MISSING");
        }
        return res.json({
            generated_at: {
                patents: patents?.generated_at ?? null,
                trends: trends?.generated_at ?? null,
                investments: investments?.generated_at ?? null,
            },
            counts: {
                patents: patents?.counts ?? patents?.signals?.length ?? 0,
                trends: trends?.counts ?? trends?.signals?.length ?? 0,
                investments: investments?.counts ??
                    Object.keys(investments?.countries ?? {}).length,
            },
            patents: patents?.signals ?? [],
            trends: trends?.signals ?? [],
            investments: investments?.countries ?? {},
        });
    }
    catch (err) {
        console.error("❌ [/api/global] route crashed:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
export default router;
