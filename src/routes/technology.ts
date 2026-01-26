import { Router, Request, Response } from "express";
import { connectDB } from "../lib/mongodb.js";
import { Technology } from "../models/technology.js";

const router = Router();

const ML_TRIGGER_URL = process.env.ML_TRIGGER_URL;
const ML_INTERNAL_TOKEN = process.env.ML_INTERNAL_TOKEN;

router.get("/:name", async (req: Request, res: Response) => {
  try {
    const name = req.params.name;
    if (!name) {
      return res.status(400).json({ error: "Invalid technology name" });
    }

    const tech = decodeURIComponent(name)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_");

    await connectDB();

    const doc = await Technology.findOne({ name: tech }).lean();

    // ✅ DATA READY
    if (doc?.latest_json) {
      return res.json({
        status: "ready",
        dashboard: doc.latest_json.dashboard ?? null,
        knowledge_graph: doc.latest_json.knowledge_graph ?? null,
      });
    }

    // ⏳ ML ALREADY RUNNING
    if (doc?.ml_status === "running") {
      return res.status(202).json({
        status: "processing",
        message: "Technology data is being generated",
      });
    }

    // 🚀 FIRST-TIME CACHE MISS → TRIGGER ML ONCE
    if (!ML_TRIGGER_URL || !ML_INTERNAL_TOKEN) {
      console.error("❌ ML service not configured");
      return res.status(500).json({ error: "ML pipeline not configured" });
    }

    console.warn(`⚠️ Cache miss for "${tech}". Triggering ML.`);

    // lock
    await Technology.updateOne(
      { name: tech },
      { $set: { ml_status: "running" } },
      { upsert: true }
    );

    // fire-and-forget ML trigger
    fetch(`${ML_TRIGGER_URL}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-token": ML_INTERNAL_TOKEN,
      },
      body: JSON.stringify({ tech }),
    }).catch((err) => {
      console.error("❌ Failed to trigger ML:", err);
    });

    return res.status(202).json({
      status: "processing",
      message: "Technology data is being generated",
    });
  } catch (err) {
    console.error("❌ Failed to fetch technology:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
