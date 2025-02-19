import { getTwitterUserData } from "@/lib/twitterScraper";
import { analyzePersonality } from "@/utils/analyzePersonality";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false, 
      error: "Method not allowed" 
    });
  }

  try {
    const { handle } = req.body;
    if (!handle) {
      return res.status(400).json({ 
        success: false, 
        error: "Twitter handle is required" 
      });
    }

    const twitterData = await getTwitterUserData(handle);
    if (!twitterData.success) {
      return res.status(400).json({
        success: false,
        error: twitterData.error || "Failed to fetch Twitter data"
      });
    }

    const personalityData = await analyzePersonality(
      twitterData.profile,
      twitterData.tweets
    );

    if (!personalityData.success) {
      return res.status(400).json({
        success: false,
        error: personalityData.error || "Failed to analyze personality"
      });
    }

    return res.status(200).json({
      success: true,
      analysis: personalityData.analysis,
      profile: twitterData.profile,
    });
  } catch (error) {
    console.error("Twitter analysis error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze profile",
    });
  }
} 