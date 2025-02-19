import { useEffect, useRef, useState } from 'react'
import { useTexture, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import * as THREE from 'three'
import { useCharacterController } from '../utils/CharacterController'

export function Boy() {
  const [model, setModel] = useState(null)
  const [animationsLoaded, setAnimationsLoaded] = useState({})
  const texture = useTexture('/men/shaded.png')
  const modelRef = useRef()
  const mixerRef = useRef()

  useEffect(() => {
    const loader = new FBXLoader()
    
    loader.load('/men/Men.fbx', (fbx) => {
      fbx.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({ 
            map: texture
          })
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      
      fbx.scale.setScalar(0.01)
      
      const mixer = new THREE.AnimationMixer(fbx)
      mixerRef.current = mixer
      
      setModel(fbx)

      const animations = [
        'Stand',
        'Run',
        'Dancing',
        'Happy',
        'Left',
        'Right',
        'Sad',
        'Singing',
        'Talking',
        'Arguing'
      ]

      animations.forEach(animName => {
        loader.load(`/animations/${animName}.fbx`, (animFBX) => {
          if (animFBX.animations && animFBX.animations.length > 0) {
            const clip = animFBX.animations[0]
            clip.name = animName
            
            const action = mixer.clipAction(clip)
            action.setLoop(THREE.LoopRepeat)
            
            if (animName === 'Run') {
              action.timeScale = 1.2
            }
            
            setAnimationsLoaded(prev => ({
              ...prev,
              [animName]: action
            }))
          }
        })
      })
    })

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction()
      }
    }
  }, [texture])

  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }
  })

  useEffect(() => {
    if (animationsLoaded.Stand) {
      animationsLoaded.Stand.play()
    }
  }, [animationsLoaded])

  useCharacterController(animationsLoaded, modelRef)

  if (!model) return null

  return (
    <primitive 
      ref={modelRef} 
      object={model} 
      position={[0, 0, 0]}
      rotation={[0, Math.PI, 0]}
    />
  )
} 