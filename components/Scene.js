import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment as EnvironmentMap } from '@react-three/drei'
import { Suspense, useEffect, useState } from 'react'
import { Environment } from './Environment'
import { Boy } from './Boy'

// Weather-specific sky colors
const SKY_COLORS = {
  sunny: '#87CEEB',    // Light blue
  cloudy: '#C4C4C4',   // Gray
  rain: '#4A4A4A',     // Dark gray
  thunderstorm: '#2A2A2A'  // Very dark gray
}

const Scene = () => {
  const [weather, setWeather] = useState('sunny')
  const CAMERA_POSITION = [30, 20, 30]
  const CAMERA_FOV = 45
  const CAMERA_TARGET = [0, 0, 0]

  // Weather control handler
  useEffect(() => {
    const handleWeatherChange = (event) => {
      if (event.key >= '1' && event.key <= '4') {
        const weatherTypes = ['sunny', 'cloudy', 'rain', 'thunderstorm']
        setWeather(weatherTypes[parseInt(event.key) - 1])
      }
    }

    window.addEventListener('keypress', handleWeatherChange)
    return () => window.removeEventListener('keypress', handleWeatherChange)
  }, [])

  return (
    <Canvas 
      camera={{ 
        position: CAMERA_POSITION,
        fov: CAMERA_FOV,
        // Lock the camera by setting up initial target
        lookAt: CAMERA_TARGET
      }}
      shadows
    >
      {/* Dynamic sky color based on weather */}
      <color attach="background" args={[SKY_COLORS[weather]]} />
      
      <Suspense fallback={null}>
        <Environment weatherType={weather} />
        <Boy />
        
        {/* Adjust lighting based on weather */}
        <ambientLight 
          intensity={weather === 'sunny' ? 0.5 : 
                    weather === 'cloudy' ? 0.3 : 
                    weather === 'rain' ? 0.2 : 0.1} 
        />
        
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={weather === 'sunny' ? 1 : 
                    weather === 'cloudy' ? 0.5 : 
                    weather === 'rain' ? 0.3 : 0.2} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Remove EnvironmentMap when it's not sunny */}
        {weather === 'sunny' && <EnvironmentMap preset="sunset" />}
      </Suspense>
    </Canvas>
  )
}

export default Scene 