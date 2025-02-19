import { getTwitterUserData } from "@/lib/twitterScraper";
import { analyzePersonality } from "@/utils/analyzePersonality";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { handle } = req.body;
    if (!handle) {
      return res.status(400).json({ error: "Twitter handle is required" });
    }

    const twitterData = await getTwitterUserData(handle);
    if (!twitterData.success) {
      return res.status(400).json(twitterData);
    }

    const personalityData = await analyzePersonality(
      twitterData.profile,
      twitterData.tweets
    );

    return res.status(200).json({
      success: true,
      analysis: personalityData.analysis,
      profile: twitterData.profile,
    });
  } catch (error) {
    console.error("Twitter analysis error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to analyze profile",
    });
  }
} 