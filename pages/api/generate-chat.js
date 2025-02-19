import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { action, character, targetCharacter = null } = req.body

  try {
    // Validate required character data
    if (!character?.name) {
      throw new Error('Invalid character data')
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are generating contextual dialogue for characters in a simulation.
          Return ONLY a JSON array without any markdown formatting or code blocks.
          Make the conversations natural and reflect their personalities (MBTI).
          For talk interactions:
          - Include discussion of their hobbies and occupations
          - Show their personality traits
          - Keep responses concise (1-2 sentences)
          - Make the conversation flow naturally
          For solo actions:
          - Generate thoughts or reactions that match their personality
          - Reference their needs or goals when relevant
          Each dialogue line MUST have "speaker" and "text" fields.
          Make the conversations natural and reflect their personalities (MBTI).`
        },
        {
          role: "user",
          content: `Generate dialogue for this interaction:
          
          Character: ${character.name} (${character.mbti || 'Unknown'})
          Occupation: ${character.occupation || 'Unknown'}
          Hobby: ${character.hobby || 'Unknown'}
          Traits: ${(character.characteristics || []).join(', ')}
          
          ${targetCharacter ? `
          Talking to: ${targetCharacter.name} (${targetCharacter.mbti || 'Unknown'})
          Their occupation: ${targetCharacter.occupation || 'Unknown'}
          Their hobby: ${targetCharacter.hobby || 'Unknown'}
          Their traits: ${(targetCharacter.characteristics || []).join(', ')}
          ` : ''}
          
          Action: ${action.type} ${action.animation || action.checkpoint || ''}
          
          Return array of dialogue lines with "speaker" and "text" fields like:
          [{"speaker": "Name", "text": "What they say"}]`
        }
      ],
      temperature: 0.8,
      max_tokens: 250
    })

    let dialogue
    try {
      const content = completion.choices[0].message.content
      // Remove any markdown code block formatting
      const jsonStr = content.replace(/```json\n|\n```|```/g, '').trim()
      const rawDialogue = JSON.parse(jsonStr)
      
      // Transform the dialogue format if needed
      dialogue = rawDialogue.map(line => ({
        speaker: line.speaker || line.character || character.name,
        text: line.text || line.dialogue || ''
      }))

      // Validate dialogue format
      if (!Array.isArray(dialogue) || !dialogue.every(line => 
        typeof line.speaker === 'string' && 
        typeof line.text === 'string'
      )) {
        throw new Error('Invalid dialogue format')
      }
    } catch (error) {
      console.error('Error parsing dialogue:', error)
      console.error('Raw content:', completion.choices[0].message.content)
      return res.status(500).json({ 
        error: 'Invalid response format',
        rawContent: completion.choices[0].message.content 
      })
    }

    return res.status(200).json({ dialogue })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: error.message })
  }
} 