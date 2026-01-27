import { Router } from "express";
import { connectDB } from "../lib/mongodb.js";
import { Technology } from "../models/technology.js";
import { runMLAndPersist } from "../services/technologyService.js";
const router = Router();
router.get("/:name", async (req, res) => {
    try {
        const tech = decodeURIComponent(req.params.name)
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "_");
        console.log("🔍 GET /technology", tech);
        await connectDB();
        let doc = await Technology.findOne({ name: tech }).lean();
        // ✅ CACHE HIT
        if (doc?.latest_json) {
            return res.json({
                status: "ready",
                dashboard: doc.latest_json.dashboard,
                knowledge_graph: doc.latest_json.knowledge_graph,
                source: "cache",
            });
        }
        // ❌ CACHE MISS → RUN ML → SAVE
        console.warn("⚠️ Cache miss. Running ML:", tech);
        await runMLAndPersist(tech);
        // 🔁 READ BACK FROM DB (IMPORTANT)
        doc = await Technology.findOne({ name: tech }).lean();
        if (!doc?.latest_json) {
            throw new Error("ML completed but data not found in DB");
        }
        return res.json({
            status: "ready",
            dashboard: doc.latest_json.dashboard,
            knowledge_graph: doc.latest_json.knowledge_graph,
            source: "ml",
        });
    }
    catch (err) {
        console.error("❌ GET technology failed:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
export default router;
