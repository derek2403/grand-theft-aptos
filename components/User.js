import { useEffect, useRef, useState, forwardRef } from 'react'
import { useTexture, useAnimations, Text, Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import * as THREE from 'three'
import { goto, playAnimation, talkTo } from '../utils/character'
import NPCData from '../data/NPC.json'
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { transferCoins } from '../utils/coins';
import { submitSponsoredNFTTransaction } from '../utils/nft';
import { generateImage } from '../utils/dalle';
import { useChatLog } from './ChatLog'

const animationEmoticons = {
  Dancing: '💃',
  Happy: '😊',
  Sad: '😢',
  Singing: '🎵',
  Talking: '💭',
  Arguing: '😠'
}

// Available animations from character.js
const ANIMATIONS = [
  'Dancing',
  'Happy',
  'Sad',
  'Singing',
  'Talking',
  'Arguing'
]

// Hardcoded account address
const HARDCODED_ACCOUNT = {
  address: "0x8b95ab1fdca014d470ee7c2e27c74904d16fdbee359787bcb975b0732d66e2b9"
};

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

// Radial Menu Component
function RadialMenu({ onSelect, onClose, position, npcs }) {
  const radius = 150 // Increased radius for better visibility
  const totalItems = ANIMATIONS.length + npcs.length
  const angleStep = (2 * Math.PI) / totalItems
  const keyMap = ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'K', 'L'] // Add more keys if needed

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toUpperCase()
      const index = keyMap.indexOf(key)
      if (index !== -1 && index < totalItems) {
        event.preventDefault()
        if (index < ANIMATIONS.length) {
          onSelect({ type: 'animation', name: ANIMATIONS[index] })
        } else {
          onSelect({ type: 'talk', target: npcs[index - ANIMATIONS.length] })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSelect, npcs])

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: radius * 2,
        height: radius * 2,
        pointerEvents: 'none'
      }}
    >
      {/* Circular background */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.7)',
          border: '2px solid rgba(255, 255, 255, 0.3)'
        }}
      />

      {/* Menu items */}
      {ANIMATIONS.concat(npcs.map(npc => ({ name: `Talk to ${npc.name}`, type: 'talk', target: npc }))).map((item, index) => {
        const angle = angleStep * index - Math.PI / 2 // Start from top
        const x = Math.cos(angle) * (radius - 40)
        const y = Math.sin(angle) * (radius - 40)
        const isAnimation = index < ANIMATIONS.length

        return (
          <div
            key={isAnimation ? item : item.target.id}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(${x}px, ${y}px)`,
              color: 'white',
              textAlign: 'center',
              width: '120px',
              marginLeft: '-60px',
              textShadow: '2px 2px 2px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Action label */}
            <div style={{ fontSize: '16px', marginBottom: '4px' }}>
              {isAnimation ? item : item.name}
            </div>
            {/* Key hint */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '2px 8px',
                borderRadius: '4px',
                display: 'inline-block',
                fontSize: '14px'
              }}
            >
              [{keyMap[index]}]
            </div>
          </div>
        )
      })}

      {/* Center dot */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '8px',
          height: '8px',
          background: 'white',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
    </div>
  )
}

export const User = forwardRef(({ character }, ref) => {
  const [model, setModel] = useState(null)
  const [animationsLoaded, setAnimationsLoaded] = useState({})
  const texture = useTexture(character.gender === 'men' ? '/men/shaded.png' : '/women/shaded.png')
  const modelRef = useRef()
  const mixerRef = useRef()
  const spotlightRef = useRef()
  const nameTagRef = useRef()
  const { camera } = useThree()
  const [targetPosition, setTargetPosition] = useState(null)
  const [activeMovement, setActiveMovement] = useState(null)
  const [isAnimationsLoaded, setIsAnimationsLoaded] = useState(false)
  const [showRadialMenu, setShowRadialMenu] = useState(false)
  const [radialMenuPosition, setRadialMenuPosition] = useState({ x: 0, y: 0 })
  const [currentAnimation, setCurrentAnimation] = useState(null)
  const [npcs, setNpcs] = useState(NPCData.characters)
  const [connected, setConnected] = useState(false)
  const [account, setAccount] = useState(null)
  const [transactionInProgress, setTransactionInProgress] = useState(false)
  const { addMessage } = useChatLog()
  const { signTransaction } = useWallet();
  const [nftCollectionCreated, setNftCollectionCreated] = useState(false);
  const [nftCollectionCount, setNftCollectionCount] = useState(0);

  useEffect(() => {
    const loader = new FBXLoader()
    const modelPath = character.gender === 'men' ? '/men/Men.fbx' : '/women/Women.fbx'
    
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
  }, [texture, character.gender])

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

    // Handle active movement
    if (activeMovement && modelRef.current) {
      const done = activeMovement.update(modelRef.current, delta)
      if (done) {
        setActiveMovement(null)
      }
    }
  })

  // Handle spacebar for radial menu
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space') {
        event.preventDefault()
        setShowRadialMenu(true)
        setRadialMenuPosition({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle radial menu selection
  const handleRadialSelect = async (action) => {
    setShowRadialMenu(false)

    if (action.type === 'talk') {
      const targetNPC = action.target
      
      try {
        setTransactionInProgress(true)
        
        // Do coin transfer first
        const randomAmount = Math.floor(Math.random() * 50) + 1;
        await transferCoins(
          HARDCODED_ACCOUNT,
          signTransaction,
          HARDCODED_ACCOUNT.address,
          targetNPC.walletAddress,
          randomAmount
        );
        
        // Additional NFT creation for Leonardo da Vinci (npc2)
        if (targetNPC.id === 'npc2') {
          // Generate unique collection name using timestamp, random numbers and address
          const timestamp = Date.now().toString();
          const randomBytes = new Uint8Array(8);
          crypto.getRandomValues(randomBytes);
          const randomHex = Array.from(randomBytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
          const uniqueString = `${timestamp}-${randomHex}-${HARDCODED_ACCOUNT.address.slice(-8)}`;
          const collectionName = `Collection_${uniqueString}`;

          // Generate image using DALL-E
          const prompt = "A Renaissance-style portrait in the style of Leonardo da Vinci";
          const imageUrl = await generateImage(prompt);
          console.log('Generated image URL:', imageUrl);

          // Create collection with unique name
          await submitSponsoredNFTTransaction(
            HARDCODED_ACCOUNT,
            signTransaction,
            'create_collection',
            [
              collectionName,
              `Unique Collection ${timestamp}`,
              imageUrl,
              1000 // max_supply
            ]
          );

          // Mint NFT in the new collection
          await submitSponsoredNFTTransaction(
            HARDCODED_ACCOUNT,
            signTransaction,
            'mint_nft',
            [HARDCODED_ACCOUNT.address]
          );

          addMessage({
            character: character.name,
            text: `transferred ${randomAmount} coins to ${targetNPC.name}`,
            action: true
          })

          addMessage({
            character: 'Leonardo da Vinci',
            text: `Created unique collection and minted an NFT for you!`,
            action: true
          })
        }

      } catch (error) {
        console.error('Transaction failed:', error)
        addMessage({
          character: 'System',
          text: `Failed to complete transaction: ${error.message}`,
          action: true
        })
      } finally {
        setTransactionInProgress(false)
      }

      // Create interaction using talkTo from character.js
      const interaction = talkTo(
        character.name,
        targetNPC.name,
        {
          ref: modelRef.current,
          playAnimation: (name) => {
            if (animationsLoaded[name]) {
              Object.values(animationsLoaded).forEach(anim => anim.stop());
              animationsLoaded[name].reset().fadeIn(0.5).play();
              setCurrentAnimation(name);
            }
          }
        },
        {
          ref: targetNPC.ref?.current,
          playAnimation: (name) => {
            if (targetNPC.animations?.[name]) {
              Object.values(targetNPC.animations).forEach(anim => anim.stop());
              targetNPC.animations[name].reset().fadeIn(0.5).play();
            }
          }
        }
      );

      // Store the interaction
      setActiveMovement({
        update: (model, delta) => {
          if (!model || !targetNPC.ref?.current) return false;
          const done = interaction.update(model, targetNPC.ref.current, delta);
          
          if (done) {
            // Reset both characters to idle state
            if (animationsLoaded.Stand) {
              Object.values(animationsLoaded).forEach(anim => anim.stop());
              animationsLoaded.Stand.reset().fadeIn(0.5).play();
              setCurrentAnimation('Stand');
            }
            if (targetNPC.animations?.Stand) {
              Object.values(targetNPC.animations).forEach(anim => anim.stop());
              targetNPC.animations.Stand.reset().fadeIn(0.5).play();
            }
          }
          return done;
        }
      });

      // Signal NPC controller to handle NPC's side of interaction
      if (window.npcController) {
        window.npcController.handleTalkInteraction(targetNPC.id, {
          type: 'talk',
          partner: {
            name: character.name,
            ref: modelRef,
            position: modelRef.current.position
          }
        })
      }
    } else if (action.type === 'animation') {
      if (animationsLoaded[action.name]) {
        Object.values(animationsLoaded).forEach(anim => anim.stop())
        animationsLoaded[action.name].reset().fadeIn(0.5).play()
        setCurrentAnimation(action.name)
      }

      addMessage({
        character: character.name,
        text: `is ${action.name.toLowerCase()}`,
        action: true
      })
    }
  }

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
      {currentAnimation && (
        <Html position={[modelRef.current?.position.x || 0, (modelRef.current?.position.y || 0) + 2, modelRef.current?.position.z || 0]}>
          <Dialog text={animationEmoticons[currentAnimation]} />
        </Html>
      )}
      {showRadialMenu && (
        <Html>
          <RadialMenu
            onSelect={handleRadialSelect}
            onClose={() => setShowRadialMenu(false)}
            position={radialMenuPosition}
            npcs={npcs}
          />
        </Html>
      )}
    </>
  )
})

User.displayName = 'User'