import { useState, useEffect } from 'react'
import { Html } from '@react-three/drei'
import { checkPosition, getCheckpoints, goto, playAnimation, wanderAround, talkTo } from '../utils/character'

const animationEmoticons = {
  Dancing: '💃',
  Happy: '😊',
  Sad: '😢',
  Singing: '🎵',
  Talking: '💭',
  Arguing: '😠'
}

function Dialog({ text }) {
  return (
    <div 
      className="absolute bg-white px-3 py-1 rounded-lg shadow-md text-xl transform -translate-x-1/2 -translate-y-24"
      style={{
        pointerEvents: 'none',
        whiteSpace: 'nowrap'
      }}
    >
      {text}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white" />
    </div>
  )
}

export function CharacterControlTest({ characters }) {
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [currentPosition, setCurrentPosition] = useState(null)
  const [checkpoints, setCheckpoints] = useState([])
  const [selectedCheckpoint, setSelectedCheckpoint] = useState('')
  const [selectedAnimation, setSelectedAnimation] = useState('')
  const [targetCharacter, setTargetCharacter] = useState(null)

  const animations = [
    'Dancing',
    'Happy',
    'Sad',
    'Singing',
    'Talking',
    'Arguing'
  ]

  useEffect(() => {
    // Get all available checkpoints
    const points = getCheckpoints()
    setCheckpoints(Object.keys(points))
  }, [])

  const handleCheckPosition = () => {
    if (!selectedCharacter?.ref?.current) return
    
    const position = checkPosition(
      selectedCharacter.name, 
      selectedCharacter.ref.current.position
    )
    
    setCurrentPosition(position)
    console.log('Current Position:', position)
  }

  const handleGoto = () => {
    if (!selectedCharacter?.ref?.current || !selectedCheckpoint) return
    
    const movement = goto(
      selectedCharacter.name, 
      selectedCheckpoint, 
      {
        playAnimation: (name) => {
          if (selectedCharacter.animations?.[name]) {
            selectedCharacter.animations[name].reset().fadeIn(0.2).play()
          }
        }
      }
    )

    if (movement) {
      // Store the movement update function in the character's ref
      selectedCharacter.ref.current.activeGoto = movement
    }
  }

  const handlePlayAnimation = () => {
    if (!selectedCharacter || !selectedAnimation) return

    console.log('Playing animation:', {
      animation: selectedAnimation,
      availableAnimations: Object.keys(selectedCharacter.animations || {}),
    })

    const animations = selectedCharacter.animations
    const modelRef = selectedCharacter.ref

    if (!modelRef?.current || !animations) {
      console.error('Character missing required properties:', {
        hasModelRef: !!modelRef?.current,
        hasAnimations: !!animations,
        animationCount: Object.keys(animations || {}).length
      })
      return
    }

    // Stop any current animations
    Object.values(animations).forEach(anim => {
      anim.fadeOut(0.2)
    })

    // Play new animation
    if (animations[selectedAnimation]) {
      animations[selectedAnimation].reset().fadeIn(0.2).play()
      modelRef.current.currentAnimation = selectedAnimation
    }
  }

  // Add this debug log
  useEffect(() => {
    if (selectedCharacter) {
      console.log('Selected character:', {
        hasAnimations: !!selectedCharacter.animations,
        hasRef: !!selectedCharacter.ref,
        animations: Object.keys(selectedCharacter.animations || {}),
      })
    }
  }, [selectedCharacter])

  const handleWander = () => {
    if (!selectedCharacter?.ref?.current) return

    const movement = wanderAround(
      selectedCharacter.name,
      {
        playAnimation: (name) => {
          if (selectedCharacter.animations?.[name]) {
            selectedCharacter.animations[name].reset().fadeIn(0.2).play()
          }
        }
      }
    )

    if (movement) {
      selectedCharacter.ref.current.activeGoto = movement
    }
  }

  const handleTalkTo = () => {
    if (!selectedCharacter?.ref?.current || !targetCharacter?.ref?.current) return

    const interaction = talkTo(
      selectedCharacter.name,
      targetCharacter.name,
      {
        playAnimation: (name) => {
          if (selectedCharacter.animations?.[name]) {
            Object.values(selectedCharacter.animations).forEach(anim => {
              anim.fadeOut(0.2)
            })
            selectedCharacter.animations[name].reset().fadeIn(0.2).play()
          }
        }
      },
      {
        playAnimation: (name) => {
          if (targetCharacter.animations?.[name]) {
            Object.values(targetCharacter.animations).forEach(anim => {
              anim.fadeOut(0.2)
            })
            targetCharacter.animations[name].reset().fadeIn(0.2).play()
          }
        }
      }
    )

    if (interaction) {
      // Set up the interaction for both characters
      const sharedInteraction = {
        update: (model, delta) => {
          return interaction.update(
            selectedCharacter.ref.current,
            targetCharacter.ref.current,
            delta
          )
        }
      }
      
      // Assign the same interaction to both characters
      selectedCharacter.ref.current.activeGoto = sharedInteraction
      targetCharacter.ref.current.activeGoto = sharedInteraction
    }
  }

  return (
    <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg w-80">
      <h3 className="text-lg font-bold mb-4">Character Control Test</h3>
      
      {/* Character Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Character:</label>
        <select 
          className="w-full p-2 border rounded"
          value={selectedCharacter?.id || ''}
          onChange={(e) => {
            const char = characters.find(c => c.id === Number(e.target.value))
            setSelectedCharacter(char)
            setCurrentPosition(null) // Reset position display on character change
          }}
        >
          <option value="">Select a character...</option>
          {characters.map(char => (
            <option key={char.id} value={char.id}>
              {char.name}
            </option>
          ))}
        </select>
      </div>

      {/* Position Check */}
      <div className="mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-2"
          onClick={handleCheckPosition}
          disabled={!selectedCharacter}
        >
          Check Position
        </button>
        {currentPosition && (
          <div className="text-sm bg-gray-100 p-2 rounded">
            <p>X: {currentPosition.position.x.toFixed(2)}</p>
            <p>Z: {currentPosition.position.z.toFixed(2)}</p>
            {currentPosition.nearest && (
              <p>Nearest: {currentPosition.nearest.id}</p>
            )}
          </div>
        )}
      </div>

      {/* Animation Control */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Play Animation:</label>
        <select 
          className="w-full p-2 border rounded mb-2"
          value={selectedAnimation}
          onChange={(e) => setSelectedAnimation(e.target.value)}
          disabled={!selectedCharacter}
        >
          <option value="">Select animation...</option>
          {animations.map(anim => (
            <option key={anim} value={anim}>
              {anim}
            </option>
          ))}
        </select>
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded w-full"
          onClick={handlePlayAnimation}
          disabled={!selectedCharacter || !selectedAnimation}
        >
          Play Animation
        </button>
      </div>

      {/* Goto Control */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Go to:</label>
        <select 
          className="w-full p-2 border rounded mb-2"
          value={selectedCheckpoint}
          onChange={(e) => setSelectedCheckpoint(e.target.value)}
          disabled={!selectedCharacter}
        >
          <option value="">Select destination...</option>
          {checkpoints.map(checkpoint => (
            <option key={checkpoint} value={checkpoint}>
              {checkpoint}
            </option>
          ))}
        </select>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded w-full"
          onClick={handleGoto}
          disabled={!selectedCharacter || !selectedCheckpoint}
        >
          Go to Location
        </button>
      </div>

      <div className="mb-4">
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded w-full mb-2"
          onClick={handleWander}
          disabled={!selectedCharacter}
        >
          Wander Around
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Talk to:</label>
        <select 
          className="w-full p-2 border rounded mb-2"
          value={targetCharacter?.id || ''}
          onChange={(e) => {
            const char = characters.find(c => c.id === Number(e.target.value))
            setTargetCharacter(char)
          }}
          disabled={!selectedCharacter}
        >
          <option value="">Select character...</option>
          {characters
            .filter(char => char.id !== selectedCharacter?.id)
            .map(char => (
              <option key={char.id} value={char.id}>
                {char.name}
              </option>
            ))}
        </select>
        <button
          className="bg-indigo-500 text-white px-4 py-2 rounded w-full"
          onClick={handleTalkTo}
          disabled={!selectedCharacter || !targetCharacter}
        >
          Talk to Character
        </button>
      </div>
    </div>
  )
} 