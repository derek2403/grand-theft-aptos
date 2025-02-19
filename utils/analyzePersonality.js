import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const analyzePersonality = async (profile, tweets) => {
  try {
    const userData = {
      name: profile.name,
      bio: profile.description,
      location: profile.location || "Not specified",
      tweets: tweets.map((tweet) => tweet.text).join("\n"),
      followersCount: profile.followers_count,
      followingCount: profile.following_count,
    };

    const prompt = `Analyze this Twitter user's profile and tweets to create a detailed personality analysis.
    
Profile Data:
${JSON.stringify(userData, null, 2)}

Provide a structured analysis. Return ONLY a valid JSON object with no additional text, following this exact format:
{
  "occupation": "predicted occupation (be creative and specific based on writing style, interests, and tweet content)",
  "mbti": "MBTI personality type",
  "hobby": "main interests/hobbies",
  "gender": "male or female (you must choose one based on name analysis, writing style, and content - never leave empty)",
  "characteristics": ["trait1", "trait2", "trait3", "trait4", "trait5"],
  "goals": ["goal1", "goal2", "goal3"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert personality and career analyst. Important rules:
1. For gender: You MUST ALWAYS predict either 'male' or 'female' based on:
   - Name analysis
   - Writing style patterns
   - Content themes and interests
   - Profile picture if mentioned
   - Never return empty or unknown for gender
2. For occupation analysis:
   - Analyze writing style and vocabulary
   - Look for industry-specific jargon
   - Consider interests and engagement patterns
   - Factor in communication style
   - Make specific predictions based on tweet content`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    let analysis = JSON.parse(completion.choices[0].message.content.trim());
    
    // Fallback gender if somehow still empty (shouldn't happen with updated prompt)
    if (!analysis.gender || !['male', 'female'].includes(analysis.gender.toLowerCase())) {
      analysis.gender = profile.name.toLowerCase().includes('mrs') || 
                       profile.name.toLowerCase().includes('ms') || 
                       profile.name.toLowerCase().includes('miss') ? 'female' : 'male';
    }

    return {
      success: true,
      analysis,
    };
  } catch (error) {
    console.error("Personality Analysis Error:", error);
    return {
      success: false,
      error: error.message || "Failed to analyze personality",
    };
  }
} 