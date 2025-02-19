import { useState, useEffect } from 'react'
import { checkPosition, getCheckpoints, goto, playAnimation, wanderAround, talkTo } from '../utils/character'
import NPCData from '../data/NPC.json'

export function NPCController() {
  const [characters, setCharacters] = useState(NPCData.characters)
  const [checkpoints, setCheckpoints] = useState([])
  const [characterQueues, setCharacterQueues] = useState({})
  const [isExecuting, setIsExecuting] = useState(false)
  const [showDoneMessage, setShowDoneMessage] = useState(false)

  const animations = [
    'Dancing',
    'Happy',
    'Sad',
    'Singing',
    'Talking',
    'Arguing'
  ]

  // Initialize queues for all characters
  useEffect(() => {
    const initialQueues = {}
    characters.forEach(char => {
      initialQueues[char.id] = []
    })
    setCharacterQueues(initialQueues)
  }, [])

  useEffect(() => {
    const points = getCheckpoints()
    setCheckpoints(Object.keys(points))
  }, [])

  const addActionToQueue = (characterId, action) => {
    if (characterQueues[characterId]?.length >= 3) return // Max 3 actions per character

    // If it's a talkTo action, add it only to initiator's queue
    if (action.type === 'talkTo') {
      setCharacterQueues(prev => ({
        ...prev,
        [characterId]: [...(prev[characterId] || []), {
          type: 'talkTo',
          targetId: action.targetId,
          isInitiator: true
        }]
      }))
    } else {
      setCharacterQueues(prev => ({
        ...prev,
        [characterId]: [...(prev[characterId] || []), action]
      }))
    }
  }

  const clearQueue = (characterId) => {
    // Remove this character from any talk interactions
    const updatedQueues = { ...characterQueues }
    Object.keys(updatedQueues).forEach(id => {
      updatedQueues[id] = updatedQueues[id].filter(action => 
        action.type !== 'talkTo' || 
        (action.type === 'talkTo' && action.targetId !== characterId)
      )
    })
    updatedQueues[characterId] = []
    setCharacterQueues(updatedQueues)
  }

  const clearAllQueues = () => {
    const emptyQueues = {}
    characters.forEach(char => {
      emptyQueues[char.id] = []
    })
    setCharacterQueues(emptyQueues)
  }

  const executeAllQueues = async () => {
    if (isExecuting) return

    // Check if all queues have the same length or are empty
    const queueLengths = new Set(Object.values(characterQueues).map(q => q.length))
    queueLengths.delete(0) // Remove empty queues from consideration
    
    if (queueLengths.size > 1) {
      alert("All character queues must have the same number of actions!")
      return
    }

    setIsExecuting(true)
    setShowDoneMessage(false)

    // Get the maximum queue length
    const maxQueueLength = Math.max(...Object.values(characterQueues).map(q => q.length))

    // Execute actions step by step
    for (let step = 0; step < maxQueueLength; step++) {
      // Execute current step for all characters simultaneously
      const stepPromises = characters.map(character => {
        const queue = characterQueues[character.id] || []
        const action = queue[step]
        if (action) {
          return executeAction(character, action)
        }
        return Promise.resolve()
      })

      // Wait for all characters to complete their current action
      await Promise.all(stepPromises)
    }

    clearAllQueues()
    setShowDoneMessage(true)
    setTimeout(() => {
      setShowDoneMessage(false)
      setIsExecuting(false)
    }, 3000)
  }

  const executeAction = async (character, action) => {
    if (!action) return Promise.resolve()

    return new Promise(async (resolve) => {
      switch (action.type) {
        case 'goto':
          const movement = goto(character.name, action.checkpoint, {
            playAnimation: (name) => {
              if (character.animations?.[name]) {
                Object.values(character.animations).forEach(anim => {
                  anim.fadeOut(0.2)
                })
                character.animations[name].reset().fadeIn(0.2).play()
              }
            },
            onComplete: () => {
              if (character.ref.current) {
                character.ref.current.activeGoto = null
              }
            }
          })
          
          if (movement) {
            character.ref.current.activeGoto = movement
          }
          setTimeout(resolve, 5000)
          break

        case 'animation':
          playAnimation(character.name, action.animation, {
            playAnimation: (name) => {
              if (character.animations?.[name]) {
                Object.values(character.animations).forEach(anim => {
                  anim.fadeOut(0.2)
                })
                character.animations[name].reset().fadeIn(0.2).play()
              }
            }
          })
          setTimeout(resolve, 5000)
          break

        case 'talkTo':
          const targetChar = characters.find(c => c.id === action.targetId)
          
          // Force stop target character's current action
          if (targetChar.ref.current) {
            targetChar.ref.current.activeGoto = null
          }
          if (targetChar.animations) {
            Object.values(targetChar.animations).forEach(anim => {
              anim.fadeOut(0.2)
            })
          }
          
          // Clear target's queue
          setCharacterQueues(prev => ({
            ...prev,
            [action.targetId]: []
          }))

          const interaction = talkTo(
            character.name,
            targetChar.name,
            {
              playAnimation: (name) => {
                if (character.animations?.[name]) {
                  Object.values(character.animations).forEach(anim => {
                    anim.fadeOut(0.2)
                  })
                  character.animations[name].reset().fadeIn(0.2).play()
                }
              }
            },
            {
              playAnimation: (name) => {
                if (targetChar.animations?.[name]) {
                  Object.values(targetChar.animations).forEach(anim => {
                    anim.fadeOut(0.2)
                  })
                  targetChar.animations[name].reset().fadeIn(0.2).play()
                }
              }
            }
          )

          const updateInterval = setInterval(() => {
            if (character.ref.current && targetChar.ref.current) {
              const done = interaction.update(
                character.ref.current,
                targetChar.ref.current,
                1/60
              )

              if (done) {
                clearInterval(updateInterval)
                setTimeout(() => {
                  if (character.ref.current) character.ref.current.activeGoto = null
                  if (targetChar.ref.current) targetChar.ref.current.activeGoto = null
                  resolve()
                }, 5000)
              }
            }
          }, 1000/60)
          break

        default:
          resolve()
      }
    })
  }

  return (
    <div className="fixed right-4 top-4 bg-white p-4 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
      <h3 className="text-lg font-bold mb-4">NPC Controller</h3>

      {/* Character Queues */}
      {characters.map(character => (
        <div key={character.id} className="mb-6 p-4 border rounded">
          <h4 className="font-medium mb-2">{character.name}'s Queue ({(characterQueues[character.id] || []).length}/3):</h4>
          
          {/* Queue Display */}
          <div className="bg-gray-100 p-2 rounded mb-2 min-h-[60px]">
            {(characterQueues[character.id] || []).map((action, index) => (
              <div key={index} className="text-sm">
                {action.type === 'goto' && `${index + 1}. Go to ${action.checkpoint}`}
                {action.type === 'animation' && `${index + 1}. Play ${action.animation}`}
                {action.type === 'talkTo' && `${index + 1}. Talk to ${characters.find(c => c.id === action.targetId)?.name}`}
              </div>
            ))}
          </div>

          {/* Action Controls */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {/* Animation Selection */}
            <select 
              className="p-2 border rounded"
              onChange={(e) => addActionToQueue(character.id, {
                type: 'animation',
                animation: e.target.value
              })}
              disabled={isExecuting || characterQueues[character.id]?.length >= 3}
            >
              <option value="">Add Animation...</option>
              {animations.map(anim => (
                <option key={anim} value={anim}>{anim}</option>
              ))}
            </select>

            {/* Checkpoint Selection */}
            <select
              className="p-2 border rounded"
              onChange={(e) => addActionToQueue(character.id, {
                type: 'goto',
                checkpoint: e.target.value
              })}
              disabled={isExecuting || characterQueues[character.id]?.length >= 3}
            >
              <option value="">Go to...</option>
              {checkpoints.map(checkpoint => (
                <option key={checkpoint} value={checkpoint}>{checkpoint}</option>
              ))}
            </select>

            {/* Talk To Selection */}
            <select
              className="p-2 border rounded"
              onChange={(e) => addActionToQueue(character.id, {
                type: 'talkTo',
                targetId: Number(e.target.value)
              })}
              disabled={isExecuting || characterQueues[character.id]?.length >= 3}
            >
              <option value="">Talk to...</option>
              {characters
                .filter(c => c.id !== character.id)
                .map(char => (
                  <option key={char.id} value={char.id}>{char.name}</option>
                ))}
            </select>

            {/* Clear Queue Button */}
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => clearQueue(character.id)}
              disabled={isExecuting || !characterQueues[character.id]?.length}
            >
              Clear Queue
            </button>
          </div>
        </div>
      ))}

      {/* Global Controls */}
      <div className="flex gap-2">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded flex-1"
          onClick={clearAllQueues}
          disabled={isExecuting}
        >
          Clear All Queues
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded flex-1"
          onClick={executeAllQueues}
          disabled={isExecuting || Object.values(characterQueues).every(queue => !queue.length)}
        >
          Execute All
        </button>
      </div>

      {showDoneMessage && (
        <div className="text-green-500 text-center font-medium mt-4">
          All actions completed!
        </div>
      )}
    </div>
  )
} 