import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment as EnvironmentMap } from '@react-three/drei'
import { Suspense, useState, useRef, useEffect } from 'react'
import { Boy } from '../components/Boy'
import { Girl } from '../components/Girl'
import { Environment } from '../components/Environment'
import { CreateCharacterModal } from '../components/CreateCharacterModal'
import { TimeSimulation } from '../utils/TimeSimulation'
import { User } from '../components/User'
import npcData from '../data/NPC.json'
import { NPCController } from '../components/NPC'
import { WeatherControls } from '../components/WeatherControls'
import { Phil } from '@/components/Phil'
import { FaUserPlus, FaRobot } from 'react-icons/fa'


export default function Home() {
  const [weather, setWeather] = useState('sunny')
  const [characters, setCharacters] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCharactersList, setShowCharactersList] = useState(false)
  const [timeState, setTimeState] = useState({
    timeOfDay: 'day',
    dayProgress: 0.5,
    hours: 12,
    date: new Date()
  })
  const timeSimRef = useRef(new TimeSimulation(1000))
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [playerCharacter, setPlayerCharacter] = useState(null)
  const userRef = useRef()

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

  const handleJoinGame = (formData) => {
    setPlayerCharacter({
      name: formData.username,
      gender: formData.gender,
      id: 'player',
      position: [0, 0, 0]
    })
    setShowJoinModal(false)
  }

  return (
    <div className="w-full h-screen relative">
      <Canvas
        shadows
        camera={{
          position: [20, 20, 20],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
      >
        <Suspense fallback={null}>
          <Environment 
            weatherType={weather} 
            timeState={timeState}
          />
          
          {characters.map(character => renderCharacter(character))}

          {playerCharacter && (
            <User 
              ref={userRef}
              character={playerCharacter}
            />
          )}
          
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
          <Phil/>
      </Canvas>

      <WeatherControls
        onWeatherChange={setWeather}
        timeSimRef={timeSimRef}
        currentWeather={weather}
        currentTime={timeState.date}
      />

      <NPCController />
      

      {/* Updated Top Bar Controls with vertical layout */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {!playerCharacter && (
          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-white text-black p-3 rounded-full hover:bg-gray-100 flex items-center gap-2 transition-colors duration-200 shadow-lg"
          >
            <FaUserPlus className="text-xl text-black" />
            <span>Join Game</span>
          </button>
        )}
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-white text-black p-3 rounded-full hover:bg-gray-100 flex items-center gap-2 transition-colors duration-200 shadow-lg"
        >
          <FaRobot className="text-xl text-black" />
          <span>Create NPC</span>
        </button>
      </div>

      {/* Modals */}
      {showJoinModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowJoinModal(false)} />
          <div className="bg-white p-6 rounded-lg shadow-xl relative z-10">
            <h2 className="text-2xl mb-4">Join Game</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleJoinGame({
                username: e.target.username.value,
                gender: e.target.gender.value
              })
            }}>
              <input
                name="username"
                placeholder="Enter username"
                className="block w-full mb-4 p-2 border rounded"
                required
              />
              <select
                name="gender"
                className="block w-full mb-4 p-2 border rounded"
                required
              >
                <option value="men">Male</option>
                <option value="women">Female</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Join
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CreateCharacterModal
        showModal={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCharacter}
      />

    </div>
  )
}