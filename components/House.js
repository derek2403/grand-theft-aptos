import * as THREE from 'three'
import { useTexture } from '@react-three/drei'

// Export constants for use in collision system
export const HOUSE_CONFIG = {
  UNIT: 2,
  WALL_HEIGHT: 3,
  WALL_THICKNESS: 0.2,
  FLOOR_HEIGHT: 0
}

// Helper component for street lamp
function StreetLamp({ position, isNight, intensity = 100 }) {
  return (
    <group position={position}>
      {/* Lamp post (tall cylinder) */}
      <mesh castShadow>
        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
        <meshStandardMaterial color="#2A2A2A" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Lamp head (shorter, wider cylinder) */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.4, 8]} />
        <meshStandardMaterial 
          color={isNight ? "#FFFFFF" : "#D3D3D3"}
          emissive={isNight ? "#FFFFFF" : "#FFFFFF"}
          emissiveIntensity={1}
        />
      </mesh>
      
      {/* Light source */}
      <pointLight
        position={[0, 1.5, 0]}
        distance={15}
        intensity={intensity}
        color="#FFFFFF"
        castShadow
        decay={2}
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
    </group>
  )
}

// Add Furniture components at the top of the file
function Cupboard({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh 
        castShadow 
        receiveShadow 
        position={[0, 1.5, 0]}
        userData={{ type: 'decoration' }}
      >
        <boxGeometry args={[2, 3, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh 
        position={[0.5, 1.5, 0.51]}
        userData={{ type: 'decoration' }}
      >
        <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color="#B8860B" metalness={0.5} />
      </mesh>
    </group>
  )
}

function Bed({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh 
        castShadow 
        receiveShadow 
        position={[0, 0.3, 0]}
        userData={{ type: 'decoration' }}
      >
        <boxGeometry args={[2, 0.4, 3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh 
        castShadow 
        receiveShadow 
        position={[0, 0.6, 0]}
        userData={{ type: 'decoration' }}
      >
        <boxGeometry args={[1.8, 0.2, 2.8]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>
      <mesh 
        castShadow 
        receiveShadow 
        position={[0, 0.8, -1]}
        userData={{ type: 'decoration' }}
      >
        <boxGeometry args={[1.6, 0.2, 0.6]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
    </group>
  )
}

// Add Table component
function Table({ position }) {
  return (
    <group position={position}>
      {/* Table top */}
      <mesh 
        castShadow 
        receiveShadow 
        position={[0, 0.8, 0]}
        userData={{ type: 'decoration' }}
      >
        <boxGeometry args={[1.5, 0.1, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Table legs */}
      {[-0.65, 0.65].map((x) => 
        [-0.4, 0.4].map((z) => (
          <mesh 
            key={`${x}-${z}`} 
            castShadow 
            receiveShadow 
            position={[x, 0.4, z]}
            userData={{ type: 'decoration' }}
          >
            <boxGeometry args={[0.1, 0.8, 0.1]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        ))
      )}
    </group>
  )
}

// Update Computer component to sit on table
function Computer({ position }) {
  return (
    <group position={position}>
      <Table position={[0, 0, 0]} />
      {/* Computer screen */}
      <mesh 
        castShadow 
        position={[0, 1.3, 0]}
        userData={{ type: 'decoration' }}
      >
        <boxGeometry args={[0.8, 0.5, 0.08]} />
        <meshStandardMaterial color="#2f2f2f" />
      </mesh>
      {/* Screen stand */}
      <mesh 
        castShadow 
        position={[0, 0.9, 0]}
        userData={{ type: 'decoration' }}
      >
        <cylinderGeometry args={[0.12, 0.12, 0.2, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Keyboard */}
      <mesh 
        castShadow 
        position={[0, 0.85, 0.4]}
        userData={{ type: 'decoration' }}
      >
        <boxGeometry args={[0.9, 0.05, 0.35]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Mouse pad */}
      <mesh 
        castShadow 
        position={[0.6, 0.86, 0.4]}
        userData={{ type: 'decoration' }}
      >
        <boxGeometry args={[0.3, 0.02, 0.25]} />
        <meshStandardMaterial color="#404040" />
      </mesh>
      {/* Mouse */}
      <mesh 
        castShadow 
        position={[0.6, 0.88, 0.4]}
        userData={{ type: 'decoration' }}
      >
        <boxGeometry args={[0.1, 0.03, 0.15]} />
        <meshStandardMaterial color="#2f2f2f" />
      </mesh>
    </group>
  )
}

export function House({ position = [0, 0, 0], rotation = [0, 0, 0], id }) {
  const { UNIT, WALL_HEIGHT, WALL_THICKNESS } = HOUSE_CONFIG
  const isNight = false // Simplified for now
  const wallTexture = useTexture('/textures/wall.jpg')
  const floorTexture = useTexture('/textures/floor.jpg')

  // Configure textures
  wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping
  wallTexture.repeat.set(1, 1)
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping
  floorTexture.repeat.set(4, 4)

  return (
    <group position={position} rotation={rotation}>
      {/* Floor */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
        userData={{ type: 'decoration' }}
      >
        <boxGeometry args={[UNIT * 6, UNIT * 6, 0.2]} />
        <meshStandardMaterial map={floorTexture} roughness={0.8} />
      </mesh>

      {/* Walls with collision */}
      {/* Back wall */}
      <mesh 
        position={[0, WALL_HEIGHT/2, UNIT * 3]} 
        receiveShadow 
        castShadow
      >
        <boxGeometry args={[UNIT * 6, WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial map={wallTexture} roughness={0.8} />
      </mesh>
      
      {/* Side walls */}
      <mesh 
        position={[-UNIT * 3, WALL_HEIGHT/2, 0]} 
        rotation={[0, Math.PI/2, 0]} 
        receiveShadow 
        castShadow
      >
        <boxGeometry args={[UNIT * 6, WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial map={wallTexture} roughness={0.8} />
      </mesh>
      
      <mesh 
        position={[UNIT * 3, WALL_HEIGHT/2, 0]} 
        rotation={[0, Math.PI/2, 0]} 
        receiveShadow 
        castShadow
      >
        <boxGeometry args={[UNIT * 6, WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial map={wallTexture} roughness={0.8} />
      </mesh>

      {/* Furniture */}
      <Bed position={[-UNIT * 1.5, 0, UNIT * 1.5]} rotation={[0, Math.PI/2, 0]} />
      <Computer position={[0, 0, UNIT * 1.5]} />
      {/* Reversed Cupboard direction with Math.PI rotation */}
      <Cupboard position={[UNIT * 1.5, 0, UNIT * 1.5]} rotation={[0, Math.PI, 0]} />

      {/* Street Lamps with increased intensity */}
      <StreetLamp 
        position={[-UNIT * 2, 0, -UNIT * 3.5]} 
        isNight={isNight}
        intensity={100}
      />
      <StreetLamp 
        position={[UNIT * 2, 0, -UNIT * 3.5]} 
        isNight={isNight}
        intensity={100}
      />
    </group>
  )
}

// Wall component without collision
function Wall({ size, position, rotation = [0, 0, 0], texture }) {
  return (
    <mesh 
      position={position} 
      rotation={rotation} 
      receiveShadow 
      castShadow
      userData={{ type: 'decoration' }}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial map={texture} roughness={0.8} />
    </mesh>
  )
} 