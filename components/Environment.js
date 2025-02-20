import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { useState, useEffect, useRef } from 'react'

import { Landscape } from './Landscape'
import { Weather } from './Weather'

// Weather configurations moved inline
const weatherConfigs = {
  sunny: {
    sunrise: { skyColor: '#FF9A5C', ambientLight: 0.3, directionalLight: 0.5 },
    day: { skyColor: '#4FA4E8', ambientLight: 1, directionalLight: 1 },
    sunset: { skyColor: '#FF6B4A', ambientLight: 0.4, directionalLight: 0.6 },
    dusk: { skyColor: '#2C1B4B', ambientLight: 0.2, directionalLight: 0.3 },
    night: { skyColor: '#020409', ambientLight: 0.1, directionalLight: 0.1 } // 50% darker
  },
  cloudy: {
    sunrise: { skyColor: '#E6B5A1', ambientLight: 0.2, directionalLight: 0.3 },
    day: { skyColor: '#9EAFC2', ambientLight: 0.3, directionalLight: 0.5 },
    sunset: { skyColor: '#B88A8E', ambientLight: 0.25, directionalLight: 0.4 },
    dusk: { skyColor: '#4A4E69', ambientLight: 0.15, directionalLight: 0.2 },
    night: { skyColor: '#060609', ambientLight: 0.05, directionalLight: 0.03 } // 50% darker
  },
  rain: {
    sunrise: { skyColor: '#8B8589', ambientLight: 0.15, directionalLight: 0.2 },
    day: { skyColor: '#5C6670', ambientLight: 0.2, directionalLight: 0.3 },
    sunset: { skyColor: '#595761', ambientLight: 0.15, directionalLight: 0.25 },
    dusk: { skyColor: '#363B45', ambientLight: 0.1, directionalLight: 0.15 },
    night: { skyColor: '#050608', ambientLight: 0.03, directionalLight: 0.02 } // 50% darker
  },
  thunderstorm: {
    sunrise: { skyColor: '#4A4A55', ambientLight: 0.1, directionalLight: 0.15 },
    day: { skyColor: '#353B45', ambientLight: 0.1, directionalLight: 0.2 },
    sunset: { skyColor: '#2A2D35', ambientLight: 0.08, directionalLight: 0.12 },
    dusk: { skyColor: '#1C1E24', ambientLight: 0.05, directionalLight: 0.08 },
    night: { skyColor: '#020203', ambientLight: 0.02, directionalLight: 0.01 } // 50% darker
  }
}

export function Environment({ weatherType = 'sunny', timeState }) {
  const grassTexture = useTexture('/textures/grass.png')

  // Configure grass texture repeating
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping
  grassTexture.repeat.set(20, 20)

  const GROUND_SIZE = 200
  const GROUND_HEIGHT = -0.1

  // Get time of day based on hours
  const getTimeOfDay = (hours) => {
    if (hours >= 5 && hours < 8) return 'sunrise'
    if (hours >= 8 && hours < 16) return 'day'
    if (hours >= 16 && hours < 19) return 'sunset'
    if (hours >= 19 && hours < 21) return 'dusk'
    return 'night'
  }

  // Get current config based on weather and time
  const getCurrentConfig = () => {
    const hours = timeState?.date ? new Date(timeState.date).getHours() : 12
    const timeOfDay = getTimeOfDay(hours)
    
    if (weatherConfigs[weatherType]?.[timeOfDay]) {
      return weatherConfigs[weatherType][timeOfDay]
    }
    return weatherConfigs[weatherType].day
  }

  const currentConfig = getCurrentConfig()

  return (
    <group position={[0, 0, 0]}>
      {/* Sky color from weather.json */}
      <color attach="background" args={[currentConfig.skyColor]} />
      
      {/* Scene Fog - color based on sky */}
      <fog 
        attach="fog" 
        args={[
          currentConfig.skyColor,
          1,
          weatherType === 'sunny' ? 200 : 100
        ]} 
      />
      
      {/* Lights based on config */}
      <ambientLight intensity={currentConfig.ambientLight} />
      <directionalLight
        position={[
          Math.cos(timeState?.dayProgress * Math.PI || 0) * 100,
          Math.sin(timeState?.dayProgress * Math.PI || 0) * 100,
          0
        ]}
        intensity={currentConfig.directionalLight}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Ground */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, GROUND_HEIGHT, 0]} 
        receiveShadow
        userData={{ type: 'decoration' }}
      >
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        <meshStandardMaterial 
          map={grassTexture} 
          roughness={1} 
          metalness={0}
        />
      </mesh>

      <Landscape />
      <Weather type={weatherType} />
    </group>
  )
} 