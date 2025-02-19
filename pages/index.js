import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment as EnvironmentMap } from '@react-three/drei'
import { Suspense, useState, useRef, useEffect } from 'react'
import { Boy } from '../components/Boy'
import { Environment } from '../components/Environment'
import { WeatherControls } from '../components/WeatherControls'
import { TimeSimulation } from '../utils/TimeSimulation'
import weatherConfigs from '../config/weather.json'

export default function Home() {
  const [weather, setWeather] = useState('sunny')
  const [timeState, setTimeState] = useState({
    timeOfDay: 'day',
    dayProgress: 0.5,
    hours: 12,
    date: new Date()
  })
  const timeSimRef = useRef(new TimeSimulation(1000))

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeState = timeSimRef.current.update()
      setTimeState(newTimeState)
    }, 16.67)

    return () => clearInterval(interval)
  }, [])

  // Get current config with fallback to day/night if specific time not found
  const getCurrentConfig = () => {
    const timeOfDay = timeState.timeOfDay
    if (weatherConfigs[weather][timeOfDay]) {
      return weatherConfigs[weather][timeOfDay]
    }
    // Fallback to day/night if specific time not found
    return weatherConfigs[weather][timeOfDay === 'night' ? 'night' : 'day']
  }

  const currentConfig = getCurrentConfig()

  return (
    <div className="w-full h-screen relative">
      <Canvas
        shadows
        camera={{
          position: [15, 15, 15],
          fov: 50
        }}
      >
        <color attach="background" args={[currentConfig.skyColor]} />
        
        <Suspense fallback={null}>
          <ambientLight intensity={currentConfig.ambientLight} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={currentConfig.directionalLight}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          <Boy />
          <Environment weatherType={weather} timeState={timeState} />
          
          <OrbitControls
            target={[0, 1, 0]}
            maxPolarAngle={Math.PI / 2.5}
            minPolarAngle={Math.PI / 6}
          />
          
          {weather === 'sunny' && timeState.timeOfDay === 'day' && (
            <EnvironmentMap preset="sunset" />
          )}
        </Suspense>
      </Canvas>

      <WeatherControls
        onWeatherChange={setWeather}
        timeSimRef={timeSimRef}
        currentWeather={weather}
        currentTime={timeState.date}
      />
    </div>
  )
}