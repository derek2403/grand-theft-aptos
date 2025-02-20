import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await openai.images.generate({
      model: "dall-e-3",  // or "dall-e-2" depending on your needs
      prompt: prompt,
      n: 1,
      size: "720x720",
      quality: "standard",
      response_format: "url",
    });

    return res.status(200).json({ url: response.data[0].url });
  } catch (error) {
    console.error('DALL-E API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate image',
      details: error.message 
    });
  }
} 