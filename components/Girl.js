import { useEffect, useRef, useState } from 'react'
import { useTexture, useAnimations, Text, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import * as THREE from 'three'
import { useCharacterController } from '../utils/CharacterController'

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

export function Girl({ character }) {
  const [model, setModel] = useState(null)
  const [animationsLoaded, setAnimationsLoaded] = useState({})
  const texture = useTexture('/women/shaded.png')
  const modelRef = useRef()
  const mixerRef = useRef()
  const spotlightRef = useRef()
  const nameTagRef = useRef()

  useEffect(() => {
    const loader = new FBXLoader()
    
    loader.load('/women/Women.fbx', (fbx) => {
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

      // Update name tag position to follow character - increased height to 5 units
      if (nameTagRef.current) {
        nameTagRef.current.position.set(position.x, position.y + 3.5, position.z)
      }
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

  useEffect(() => {
    if (character && animationsLoaded) {
      character.animations = animationsLoaded
      character.ref = modelRef
      
      // Debug log
      console.log('Girl animations loaded:', {
        animationCount: Object.keys(animationsLoaded).length,
        availableAnimations: Object.keys(animationsLoaded)
      })
    }
  }, [character, animationsLoaded])

  if (!model) return null

  return (
    <>
      <primitive 
        ref={modelRef} 
        object={model} 
        position={character.position}
        rotation={[0, Math.PI, 0]}
      />
      {modelRef.current?.currentAnimation && (
        <Html position={[modelRef.current.position.x, modelRef.current.position.y + 2, modelRef.current.position.z]}>
          <Dialog text={animationEmoticons[modelRef.current.currentAnimation]} />
        </Html>
      )}
      {/* Floating name tag with increased height */}
      <Text
        ref={nameTagRef}
        position={[character.position[0], character.position[1] + 5, character.position[2]]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.1}
        outlineColor="black"
        renderOrder={1}
        depthOffset={-1}
      >
        {character.name}
      </Text>
      <group>
        <spotLight
          ref={spotlightRef}
          position={[0, 5, 0]}
          angle={Math.PI / 3}
          penumbra={0.2}
          intensity={10}
          distance={12}
          color="#FFFFFF"
          castShadow
          decay={1.5}
        >
          <primitive object={new THREE.Object3D()} attach="target" />
        </spotLight>
      </group>
    </>
  )
} 