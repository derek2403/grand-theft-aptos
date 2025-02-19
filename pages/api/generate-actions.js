import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Validate that no character is being talked to by multiple others
const validateTalkToActions = (allCharacterActions) => {
  const targetedCharacters = new Set()
  
  for (const actions of Object.values(allCharacterActions)) {
    const talkActions = actions.filter(a => a.type === 'talkTo')
    for (const action of talkActions) {
      if (targetedCharacters.has(action.targetName)) {
        return false
      }
      targetedCharacters.add(action.targetName)
    }
  }
  return true
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key is not configured' })
  }

  const { character, otherCharacters, availableActions } = req.body

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an AI that generates varied and realistic actions for characters in a simulation.
          Rules for generating actions:
          1. Return exactly 3 actions in a JSON array
          2. Mix up the action types - don't always use the same sequence
          3. Consider the character's MBTI and needs when choosing actions
          4. For talkTo actions:
             - Use character names instead of IDs
             - Consider personality compatibility
             - Ensure meaningful interactions
          5. Make actions contextually appropriate
          6. Vary the locations and animations used
          7. Create a natural flow between actions
          8. Use 'wander' for exploratory behavior`
        },
        {
          role: "user",
          content: `Generate 3 RANDOM-ORDER actions for ${character.name} based on their profile:
          - MBTI: ${character.mbti}
          - Needs: ${JSON.stringify(character.needs)}
          - Goals: ${JSON.stringify(character.goals)}
          - Characteristics: ${JSON.stringify(character.characteristics)}
          
          Current position: ${JSON.stringify(character.position)}
          
          Available actions:
          - goto: ${JSON.stringify(availableActions.goto)}
          - animations: ${JSON.stringify(availableActions.animations)}
          - talkTo: ${otherCharacters.map(c => `${c.name} (${c.mbti})`).join(', ')}
          - wander: explore the environment randomly
          
          Return ONLY a JSON array with 3 actions in this format:
          [
            { "type": "goto|animation|talkTo|wander", "checkpoint?": "location", "animation?": "animationName", "targetName?": "characterName" }
          ]`
        }
      ],
      temperature: 0.9,
      max_tokens: 500
    })

    let actions
    try {
      actions = JSON.parse(completion.choices[0].message.content)
    } catch (error) {
      console.error('Invalid JSON from OpenAI:', completion.choices[0].message.content)
      return res.status(500).json({ error: 'Invalid response from OpenAI' })
    }

    // Validate the actions format
    if (!Array.isArray(actions) || actions.length !== 3) {
      return res.status(500).json({ error: 'Invalid actions format from OpenAI' })
    }

    // Validate each action
    const validActions = actions.every(action => {
      if (action.type === 'goto') {
        return typeof action.checkpoint === 'string' && availableActions.goto.includes(action.checkpoint)
      }
      if (action.type === 'animation') {
        return typeof action.animation === 'string' && availableActions.animations.includes(action.animation)
      }
      if (action.type === 'talkTo') {
        return typeof action.targetName === 'string' && otherCharacters.some(c => c.name === action.targetName)
      }
      if (action.type === 'wander') {
        return true // Wander action doesn't need additional parameters
      }
      return false
    })

    if (!validActions) {
      return res.status(500).json({ error: 'Invalid action format from OpenAI' })
    }

    return res.status(200).json({ actions })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: 'Error generating actions' })
  }
} 