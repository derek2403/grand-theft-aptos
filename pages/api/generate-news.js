import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const positiveThemes = [
  "Successful investment in sustainable energy projects",
  "Breakthrough in medical research funding",
  "Educational technology innovation",
  "Charitable donation impact",
  "Environmental conservation success",
  "Community development initiative",
  "Scientific research grant",
  "Cultural preservation project",
  "Public infrastructure improvement",
  "Social enterprise success"
];

const negativeThemes = [
  "Market volatility impact",
  "Research funding cuts",
  "Project delay setbacks",
  "Resource allocation challenges",
  "Economic policy effects",
  "Development plan obstacles",
  "Budget constraint impacts",
  "Investment strategy losses",
  "Operational cost increases",
  "Financial market challenges"
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { change, isPositive, address } = req.body;

  try {
    // Select random theme
    const themes = isPositive ? positiveThemes : negativeThemes;
    const theme = themes[Math.floor(Math.random() * themes.length)];

    // Generate news headline
    const prompt = `Generate a very short news headline (maximum 15 words) about ${theme} involving ${change} GTA Coins. Make it sound like a real news headline. The tone should be ${isPositive ? 'positive' : 'negative'}. Don't mention wallet addresses.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
    });

    const story = completion.choices[0].message.content;
    
    // Select a random local image
    const imageNumber = Math.floor(Math.random() * 4) + 1;
    const imageUrl = `/news/${isPositive ? 'good' : 'bad'}${imageNumber}.png`;

    res.status(200).json({
      story,
      imageUrl
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to generate news content' });
  }
} 