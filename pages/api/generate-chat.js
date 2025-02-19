import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { action, character, targetCharacter } = req.body

    // Different prompts based on action type
    let systemPrompt = ''
    let userPrompt = ''

    switch (action.type) {
      case 'goto':
        systemPrompt = `Generate a natural thought or comment from a character going to a location.
          Return a JSON object with "speaker" and "text" fields.
          Make it reflect their personality and interests.
          Example: { "speaker": "Alice", "text": "I could really use some coffee from the kitchen right now!" }`

        userPrompt = `Character ${character.name} (${character.mbti}) who likes ${character.hobby} 
          is going to ${action.checkpoint}.
          Generate a natural thought or comment about why they're going there.`
        break

      case 'animation':
        systemPrompt = `Generate a natural comment from a character expressing their current emotion/action.
          Return a JSON object with "speaker" and "text" fields.
          Make it reflect their personality and current state.
          Example: { "speaker": "Bob", "text": "I just can't help dancing when I'm in a good mood!" }`

        userPrompt = `Character ${character.name} (${character.mbti}) is ${action.animation.toLowerCase()}.
          Generate a natural comment expressing why they feel this way.`
        break

      case 'talkTo':
        systemPrompt = `Generate dialogue between two characters meeting for a conversation.
          Return a JSON object with "speaker" and "text" fields.
          Make it reflect their personalities and relationship.
          Example: { "speaker": "Charlie", "text": "Hey Alice, I was just thinking about that project we discussed!" }`

        userPrompt = `${character.name} (${character.mbti}, ${character.occupation}) 
          is starting a conversation with 
          ${targetCharacter.name} (${targetCharacter.mbti}, ${targetCharacter.occupation}).
          Generate an opening line that reflects their personalities and possible shared interests. The opening line should be fun and funny, dont use boring ones`
        break

      case 'wander':
        systemPrompt = `Generate a natural thought from a character who is wandering around.
          Return a JSON object with "speaker" and "text" fields.
          Make it reflect their personality and current mindset.
          Example: { "speaker": "David", "text": "Sometimes I just need to walk around and clear my head." }`

        userPrompt = `Character ${character.name} (${character.mbti}) who works as ${character.occupation} 
          is wandering around.
          Generate a natural thought about why they're wandering or what they're thinking about.`
        break

      default:
        throw new Error('Invalid action type')
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    })

    try {
      const content = completion.choices[0].message.content
      // Remove any markdown code block formatting
      const jsonStr = content.replace(/```json\n|\n```|```/g, '').trim()
      const dialogue = JSON.parse(jsonStr)

      // Validate dialogue format
      if (!dialogue.speaker || !dialogue.text) {
        throw new Error('Invalid dialogue format')
      }

      // Return array with single dialogue
      return res.status(200).json({ 
        dialogue: [dialogue]
      })

    } catch (error) {
      console.error('Error parsing dialogue:', error)
      console.error('Raw content:', completion.choices[0].message.content)
      return res.status(500).json({ 
        error: 'Invalid response format',
        rawContent: completion.choices[0].message.content 
      })
    }

  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: error.message })
  }
} 