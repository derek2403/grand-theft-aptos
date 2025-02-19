import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment as EnvironmentMap } from '@react-three/drei'
import { Suspense, useState, useRef, useEffect } from 'react'
import { Boy } from '../components/Boy'
import { Girl } from '../components/Girl'
import { Environment } from '../components/Environment'
import { CreateCharacterModal } from '../components/CreateCharacterModal'
import { TimeSimulation } from '../utils/TimeSimulation'
import weatherConfigs from '../config/weather.json'
import { CharacterControlTest } from '../components/CharacterControlTest'
import npcData from '../data/NPC.json'


export default function Home() {
  const [weather, setWeather] = useState('sunny')
  const [characters, setCharacters] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCharactersList, setShowCharactersList] = useState(false)
  const [characterForm, setCharacterForm] = useState({
    name: '',
    occupation: '',
    mbti: '',
    age: '',
    hobby: '',
    gender: '',
    characteristics: ['', '', '', '', ''],
    goals: ['', '', ''],
    needs: {
      hunger: '',
      energy: '',
      social: '',
      happiness: ''
    }
  })
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

  // Load characters from NPC.json on initial render
  useEffect(() => {
    setCharacters(npcData.characters)
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

  const handleCreateCharacter = async (formData) => {
    const newCharacter = {
      ...formData,
      id: Date.now(),
      position: [Math.random() * 10 - 5, 0, Math.random() * 10 - 5]
    }

    // Update state
    setCharacters(prev => [...prev, newCharacter])

    // Save to NPC.json
    try {
      const response = await fetch('/api/saveCharacter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCharacter),
      })

      if (!response.ok) {
        throw new Error('Failed to save character')
      }
    } catch (error) {
      console.error('Error saving character:', error)
      // Optionally handle the error in the UI
    }

    setShowCreateModal(false)
    setCharacterForm({
      name: '',
      occupation: '',
      mbti: '',
      age: '',
      hobby: '',
      gender: '',
      characteristics: ['', '', '', '', ''],
      goals: ['', '', ''],
      needs: {
        hunger: 50,
        energy: 70,
        social: 30,
        happiness: 80
      }
    })
  }

  const renderCharacter = (character) => {
    const gender = character.gender.toLowerCase()
    if (gender === 'male') {
      return <Boy key={character.id} character={character} />
    } else if (gender === 'female') {
      return <Girl key={character.id} character={character} />
    }
    return null
  }

  return (
    <div className="w-full h-screen relative">
      <Canvas
        shadows
        camera={{
          position: [20, 200, 20],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
      >
        <color attach="background" args={['#87CEEB']} /> {/* Sunny sky blue */}
        
        <Suspense fallback={null}>
          <ambientLight intensity={1} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1.5}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          {characters.map(character => renderCharacter(character))}
          <Environment weatherType="sunny" timeState={{ timeOfDay: 'day', dayProgress: 0.5 }} />
          
          <OrbitControls
            target={[0, 0, 0]}
            maxPolarAngle={Math.PI / 2.5}
            minPolarAngle={Math.PI / 3}
            maxAzimuthAngle={Math.PI / 2}
            minAzimuthAngle={-Math.PI / 2}
            enableZoom={true}
            enablePan={true}
            zoomSpeed={0.5}
            minDistance={10}
            maxDistance={50}
          />
          
          <EnvironmentMap preset="sunset" />
        </Suspense>
      </Canvas>

      {/* Top Bar Controls */}
      <div className="absolute top-4 left-4 flex gap-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Create Character
        </button>
      </div>

      {/* Modals */}
      <CreateCharacterModal
        showModal={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <CharacterControlTest characters={characters} />
    </div>
  )
}