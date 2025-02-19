import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { HOUSE_CONFIG } from './House'

export function Road() {
  const { UNIT } = HOUSE_CONFIG
  const roadTexture = useTexture('/textures/road.jpg')
  
  // Configure texture
  roadTexture.wrapS = roadTexture.wrapT = THREE.RepeatWrapping
  roadTexture.repeat.set(1, 10)

  return (
    <group>
      {/* Main vertical road */}
      <mesh 
        position={[-UNIT * 8, 0.01, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[4, UNIT * 40]} />
        <meshStandardMaterial 
          map={roadTexture}
          roughness={0.8}
        />
      </mesh>

      {/* Path to house entrance */}
      <mesh 
        position={[-UNIT * 7, 0.01, 0]} 
        rotation={[-Math.PI / 2, 0, Math.PI/2]} 
        receiveShadow
      >
        <planeGeometry args={[2, UNIT * 2]} />
        <meshStandardMaterial 
          map={roadTexture}
          roughness={0.8}
        />
      </mesh>

      {/* Horizontal road intersection */}
      <mesh 
        position={[-UNIT * 8, 0.01, -UNIT * 10]} 
        rotation={[-Math.PI / 2, 0, Math.PI/2]} 
        receiveShadow
      >
        <planeGeometry args={[4, UNIT * 30]} />
        <meshStandardMaterial 
          map={roadTexture}
          roughness={0.8}
        />
      </mesh>
    </group>
  )
} 