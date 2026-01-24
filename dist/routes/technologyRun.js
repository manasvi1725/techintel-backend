import { Router } from "express";
const router = Router();
const ML_TRIGGER_URL = process.env.ML_TRIGGER_URL;
const ML_TOKEN = process.env.ML_INTERNAL_TOKEN;
/**
 * POST /api/technology/:name/run
 * Triggers ML pipeline for a single technology
 */
router.post("/:name/run", async (req, res) => {
    try {
        const token = req.headers["x-internal-token"];
        if (token !== process.env.ML_INTERNAL_TOKEN) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const name = Array.isArray(req.params.name) ? req.params.name[0] : req.params.name;
        if (!name) {
            return res.status(400).json({ error: "Missing technology name" });
        }
        const tech = decodeURIComponent(name)
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "_");
        console.log("🔁 Triggering ML for", tech);
        const mlRes = await fetch(`${ML_TRIGGER_URL}/run`, {
            method: "POST",
            headers: {
                "x-internal-token": ML_TOKEN,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ tech }),
        });
        if (!mlRes.ok) {
            const text = await mlRes.text();
            console.error("❌ ML trigger failed:", text);
            return res.status(500).json({ error: "ML trigger failed" });
        }
        return res.json({
            status: "started",
            technology: tech,
            message: "ML pipeline triggered successfully",
        });
    }
    catch (err) {
        console.error("❌ Failed to trigger ML:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
export default router;
