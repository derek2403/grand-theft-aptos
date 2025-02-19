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
  const spotlightRef = useRef()

  useEffect(() => {
    const loader = new FBXLoader()
    
    loader.load('/men/Men.fbx', (fbx) => {
      fbx.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({ 
            map: texture,
            roughness: 0.5,
            metalness: 0.1,
            envMapIntensity: 1,
            color: 0xffffff,
            normalScale: new THREE.Vector2(1, 1),
            aoMapIntensity: 1,
          })
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      
      fbx.scale.setScalar(0.015)
      
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

    if (modelRef.current && spotlightRef.current) {
      const position = modelRef.current.position
      // Position the light directly above the character
      spotlightRef.current.position.set(position.x, position.y + 5, position.z)
      // Target directly below the light (at character position)
      spotlightRef.current.target.position.set(position.x, position.y, position.z)
      spotlightRef.current.target.updateMatrixWorld()
    }
  })

  useEffect(() => {
    if (animationsLoaded.Stand) {
      animationsLoaded.Stand.play()
    }
  }, [animationsLoaded])

  const { position } = useCharacterController(animationsLoaded, modelRef)

  useEffect(() => {
    console.log(`Character is at: ${position.x}, ${position.z}`)
  }, [position])

  if (!model) return null

  return (
    <>
      <primitive 
        ref={modelRef} 
        object={model} 
        position={[0, 0, 0]}
        rotation={[0, Math.PI, 0]}
      />
      <group>
        <spotLight
          ref={spotlightRef}
          position={[0, 5, 0]}
          angle={Math.PI / 3}  // Wider angle (60 degrees)
          penumbra={0.2}
          intensity={10}       // Much brighter
          distance={12}        // Longer range
          color="#FFFFFF"
          castShadow
          decay={1.5}         // Slower light falloff
        >
          <primitive object={new THREE.Object3D()} attach="target" />
        </spotLight>
      </group>
    </>
  )
} 