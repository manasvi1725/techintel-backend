import { Router, Request, Response } from "express";

const router = Router();

const ML_TRIGGER_URL = process.env.ML_TRIGGER_URL!;
const ML_TOKEN = process.env.ML_INTERNAL_TOKEN!;

router.post("/:name/run", async (req: Request, res: Response) => {
  try {
    const token = req.headers["x-internal-token"];
    if (token !== ML_TOKEN) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const tech = decodeURIComponent(req.params.name)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_");

    console.log("🔁 Triggering ML for", tech);

    const mlRes = await fetch(`${ML_TRIGGER_URL}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-token": ML_TOKEN,
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
  } catch (err) {
    console.error("❌ Failed to trigger ML:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
