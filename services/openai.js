const generateCharacterActions = async (character, otherCharacters) => {
  try {
    // Extract only the necessary character data
    const characterData = {
      id: character.id,
      name: character.name,
      occupation: character.occupation,
      mbti: character.mbti,
      age: character.age,
      hobby: character.hobby,
      gender: character.gender,
      characteristics: character.characteristics,
      needs: character.needs,
      goals: character.goals,
      position: character.position
    }

    // Extract only necessary data from other characters
    const otherCharactersData = otherCharacters.map(char => ({
      id: char.id,
      name: char.name,
      occupation: char.occupation,
      mbti: char.mbti
    }))

    const response = await fetch('/api/generate-actions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        character: characterData,
        otherCharacters: otherCharactersData,
        availableActions: {
          goto: [
            'room1_bed', 'room1_computer', 'room1_cupboard',
            'room2_bed', 'room2_computer', 'room2_cupboard',
            'room3_bed', 'room3_computer', 'room3_cupboard',
            'room4_bed', 'room4_computer', 'room4_cupboard',
            'area1', 'area2', 'area3', 'area4'
          ],
          animations: ['Dancing', 'Happy', 'Sad', 'Singing', 'Talking', 'Arguing'],
          wander: true
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', errorText)
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.actions || !Array.isArray(data.actions)) {
      console.error('Invalid API response:', data)
      throw new Error('Invalid API response format')
    }

    // Transform the API response into valid actions
    return data.actions.map(action => {
      if (action.type === 'talkTo') {
        // Find the actual character ID from the name
        const targetChar = otherCharacters.find(c => c.name === action.targetName)
        return {
          type: 'talkTo',
          targetId: targetChar?.id,
          isInitiator: true
        }
      }
      return action
    })
  } catch (error) {
    console.error('Error generating actions:', error)
    return []
  }
}

export { generateCharacterActions } 