import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { useState, useEffect, useRef } from 'react'
import { House } from './House'
import { Landscape } from './Landscape'
import { Weather } from './Weather'
import { TimeSimulation } from '../utils/TimeSimulation'

export function Environment({ weatherType = 'sunny' }) {
  const [timeState, setTimeState] = useState({
    timeOfDay: 'day',
    dayProgress: 0.5,
    hours: 12
  })
  
  const timeSimRef = useRef(new TimeSimulation(1000))
  const grassTexture = useTexture('/textures/grass.png')

  // Configure grass texture repeating
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping
  grassTexture.repeat.set(20, 20)

  const GROUND_SIZE = 200
  const GROUND_HEIGHT = -0.1

  // Time-based lighting configurations
  const lightingConfig = {
    sunrise: {
      skyColor: '#FF7F50',
      ambientLight: 0.3,
      directionalLight: 0.5,
      fogColor: '#FFB6C1',
      fogDensity: 0.02
    },
    day: {
      skyColor: '#87CEEB',
      ambientLight: 1,
      directionalLight: 1,
      fogColor: '#E6E6FA',
      fogDensity: 0.01
    },
    sunset: {
      skyColor: '#FF6347',
      ambientLight: 0.4,
      directionalLight: 0.6,
      fogColor: '#DDA0DD',
      fogDensity: 0.02
    },
    dusk: {
      skyColor: '#4B0082',
      ambientLight: 0.2,
      directionalLight: 0.3,
      fogColor: '#483D8B',
      fogDensity: 0.03
    },
    night: {
      skyColor: '#191970',
      ambientLight: 0.1,
      directionalLight: 0.1,
      fogColor: '#000080',
      fogDensity: 0.04
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeState = timeSimRef.current.update()
      setTimeState(newTimeState)
    }, 16.67) // ~60fps

    return () => clearInterval(interval)
  }, [])

  const currentConfig = lightingConfig[timeState.timeOfDay]

  return (
    <group position={[0, 0, 0]}>
      {/* Sky */}
      <color attach="background" args={[currentConfig.skyColor]} />
      
      {/* Fog */}
      <fog attach="fog" color={currentConfig.fogColor} density={currentConfig.fogDensity} />
      
      {/* Ambient Light */}
      <ambientLight intensity={currentConfig.ambientLight} />
      
      {/* Sun/Moon Directional Light */}
      <directionalLight
        position={[
          Math.cos(timeState.dayProgress * Math.PI) * 100,
          Math.sin(timeState.dayProgress * Math.PI) * 100,
          0
        ]}
        intensity={currentConfig.directionalLight}
        castShadow
      />

      {/* Grass ground */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, GROUND_HEIGHT, 0]} 
        receiveShadow
      >
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        <meshStandardMaterial 
          map={grassTexture}
          roughness={1}
          metalness={0}
        />
      </mesh>

      <House timeOfDay={timeState.timeOfDay} />
      <Landscape />
      <Weather type={weatherType} timeOfDay={timeState.timeOfDay} />
    </group>
  )
} 