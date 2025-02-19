import * as THREE from 'three'
import { useTexture } from '@react-three/drei'

// Export constants for use in collision system
export const HOUSE_CONFIG = {
  UNIT: 3,
  WALL_HEIGHT: 3,
  WALL_THICKNESS: 0.2,
  FLOOR_HEIGHT: 0
}

// Helper component for street lamp
function StreetLamp({ position, isNight }) {
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
          emissive={isNight ? "#FFFFFF" : "#000000"}
          emissiveIntensity={isNight ? 1 : 0}
        />
      </mesh>
      
      {/* Light source */}
      <pointLight
        position={[0, 1.5, 0]}
        distance={15}
        intensity={isNight ? 50 : 10}
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
      <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
        <boxGeometry args={[2, 3, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Door handle */}
      <mesh position={[0.5, 1.5, 0.51]}>
        <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color="#B8860B" metalness={0.5} />
      </mesh>
    </group>
  )
}

function Bed({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Bed Frame */}
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[2, 0.4, 3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Mattress */}
      <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
        <boxGeometry args={[1.8, 0.2, 2.8]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>
      {/* Pillow */}
      <mesh castShadow receiveShadow position={[0, 0.8, -1]}>
        <boxGeometry args={[1.6, 0.2, 0.6]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
    </group>
  )
}

// Update Computer component with even larger dimensions
function Computer({ position }) {
  return (
    <group position={position}>
      {/* Monitor - significantly increased size */}
      <mesh castShadow position={[0, 1.0, 0]}>
        <boxGeometry args={[1.2, 0.8, 0.1]} /> {/* Increased from [0.8, 0.5, 0.08] */}
        <meshStandardMaterial color="#2f2f2f" />
      </mesh>
      {/* Monitor Stand - taller and thicker */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.6, 8]} /> {/* Increased from [0.08, 0.08, 0.4] */}
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Keyboard - wider and deeper */}
      <mesh castShadow position={[0, 0.15, 0.4]}>
        <boxGeometry args={[0.9, 0.05, 0.35]} /> {/* Increased from [0.6, 0.03, 0.25] */}
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Mouse pad with mouse */}
      <mesh castShadow position={[0.6, 0.16, 0.4]}>
        <boxGeometry args={[0.3, 0.02, 0.25]} />
        <meshStandardMaterial color="#404040" />
      </mesh>
      {/* Mouse */}
      <mesh castShadow position={[0.6, 0.18, 0.4]}>
        <boxGeometry args={[0.1, 0.03, 0.15]} />
        <meshStandardMaterial color="#2f2f2f" />
      </mesh>
    </group>
  )
}

// Update BigTable component with even larger dimensions
function BigTable({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Table Top - further increased width and depth */}
      <mesh castShadow receiveShadow position={[0, 1, 0]}>
        <boxGeometry args={[6, 0.15, 2.5]} /> {/* Increased from [4.5, 0.1, 2] */}
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Table Legs - adjusted positions for larger table */}
      {[-2.8, 2.8].map((x) => 
        [-1, 1].map((z) => (
          <mesh key={`${x}-${z}`} castShadow receiveShadow position={[x, 0.5, z]}>
            <boxGeometry args={[0.15, 1, 0.15]} /> {/* Thicker legs */}
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        ))
      )}
      {/* Computers on the table - spread out more */}
      <Computer position={[-2, 1, -0.4]} />
      <Computer position={[0, 1, -0.4]} />
      <Computer position={[2, 1, -0.4]} />
    </group>
  )
}

export function House({ timeOfDay = 'day' }) {
  // Add console.log to verify timeOfDay prop
  const isNight = timeOfDay === 'night'
  
  // Load textures
  const wallTexture = useTexture('/textures/wall.jpg')
  const floorTexture = useTexture('/textures/floor.jpg')

  // Configure texture repeating
  wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping
  wallTexture.repeat.set(2, 2)
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping
  floorTexture.repeat.set(8, 8)

  const { UNIT, WALL_HEIGHT, WALL_THICKNESS, FLOOR_HEIGHT } = HOUSE_CONFIG

  // Street lamp positions
  const streetLamps = [
    [-17.00, 0, -17.48],  // Corner 1
    [8.53, 0, -17.43],    // Corner 2
    [10.06, 0, -16.28],   // Corner 3
    [17.42, 0, 6.86],     // Corner 4
    [-17.00, 0, 6.73],
    [17.48, 0, 4.86],
    [-17.00, 0, 4.97], 
    [0.73, 0, -5.30],
    
  ]

  return (
    <group position={[0, FLOOR_HEIGHT, 0]}>
      {/* Main Floor */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <boxGeometry args={[UNIT * 12, UNIT * 12, 0.2]} />
        <meshStandardMaterial 
          map={floorTexture} 
          roughness={0.8} 
          metalness={0.2}
          color={isNight ? new THREE.Color(0.7, 0.7, 0.7) : new THREE.Color(1, 1, 1)}
        />
      </mesh>

      {/* Street Lamps */}
      {streetLamps.map((position, index) => (
        <StreetLamp
          key={`street-lamp-${index}`}
          position={position}
          isNight={isNight}
        />
      ))}

      {/* Outer Walls */}
      <Wall size={[UNIT * 12, WALL_HEIGHT, WALL_THICKNESS]} position={[0, WALL_HEIGHT/2, UNIT * 6]} texture={wallTexture} isNight={isNight} />
      <Wall size={[UNIT * 12, WALL_HEIGHT, WALL_THICKNESS]} position={[0, WALL_HEIGHT/2, -UNIT * 6]} texture={wallTexture} isNight={isNight} />
      
      {/* Left outer wall with entrance cutout */}
      <Wall size={[UNIT * 5, WALL_HEIGHT, WALL_THICKNESS]} position={[-UNIT * 6, WALL_HEIGHT/2, UNIT * 3.5]} rotation={[0, Math.PI/2, 0]} texture={wallTexture} isNight={isNight} />
      <Wall size={[UNIT * 5, WALL_HEIGHT, WALL_THICKNESS]} position={[-UNIT * 6, WALL_HEIGHT/2, -UNIT * 3.5]} rotation={[0, Math.PI/2, 0]} texture={wallTexture} isNight={isNight} />
      <Wall size={[UNIT * 12, WALL_HEIGHT, WALL_THICKNESS]} position={[UNIT * 6, WALL_HEIGHT/2, 0]} rotation={[0, Math.PI/2, 0]} texture={wallTexture} isNight={isNight} />

      {/* Room 1 (Top Left) */}
      <Wall size={[UNIT * 4, WALL_HEIGHT, WALL_THICKNESS]} position={[-UNIT * 4, WALL_HEIGHT/2, UNIT * 2]} texture={wallTexture} isNight={isNight} />
      <Wall size={[UNIT * 4, WALL_HEIGHT, WALL_THICKNESS]} position={[-UNIT * 0.99, WALL_HEIGHT/2, UNIT * 4]} rotation={[0, Math.PI/2, 0]} texture={wallTexture} isNight={isNight} />

      {/* Room 2 (Top Right) */}
      <Wall size={[UNIT * 6, WALL_HEIGHT, WALL_THICKNESS]} position={[UNIT * 3, WALL_HEIGHT/2, UNIT * 2]} texture={wallTexture} isNight={isNight} />

      {/* Room 3 (Center) */}
      <Wall size={[UNIT * 5, WALL_HEIGHT, WALL_THICKNESS]} position={[-1, WALL_HEIGHT/2, -6]} texture={wallTexture} isNight={isNight} />

      {/* Room 4 (Bottom Left) */}
      <Wall size={[UNIT * 4, WALL_HEIGHT, WALL_THICKNESS]} position={[-UNIT * 3, WALL_HEIGHT/2, -UNIT * 2]} texture={wallTexture} isNight={isNight} />
      <Wall size={[UNIT * 4, WALL_HEIGHT, WALL_THICKNESS]} position={[-UNIT * 2, WALL_HEIGHT/2, -UNIT * 4]} rotation={[0, Math.PI/2, 0]} texture={wallTexture} isNight={isNight} />

      {/* Room 5 (Bottom Right) */}
      <Wall size={[UNIT * 2, WALL_HEIGHT, WALL_THICKNESS]} position={[UNIT * 5, WALL_HEIGHT/2, -UNIT * 2]} texture={wallTexture} isNight={isNight} />
      <Wall size={[UNIT * 4, WALL_HEIGHT, WALL_THICKNESS]} position={[UNIT * 3, WALL_HEIGHT/2, -UNIT * 4]} rotation={[0, Math.PI/2, 0]} texture={wallTexture} isNight={isNight} />

      {/* Add Cupboards */}
      <Cupboard position={[10.052, 0, -17.44]} rotation={[0, Math.PI/1509, 0]} />
      <Cupboard position={[8.56, 0, -13.92]} rotation={[0, -Math.PI/0.4, 0]} />
      <Cupboard position={[-2.41, 0, 16.16]} rotation={[0, Math.PI/2, 0]} />
      <Cupboard position={[-17.12, 0, 16.02]} rotation={[0, -Math.PI/2, 0]} />
      <Cupboard position={[-13.34, 0, -6.57]} rotation={[0, Math.PI/1, 0]} />

      {/* Add Beds at correct positions */}
      <Bed position={[-8.12, 0, -15.88]} rotation={[0, Math.PI/1, 0]} />
      <Bed position={[-4.70, 0, 15.72]} rotation={[0, -Math.PI/1, 0]} />
      <Bed position={[10.62, 0, 14.19]} rotation={[0, Math.PI/1, 0]} />
      <Bed position={[0, 0, -7.43]} rotation={[0, 1.5, 0]} />
      <Bed position={[16.35, 0, -14.21]} rotation={[0, -Math.PI/2, 0]} />

      {/* Add Big Table with Computers */}
      <BigTable 
        position={[8.76, 0, 4.52]} 
        rotation={[0, Math.PI, 0]} // Rotated to face the wall
      />
    </group>
  )
}

// Helper component for walls
function Wall({ size, position, rotation = [0, 0, 0], texture, isNight }) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial 
        map={texture} 
        roughness={0.8} 
        metalness={0.2}
        color={isNight ? new THREE.Color(0.7, 0.7, 0.7) : new THREE.Color(1, 1, 1)}
      />
    </mesh>
  )
} 