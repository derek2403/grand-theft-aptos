import { useEffect, useRef, useState } from 'react'
import { useTexture, useAnimations, Text, Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import * as THREE from 'three'
import { useCharacterController } from '../utils/CharacterController'

const animationEmoticons = {
  Dancing: '💃',
  Happy: '😊',
  Sad: '😢',
  Singing: '🎵',
  Talking: '💭',
  Arguing: '😠',
  Stand: '',
  Run: '🏃',
  Left: '👈',
  Right: '👉'
}

function Dialog({ text }) {
  if (!text) return null;  // Don't render empty dialogs
  
  return (
    <div 
      className="absolute bg-white px-3 py-1 rounded-lg shadow-md text-xl transform -translate-x-1/2 -translate-y-24 z-[50]"
      style={{
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        border: '2px solid #4F46E5'
      }}
    >
      {text}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r-2 border-b-2 border-indigo-600" />
    </div>
  )
}

export function Boy({ character }) {
  const [model, setModel] = useState(null)
  const [animationsLoaded, setAnimationsLoaded] = useState({})
  const texture = useTexture('/men/shaded.png')
  const modelRef = useRef()
  const mixerRef = useRef()
  const spotlightRef = useRef()
  const nameTagRef = useRef()
  const { camera } = useThree()
  const activeGotoRef = useRef(null)

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

    // Update goto movement if active
    if (modelRef.current?.activeGoto) {
      const finished = modelRef.current.activeGoto.update(modelRef.current, delta)
      if (finished) {
        // Clear the goto reference and ensure standing animation
        modelRef.current.activeGoto = null
        if (animationsLoaded.Run) {
          animationsLoaded.Run.fadeOut(0.2) // Fade out running animation
        }
        if (animationsLoaded.Stand) {
          animationsLoaded.Stand.reset().fadeIn(0.2).play()
        }
      }
    }

    if (modelRef.current && spotlightRef.current) {
      const position = modelRef.current.position
      // Position the light directly above the character
      spotlightRef.current.position.set(position.x, position.y + 5, position.z)
      spotlightRef.current.target.position.set(position.x, position.y, position.z)
      spotlightRef.current.target.updateMatrixWorld()

      // Update name tag position and rotation to face camera
      if (nameTagRef.current) {
        nameTagRef.current.position.set(position.x, position.y + 3.5, position.z)
        
        // Calculate direction to camera
        const directionToCamera = new THREE.Vector3()
        directionToCamera.subVectors(camera.position, nameTagRef.current.position)
        
        // Calculate rotation to face camera
        const angleToCamera = Math.atan2(directionToCamera.x, directionToCamera.z)
        nameTagRef.current.rotation.y = angleToCamera
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
      console.log('Boy animations loaded:', {
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
      {/* Billboard name tag that always faces camera */}
      <group
        ref={nameTagRef}
        position={[character.position[0], character.position[1] + 3.5, character.position[2]]}
      >
        <Text
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
      </group>
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
      {modelRef.current?.currentAnimation && (
        <Html position={[modelRef.current.position.x, modelRef.current.position.y + 2, modelRef.current.position.z]}>
          <Dialog text={animationEmoticons[modelRef.current.currentAnimation]} />
        </Html>
      )}
    </>
  )
} 