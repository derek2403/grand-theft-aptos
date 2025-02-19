import { useEffect, useRef, useState } from 'react'
import { useTexture, useAnimations, Text } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import * as THREE from 'three'
import { useCharacterController } from '../utils/CharacterController'
import { gameState } from '../utils/gameState'

export function Girl({ character }) {
  const [model, setModel] = useState(null)
  const [animationsLoaded, setAnimationsLoaded] = useState({})
  const texture = useTexture('/women/shaded.png')
  const modelRef = useRef()
  const mixerRef = useRef()
  const spotlightRef = useRef()
  const nameTagRef = useRef()
  const { camera } = useThree()
  const activeGotoRef = useRef(null)

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

    // Update position in game state
    if (modelRef.current) {
      gameState.updateCharacterPosition(character.name, {
        x: modelRef.current.position.x,
        z: modelRef.current.position.z
      });
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

    // Update game state
    gameState.update(delta)
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
    if (character && modelRef.current) {
      character.ref = modelRef
      character.animations = animationsLoaded
    }
  }, [character, modelRef.current, animationsLoaded])

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
    </>
  )
} 