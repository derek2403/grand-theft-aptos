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

    console.log(`[Twitter Analysis] Starting analysis for handle: ${handle}`);

    const twitterData = await getTwitterUserData(handle);
    console.log('[Twitter Analysis] Twitter data response:', {
      success: twitterData.success,
      error: twitterData.error,
      hasProfile: !!twitterData.profile,
      hasTweets: Array.isArray(twitterData.tweets) && twitterData.tweets.length > 0
    });

    if (!twitterData.success) {
      return res.status(400).json({
        success: false,
        error: twitterData.error || "Failed to fetch Twitter data"
      });
    }

    if (!twitterData.profile || !twitterData.tweets || twitterData.tweets.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No profile or tweets found for this user"
      });
    }

    console.log('[Twitter Analysis] Starting personality analysis');
    const personalityData = await analyzePersonality(
      twitterData.profile,
      twitterData.tweets
    );
    console.log('[Twitter Analysis] Personality analysis complete:', {
      success: personalityData.success,
      error: personalityData.error,
      hasAnalysis: !!personalityData.analysis
    });

    if (!personalityData.success || !personalityData.analysis) {
      return res.status(400).json({
        success: false,
        error: personalityData.error || "Failed to analyze personality"
      });
    }

    const response = {
      success: true,
      analysis: personalityData.analysis,
      profile: twitterData.profile,
    };
    console.log('[Twitter Analysis] Sending successful response');

    return res.status(200).json(response);
  } catch (error) {
    console.error("[Twitter Analysis] Error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze profile",
    });
  }
} 