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

  const { character, otherCharacters, availableActions } = req.body

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a JSON generator that creates exactly 3 actions for a character in a simulation game. Always return a valid JSON array containing exactly 3 actions, no more, no less. Each action must strictly follow the specified format with exact property names. Do not include any explanation or markdown formatting."
        },
        {
          role: "user",
          content: `Generate exactly 3 actions for ${character.name}. Valid action types are ONLY:
          1. "goto" with "checkpoint" property
          2. "animation" with "animation" property (IMPORTANT: type must be exactly "animation", not "animations")
          3. "talkTo" with "targetName" property (IMPORTANT: targetName must be one of the provided character names)
          4. "wander" (no additional properties needed)

          Available options:
          - Checkpoints: ${JSON.stringify(availableActions.goto)}
          - Animations: ${JSON.stringify(availableActions.animations)}
          - Target Characters (for talkTo): ${otherCharacters.map(c => c.name).join(', ')}

          Character info:
          - MBTI: ${character.mbti}
          - Needs: ${JSON.stringify(character.needs)}
          - Goals: ${JSON.stringify(character.goals)}
          
          Example of valid response:
          [{"type":"goto","checkpoint":"park"},{"type":"animation","animation":"wave"},{"type":"talkTo","targetName":"Alice"}]`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    let actions
    try {
      const content = completion.choices[0].message.content.trim()
      console.log('Raw OpenAI response:', content)
      
      // Clean the response
      const jsonString = content.replace(/```json\n?|```/g, '').trim()
      console.log('Cleaned JSON string:', jsonString)
      
      actions = JSON.parse(jsonString)
      
      // Ensure we have an array with exactly 3 actions
      if (!Array.isArray(actions) || actions.length !== 3) {
        throw new Error('Response must be an array with exactly 3 actions')
      }

      // Fix and validate each action
      actions = actions.map(action => {
        // Fix common type errors
        if (action.type === 'animations') {
          action.type = 'animation'
        }

        // Validate the action
        switch (action.type) {
          case 'goto':
            if (!action.checkpoint || !availableActions.goto.includes(action.checkpoint)) {
              throw new Error(`Invalid checkpoint: ${action.checkpoint}`)
            }
            break
          case 'animation':
            if (!action.animation || !availableActions.animations.includes(action.animation)) {
              throw new Error(`Invalid animation: ${action.animation}`)
            }
            break
          case 'talkTo':
            if (!action.targetName) {
              throw new Error('Missing targetName for talkTo action')
            }
            if (!otherCharacters.some(c => c.name === action.targetName)) {
              throw new Error(`Invalid target name: ${action.targetName}`)
            }
            break
          case 'wander':
            // Wander is always valid
            break
          default:
            throw new Error(`Invalid action type: ${action.type}`)
        }
        return action
      })

    } catch (error) {
      console.error('Validation Error:', error)
      console.error('OpenAI Response:', completion.choices[0].message.content)
      return res.status(500).json({ error: `Invalid response format: ${error.message}` })
    }

    console.log('Final validated actions:', actions)
    return res.status(200).json({ actions })

  } catch (error) {
    console.error('OpenAI Error:', error)
    return res.status(500).json({ error: error.message || 'Error generating actions' })
  }
} 