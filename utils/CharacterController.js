import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function useCharacterController(animations, model) {
  const currentAnimation = useRef(null)
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false
  })

  const playAnimation = (name) => {
    if (!animations || !animations[name]) return
    if (currentAnimation.current === name) return

    // Fade out current animation
    if (currentAnimation.current && animations[currentAnimation.current]) {
      const current = animations[currentAnimation.current]
      current.fadeOut(0.2)
    }

    // Play new animation
    const newAnim = animations[name]
    newAnim.reset().fadeIn(0.2).play()
    
    currentAnimation.current = name
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW':
          if (!moveState.current.forward) {
            moveState.current.forward = true
            playAnimation('Run')
          }
          break
        case 'KeyS':
          if (!moveState.current.backward) {
            moveState.current.backward = true
            playAnimation('Run')
          }
          break
        case 'KeyA':
          if (!moveState.current.left) {
            moveState.current.left = true
            playAnimation('Left')
          }
          break
        case 'KeyD':
          if (!moveState.current.right) {
            moveState.current.right = true
            playAnimation('Right')
          }
          break
        case 'Digit1': playAnimation('Dancing'); break
        case 'Digit2': playAnimation('Happy'); break
        case 'Digit3': playAnimation('Sad'); break
        case 'Digit4': playAnimation('Singing'); break
        case 'Digit5': playAnimation('Talking'); break
        case 'Digit6': playAnimation('Arguing'); break
      }
    }

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW':
          moveState.current.forward = false
          break
        case 'KeyS':
          moveState.current.backward = false
          break
        case 'KeyA':
          moveState.current.left = false
          break
        case 'KeyD':
          moveState.current.right = false
          break
      }

      if (!moveState.current.forward && 
          !moveState.current.backward && 
          !moveState.current.left && 
          !moveState.current.right) {
        playAnimation('Stand')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [animations])

  useFrame((state, delta) => {
    if (!model.current) return

    const moveX = Number(moveState.current.right) - Number(moveState.current.left)
    const moveZ = Number(moveState.current.backward) - Number(moveState.current.forward)

    if (moveX !== 0 || moveZ !== 0) {
      const angle = Math.atan2(moveX, moveZ)
      model.current.rotation.y = angle
      
      const speed = 0.1
      model.current.position.x += moveX * speed
      model.current.position.z += moveZ * speed
    }
  })

  return { moveState, playAnimation }
} 