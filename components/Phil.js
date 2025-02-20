import { useEffect, useRef, useState } from 'react'
import { Text, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import * as THREE from 'three'
import { wanderAround } from '../utils/character'
import mapData from '../data/map.json'

const INSPIRATIONAL_QUOTES = [
  "Join my hackathon! 🚀",
  "There's a unicorn within all of you! 🦄",
  "Think outside the box! 📦",
  "MVP by Monday! 💪",
  "Who needs sleep when you have coffee? ☕",
  "Fail fast, succeed faster! 🎯",
  "It's not a bug, it's a feature! 🐛",
]

function Dialog({ text }) {
  return (
    <div 
      className="absolute bg-white px-3 py-1 rounded-lg shadow-md text-sm transform -translate-x-1/2 -translate-y-24 z-[5]"
      style={{
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        fontWeight: 'bold',
        border: '2px solid #4F46E5'
      }}
    >
      {text}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r-2 border-b-2 border-indigo-600" />
    </div>
  )
}

// This is the inner component that uses R3F hooks
function PhilModel() {
  const [model, setModel] = useState(null)
  const [showDialog, setShowDialog] = useState(false)
  const [currentQuote, setCurrentQuote] = useState("")
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const modelRef = useRef()
  const mixerRef = useRef()
  const wanderRef = useRef(null)
  const nameTagRef = useRef()
  const textureRef = useRef(null)
  const runAnimRef = useRef(null)

  // Handle keypress
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key.toLowerCase() === 'p') {
        // Show random quote
        const quote = INSPIRATIONAL_QUOTES[Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)]
        setCurrentQuote(quote)
        setShowDialog(true)
        
        // Hide after 2 seconds
        setTimeout(() => {
          setShowDialog(false)
        }, 2000)
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    return () => window.removeEventListener('keypress', handleKeyPress)
  }, [])

  // First, check if map is loaded
  useEffect(() => {
    if (mapData) {
      setIsMapLoaded(true)
    }
  }, [])

  // Load texture and model only after map is loaded
  useEffect(() => {
    if (!isMapLoaded) return;

    const textureLoader = new THREE.TextureLoader()
    textureLoader.load('/men/shaded.png', (loadedTexture) => {
      textureRef.current = loadedTexture
      
      const loader = new FBXLoader()
      loader.load('/men/Men.fbx', (fbx) => {
        fbx.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({ 
              map: textureRef.current,
              roughness: 0.5,
              metalness: 0.1,
              envMapIntensity: 1,
              color: 0xffffff
            })
            child.castShadow = true
            child.receiveShadow = true
          }
        })
        
        fbx.scale.setScalar(0.015)
        
        const mixer = new THREE.AnimationMixer(fbx)
        mixerRef.current = mixer

        // Load run animation
        loader.load('/animations/Run.fbx', (runFbx) => {
          if (runFbx.animations && runFbx.animations.length > 0) {
            runAnimRef.current = runFbx.animations[0]
            const action = mixer.clipAction(runAnimRef.current)
            action.play()
          }
        })
        
        setModel(fbx)
        
        // Initialize wandering with a random starting position from the map
        const commonAreas = mapData.commonArea.talkingAreas
        const randomArea = commonAreas[Math.floor(Math.random() * commonAreas.length)]
        const startPosition = new THREE.Vector3(randomArea.x, 0, randomArea.z)
        
        fbx.position.copy(startPosition)
        
        wanderRef.current = wanderAround('Phil', {
          playAnimation: (name) => {
            if (mixerRef.current && runAnimRef.current) {
              const action = mixer.clipAction(runAnimRef.current)
              action.reset().fadeIn(0.5).play()
            }
          }
        })
      })
    })
  }, [isMapLoaded])

  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }

    if (wanderRef.current && modelRef.current) {
      wanderRef.current.update(modelRef.current, delta)
    }

    // Update nametag position and rotation to follow model and face camera
    if (modelRef.current && nameTagRef.current) {
      nameTagRef.current.position.x = modelRef.current.position.x
      nameTagRef.current.position.z = modelRef.current.position.z
      
      // Make the text face the camera
      nameTagRef.current.quaternion.copy(state.camera.quaternion)
    }
  })

  if (!model || !isMapLoaded) return null

  return (
    <>
      <primitive 
        ref={modelRef} 
        object={model} 
        rotation={[0, Math.PI, 0]}
      />
      <group
        ref={nameTagRef}
        position={[0, 3.5, 0]}
      >
        <Text
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.1}
          outlineColor="#4F46E5"
          renderOrder={1}
          depthOffset={-1}
          // Add billboard mode to always face camera
          userData={{ enableBillboard: true }}
        >
          Phil
        </Text>
      </group>
      {showDialog && currentQuote && modelRef.current && (
        <Html position={[modelRef.current.position.x, modelRef.current.position.y + 2, modelRef.current.position.z]}>
          <Dialog text={currentQuote} />
        </Html>
      )}
    </>
  )
}

// This is the outer component that can be used outside Canvas
export function Phil() {
  return <PhilModel />
} 