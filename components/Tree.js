import * as THREE from 'three'
import { useTexture } from '@react-three/drei'

export function Tree({ position = [0, 0, 0] }) {
  const trunkTexture = useTexture('/textures/tree-bark.jpg')
  const leavesTexture = useTexture('/textures/tree-leaves.png')

  // Configure textures
  trunkTexture.wrapS = trunkTexture.wrapT = THREE.RepeatWrapping
  leavesTexture.wrapS = leavesTexture.wrapT = THREE.RepeatWrapping

  return (
    <group position={position}>
      {/* Tree trunk */}
      <mesh position={[0, 3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.6, 6, 8]} />
        <meshStandardMaterial map={trunkTexture} roughness={0.9} />
      </mesh>
      
      {/* Tree leaves */}
      <mesh position={[0, 7, 0]} castShadow>
        <coneGeometry args={[3, 6, 8]} />
        <meshStandardMaterial 
          map={leavesTexture} 
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
} 