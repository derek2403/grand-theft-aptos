import { useState, useEffect } from 'react'
import { checkPosition, getCheckpoints, goto, playAnimation, wanderAround, talkTo } from '../utils/character'
import NPCData from '../data/NPC.json'
import { useChatLog } from './ChatLog'
import { generateCharacterActions } from '../services/openai'
import * as THREE from 'three'

export function NPCController() {
  const [characters, setCharacters] = useState(NPCData.characters)
  const [checkpoints, setCheckpoints] = useState([])
  const [characterQueues, setCharacterQueues] = useState({})
  const [isExecuting, setIsExecuting] = useState(false)
  const [showDoneMessage, setShowDoneMessage] = useState(false)
  const [isAutoRunning, setIsAutoRunning] = useState(true)
  const { addMessage } = useChatLog()

  const animations = [
    'Dancing',
    'Happy',
    'Sad',
    'Singing',
    'Talking',
    'Arguing'
  ]

  // Initialize queues
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

  // Auto-run effect
  useEffect(() => {
    let isActive = true

    const runAutoLoop = async () => {
      while (isActive && isAutoRunning) {
        // Generate new actions if not executing and queues are empty
        if (!isExecuting && Object.values(characterQueues).every(queue => queue.length === 0)) {
          await generateAllActions()
        }
        
        // Execute actions if queues are filled and not currently executing
        if (!isExecuting && Object.values(characterQueues).some(queue => queue.length > 0)) {
          await executeAllQueues()
        }

        // Small delay to prevent tight loop
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    runAutoLoop()

    // Cleanup function
    return () => {
      isActive = false
    }
  }, [isAutoRunning, isExecuting, characterQueues])

  // Add toggle button for auto-run
  const toggleAutoRun = () => {
    setIsAutoRunning(prev => !prev)
    addMessage({
      character: 'System',
      text: `Auto-run ${!isAutoRunning ? 'started' : 'stopped'}`
    })
  }

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
      const messageData = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        displayName: character.name,
        text: '',
        action: action,
        characterData: {
          name: character.name,
          occupation: character.occupation,
          mbti: character.mbti,
          hobby: character.hobby,
          characteristics: character.characteristics,
          gender: character.gender
        }
      }

      // Clear any existing movement before starting new action
      if (character.ref?.current?.activeGoto) {
        character.ref.current.activeGoto = null
      }

      switch (action.type) {
        case 'goto':
          messageData.text = `is going to ${action.checkpoint}`
          addMessage(messageData)
          
          if (character.ref?.current) {
            const movement = goto(character.name, action.checkpoint, {
              playAnimation: (name) => {
                if (character.animations?.[name]) {
                  // Use longer fade duration for smoother transitions
                  character.animations[name].reset().fadeIn(0.5).play()
                }
              }
            })

            let isMoving = true
            character.ref.current.activeGoto = movement

            while (isMoving && character.ref?.current) {
              const done = movement.update(character.ref.current, 1/60)
              if (done) {
                isMoving = false
                character.ref.current.activeGoto = null
                if (character.animations?.Stand) {
                  character.animations.Stand.reset().fadeIn(0.5).play()
                }
              }
              await new Promise(r => setTimeout(r, 16)) // ~60fps
            }
            resolve()
          } else {
            resolve()
          }
          break

        case 'animation':
          messageData.text = `is ${action.animation.toLowerCase()}`
          addMessage(messageData)

          if (character.ref?.current && character.animations?.[action.animation]) {
            // Stop any current animation
            Object.values(character.animations).forEach(anim => anim.stop())
            
            // Play the new animation
            character.animations[action.animation].reset()
            character.animations[action.animation].play()
            
            await new Promise(r => setTimeout(r, 3000))
            
            // Return to standing animation
            Object.values(character.animations).forEach(anim => anim.stop())
            if (character.animations?.Stand) {
              character.animations.Stand.reset()
              character.animations.Stand.play()
            }
          }
          resolve()
          break

        case 'talkTo':
          const targetChar = characters.find(c => c.id === action.targetId)
          if (!targetChar) {
            console.error('Target character not found:', action.targetId)
            resolve()
            return
          }

          messageData.text = `approaches ${targetChar.name} for a conversation`
          messageData.targetCharacterData = {
            name: targetChar.name,
            occupation: targetChar.occupation,
            mbti: targetChar.mbti,
            hobby: targetChar.hobby,
            characteristics: targetChar.characteristics,
            gender: targetChar.gender
          }
          addMessage(messageData)

          if (character.ref?.current && targetChar.ref?.current) {
            const interaction = talkTo(
              character.name,
              targetChar.name,
              {
                playAnimation: (name) => {
                  if (character.animations?.[name]) {
                    character.animations[name].reset().fadeIn(0.5).play()
                  }
                }
              },
              {
                playAnimation: (name) => {
                  if (targetChar.animations?.[name]) {
                    targetChar.animations[name].reset().fadeIn(0.5).play()
                  }
                }
              }
            )

            let isInteracting = true
            while (isInteracting && character.ref?.current && targetChar.ref?.current) {
              const done = interaction.update(
                character.ref.current,
                targetChar.ref.current,
                1/60
              )

              if (done) {
                isInteracting = false
                if (character.animations?.Stand) {
                  character.animations.Stand.reset().fadeIn(0.5).play()
                }
                if (targetChar.animations?.Stand) {
                  targetChar.animations.Stand.reset().fadeIn(0.5).play()
                }
              }
              await new Promise(r => setTimeout(r, 16)) // ~60fps
            }
            resolve()
          } else {
            resolve()
          }
          break

        case 'wander':
          messageData.text = 'is wandering around'
          addMessage(messageData)

          if (character.ref?.current) {
            const movement = wanderAround(
              character.name,
              {
                playAnimation: (name) => {
                  if (character.animations?.[name]) {
                    character.animations[name].reset().fadeIn(0.5).play()
                  }
                }
              }
            )

            character.ref.current.activeGoto = movement
            let isWandering = true
            let startTime = Date.now()

            while (isWandering && character.ref?.current && (Date.now() - startTime < 10000)) {
              movement.update(character.ref.current, 1/60)
              await new Promise(r => setTimeout(r, 16)) // ~60fps
            }

            character.ref.current.activeGoto = null
            if (character.animations?.Stand) {
              character.animations.Stand.reset().fadeIn(0.5).play()
            }
            resolve()
          } else {
            resolve()
          }
          break

        default:
          resolve()
      }
    })
  }

  const generateAllActions = async () => {
    if (isExecuting) return
    
    setIsExecuting(true)
    const newQueues = {}

    try {
      // Generate actions for each character
      const actionPromises = characters.map(async (character) => {
        const otherCharacters = characters.filter(c => c.id !== character.id)
        const actions = await generateCharacterActions(character, otherCharacters)
        newQueues[character.id] = actions
      })

      await Promise.all(actionPromises)
      
      // Check if all characters have exactly 3 actions
      const allValid = Object.values(newQueues).every(queue => queue.length === 3)
      if (!allValid) {
        throw new Error('Not all characters received 3 actions')
      }

      // Resolve talk conflicts by replacing with animations
      const talkTargets = new Map() // Map to store who is talking to whom
      const animations = ['Dancing', 'Happy', 'Sad', 'Singing', 'Talking', 'Arguing']

      // First pass: record all talk interactions
      Object.entries(newQueues).forEach(([charId, queue]) => {
        queue.forEach((action, index) => {
          if (action.type === 'talkTo') {
            const targetName = action.targetName
            if (talkTargets.has(targetName)) {
              // Conflict found: store for resolution
              const conflictInfo = {
                charId,
                index,
                targetName
              }
              talkTargets.get(targetName).conflicts.push(conflictInfo)
            } else {
              talkTargets.set(targetName, {
                initiator: charId,
                conflicts: []
              })
            }
          }
        })
      })

      // Second pass: resolve conflicts
      talkTargets.forEach((value, targetName) => {
        if (value.conflicts.length > 0) {
          // Keep the first talk interaction, replace others with random animations
          value.conflicts.forEach(conflict => {
            const randomAnimation = animations[Math.floor(Math.random() * animations.length)]
            newQueues[conflict.charId][conflict.index] = {
              type: 'animation',
              animation: randomAnimation
            }
            
            addMessage({
              character: 'System',
              text: `Resolved talk conflict: Changed action to ${randomAnimation}`
            })
          })
        }
      })

      setCharacterQueues(newQueues)
      addMessage({
        character: 'System',
        text: 'Actions generated for all characters. Press Execute All to start.'
      })
    } catch (error) {
      console.error('Error generating actions:', error)
      addMessage({
        character: 'System',
        text: 'Error generating actions. Please try again.'
      })
      // Clear any partial queues
      clearAllQueues()
    } finally {
      setIsExecuting(false)
    }
  }

  const handleTalkInteraction = (npcId, interaction) => {
    const npc = characters.find(c => c.id === npcId)
    if (!npc || !npc.ref?.current) return

    // Clear current queue for this NPC
    clearQueue(npcId)

    // Set NPC to talking state
    if (npc.animations?.Talking) {
      Object.values(npc.animations).forEach(anim => anim.stop())
      npc.animations.Talking.reset().fadeIn(0.5).play()
    }

    // Face the player
    const direction = new THREE.Vector3()
    direction.subVectors(interaction.partner.position, npc.ref.current.position)
    npc.ref.current.rotation.y = Math.atan2(direction.x, direction.z)

    addMessage({
      character: 'System',
      text: `${npc.name} started talking with ${interaction.partner.name}`
    })
  }

  // Expose the controller methods
  useEffect(() => {
    window.npcController = {
      handleTalkInteraction,
      clearQueue,
      clearAllQueues,
      generateAllActions
    }
    return () => {
      delete window.npcController
    }
  }, [characters])

  return null
} 