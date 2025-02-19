import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { User } from '../components/User'
import { useState, Suspense, useRef } from 'react'
import { WalletSelector } from '../components/connectwallet/WalletSelector'
import { useWallet } from "@aptos-labs/wallet-adapter-react"

export default function TestPage() {
  const [username, setUsername] = useState('')
  const [gender, setGender] = useState('men')
  const [isCreated, setIsCreated] = useState(false)
  const { account } = useWallet()
  const userRef = useRef()

  const handleCreateUser = (e) => {
    e.preventDefault()
    if (!username.trim()) {
      alert('Please enter a username')
      return
    }
    if (!account?.address) {
      alert('Please connect your wallet first')
      return
    }
    setIsCreated(true)
  }

  if (!isCreated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="fixed top-4 right-4 z-50">
          <WalletSelector />
        </div>
        <form 
          onSubmit={handleCreateUser}
          className="bg-gray-800 p-8 rounded-lg shadow-xl w-96"
        >
          <h2 className="text-2xl text-white mb-6 text-center">Create Your Character</h2>
          
          <div className="mb-4">
            <label className="block text-white mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
              placeholder="Enter username"
            />
          </div>

          <div className="mb-6">
            <label className="block text-white mb-2">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
            >
              <option value="men">Male</option>
              <option value="women">Female</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full p-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
          >
            Create Character
          </button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div className="fixed top-4 right-4 z-50">
        <WalletSelector />
      </div>

      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 10]}
          intensity={1}
          castShadow
        />
        
        {/* Ground plane */}
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#303030" />
        </mesh>

        {/* User character */}
        <Suspense fallback={null}>
          <User 
            ref={userRef}
            character={{
              name: username,
              gender: gender
            }}
          />
        </Suspense>

        {/* Camera controls */}
        <OrbitControls />
      </Canvas>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        Right-click anywhere to move the character
      </div>

      {/* Character Info with Wallet Address */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '5px',
        marginTop: '60px'
      }}>
        <p>Username: {username}</p>
        <p>Gender: {gender === 'men' ? 'Male' : 'Female'}</p>
        <p className="truncate">
          Wallet: {account?.address ? 
            `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : 
            'Not connected'}
        </p>
      </div>
    </div>
  )
} 