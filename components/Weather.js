import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const RAIN_COUNT = 1000
const CLOUD_COUNT = 8

function RainDrop({ position }) {
  const meshRef = useRef()
  const velocity = useRef(0.1 + Math.random() * 0.1)
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.y -= velocity.current
      if (meshRef.current.position.y < 0) {
        meshRef.current.position.y = 50
      }
    }
  })

  return (
    <mesh 
      ref={meshRef} 
      position={position}
      userData={{ type: 'decoration' }}
    >
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshStandardMaterial color="#68c8ff" transparent opacity={0.6} />
    </mesh>
  )
}

function Cloud({ position }) {
  return (
    <group position={position}>
      <mesh userData={{ type: 'decoration' }}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshStandardMaterial color="#c2c2c2" transparent opacity={0.8} />
      </mesh>
      <mesh position={[1.5, 0, 0]} userData={{ type: 'decoration' }}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshStandardMaterial color="#c2c2c2" transparent opacity={0.8} />
      </mesh>
      <mesh position={[-1.5, 0, 0]} userData={{ type: 'decoration' }}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshStandardMaterial color="#c2c2c2" transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

function Lightning() {
  const lightRef = useRef()
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance of lightning every interval
        lightRef.current.intensity = 2
        setTimeout(() => {
          lightRef.current.intensity = 0
        }, 150)
      }
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])

  return <pointLight ref={lightRef} position={[0, 50, 0]} intensity={0} color="#fff" />
}

export function Weather({ type = 'sunny' }) {
  const rainDrops = useRef([])
  const clouds = useRef([])

  useEffect(() => {
    // Generate rain positions
    rainDrops.current = Array(RAIN_COUNT).fill().map(() => [
      Math.random() * 100 - 50,
      Math.random() * 50,
      Math.random() * 100 - 50
    ])

    // Generate cloud positions
    clouds.current = Array(CLOUD_COUNT).fill().map(() => [
      Math.random() * 60 - 30,
      20 + Math.random() * 10,
      Math.random() * 60 - 30
    ])
  }, [])

  if (type === 'sunny') {
    return null
  }

  return (
    <group>
      {/* Clouds for cloudy and rainy weather */}
      {(type === 'cloudy' || type === 'rain' || type === 'thunderstorm') && (
        clouds.current.map((position, i) => (
          <Cloud key={`cloud-${i}`} position={position} />
        ))
      )}

      {/* Rain particles */}
      {(type === 'rain' || type === 'thunderstorm') && (
        rainDrops.current.map((position, i) => (
          <RainDrop key={`rain-${i}`} position={position} />
        ))
      )}

      {/* Lightning for thunderstorm */}
      {type === 'thunderstorm' && <Lightning />}
    </group>
  )
} 