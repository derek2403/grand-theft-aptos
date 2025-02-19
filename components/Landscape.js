import { House } from './House'
import { HOUSE_CONFIG } from './House'
import { Tree } from './Tree'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'

const { UNIT } = HOUSE_CONFIG

export function Landscape() {
  // Load grass texture
  const grassTexture = useTexture('/textures/grass.png')
  const roadTexture = useTexture('/textures/road.jpg')
  
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping
  grassTexture.repeat.set(24, 24)
  roadTexture.wrapS = roadTexture.wrapT = THREE.RepeatWrapping
  roadTexture.repeat.set(8, 8)
  
  const housePositions = [
    // North house
    { position: [0, 0, -UNIT * 8], rotation: [0, Math.PI, 0], id: 'north' },
    // South house
    { position: [0, 0, UNIT * 8], rotation: [0, 0, 0], id: 'south' },
    // East house
    { position: [UNIT * 8, 0, 0], rotation: [0, Math.PI/2, 0], id: 'east' },
    // West house
    { position: [-UNIT * 8, 0, 0], rotation: [0, -Math.PI/2, 0], id: 'west' }
  ]

  // Tree positions around houses
  const treePositions = [
    // North cluster
    [-UNIT * 4, 0, -UNIT * 10],
    [UNIT * 4, 0, -UNIT * 10],
    // South cluster
    [-UNIT * 4, 0, UNIT * 10],
    [UNIT * 4, 0, UNIT * 10],
    // East cluster
    [UNIT * 10, 0, -UNIT * 4],
    [UNIT * 10, 0, UNIT * 4],
    // West cluster
    [-UNIT * 10, 0, -UNIT * 4],
    [-UNIT * 10, 0, UNIT * 4],
    // Corner trees
    [UNIT * 6, 0, UNIT * 6],
    [-UNIT * 6, 0, UNIT * 6],
    [UNIT * 6, 0, -UNIT * 6],
    [-UNIT * 6, 0, -UNIT * 6],
  ]

  return (
    <group>
      {/* Houses */}
      {housePositions.map((config) => (
        <House 
          key={config.id}
          position={config.position}
          rotation={config.rotation}
          id={config.id}
        />
      ))}

      {/* Trees */}
      {treePositions.map((position, index) => (
        <Tree 
          key={`tree-${index}`} 
          position={position}
        />
      ))}

      {/* Circular Road with markings */}
      <group>
        {/* Main Road Surface */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
          receiveShadow
        >
          <ringGeometry args={[UNIT * 14, UNIT * 18, 64]} />
          <meshStandardMaterial
            map={roadTexture}
            roughness={0.8}
            color="#333333"
          />
        </mesh>

        {/* Yellow Border - Inner */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, 0]}
        >
          <ringGeometry args={[UNIT * 14, UNIT * 14.3, 64]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {/* Yellow Border - Outer */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, 0]}
        >
          <ringGeometry args={[UNIT * 17.7, UNIT * 18, 64]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Ground plane */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[UNIT * 24, UNIT * 24]} />
        <meshStandardMaterial 
          map={grassTexture}
          roughness={1}
          normalScale={new THREE.Vector2(1, 1)}
        />
      </mesh>
    </group>
  )
}

// Stop Sign Component
function StopSign({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
        <meshStandardMaterial color="#4A4A4A" />
      </mesh>
      
      <mesh position={[0, 2.8, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.05]} />
        <meshStandardMaterial color="#FF0000" />
      </mesh>
      
      <mesh position={[0, 2.8, 0.03]}>
        <ringGeometry args={[0.3, 0.35, 8]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
    </group>
  )
} 