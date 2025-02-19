import { useEffect, useRef, useState } from 'react'
import { useTexture, useAnimations, Text, Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import * as THREE from 'three'

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

export function User({ gender = 'men', character }) {
  const [model, setModel] = useState(null)
  const [animationsLoaded, setAnimationsLoaded] = useState({})
  const texture = useTexture(gender === 'men' ? '/men/shaded.png' : '/women/shaded.png')
  const modelRef = useRef()
  const mixerRef = useRef()
  const spotlightRef = useRef()
  const nameTagRef = useRef()
  const { camera } = useThree()

  useEffect(() => {
    const loader = new FBXLoader()
    const modelPath = gender === 'men' ? '/men/Men.fbx' : '/women/Women.fbx'
    
    loader.load(modelPath, (fbx) => {
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
  }, [texture, gender])

  // Handle click movement
  useEffect(() => {
    const handleClick = (event) => {
      if (event.button !== 0) return // Only handle left clicks
      
      const mouse = new THREE.Vector2()
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(mouse, camera)

      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
      const intersectionPoint = new THREE.Vector3()
      
      raycaster.ray.intersectPlane(groundPlane, intersectionPoint)

      if (modelRef.current) {
        // Calculate movement direction
        const direction = new THREE.Vector3()
        direction.subVectors(intersectionPoint, modelRef.current.position).normalize()

        // Update rotation to face movement direction
        const targetRotation = Math.atan2(direction.x, direction.z)
        modelRef.current.rotation.y = targetRotation

        // Start running animation
        if (animationsLoaded.Run) {
          Object.values(animationsLoaded).forEach(anim => anim.stop())
          animationsLoaded.Run.reset().fadeIn(0.5).play()
        }

        // Store target position
        modelRef.current.targetPosition = intersectionPoint
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [camera, animationsLoaded])

  useFrame((state, delta) => {
    // Update animation mixer
    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }

    // Handle movement
    if (modelRef.current?.targetPosition) {
      const currentPos = modelRef.current.position
      const target = modelRef.current.targetPosition
      
      const direction = new THREE.Vector3()
      direction.subVectors(target, currentPos).normalize()
      
      const moveAmount = 0.1 * delta * 60 // Adjust speed as needed
      const movement = direction.multiplyScalar(moveAmount)
      
      // Check if we're close enough to target
      const distance = currentPos.distanceTo(target)
      if (distance < 0.1) {
        modelRef.current.targetPosition = null
        
        // Switch to standing animation
        if (animationsLoaded.Stand) {
          Object.values(animationsLoaded).forEach(anim => anim.stop())
          animationsLoaded.Stand.reset().fadeIn(0.5).play()
        }
      } else {
        // Update position
        currentPos.add(movement)
      }
    }

    // Update spotlight and nametag
    if (modelRef.current && spotlightRef.current) {
      const position = modelRef.current.position
      spotlightRef.current.position.set(position.x, position.y + 5, position.z)
      spotlightRef.current.target.position.set(position.x, position.y, position.z)
      spotlightRef.current.target.updateMatrixWorld()

      if (nameTagRef.current) {
        nameTagRef.current.position.set(position.x, position.y + 3.5, position.z)
        
        const directionToCamera = new THREE.Vector3()
        directionToCamera.subVectors(camera.position, nameTagRef.current.position)
        
        const angleToCamera = Math.atan2(directionToCamera.x, directionToCamera.z)
        nameTagRef.current.rotation.y = angleToCamera
      }
    }
  })

  if (!model) return null

  return (
    <>
      <primitive 
        ref={modelRef} 
        object={model} 
        position={[0, 0, 0]}
        rotation={[0, Math.PI, 0]}
      />
      {/* Billboard name tag */}
      <group
        ref={nameTagRef}
        position={[0, 3.5, 0]}
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
          {character?.name || "User"}
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