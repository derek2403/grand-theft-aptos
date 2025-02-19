import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import { Boy } from '../components/Boy'
import { Girl } from '../components/Girl'

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#303030" />
    </mesh>
  )
}

export default function Home() {
  return (
    <div className="w-full h-screen">
      <Canvas
        shadows
        camera={{
          position: [20, 20, 20], // Isometric-like position
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        style={{ background: '#87CEEB' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          <Boy />
          {/* <Girl /> */}
          
          <Ground />
          <OrbitControls
            target={[0, 1, 0]}
            maxPolarAngle={Math.PI / 3} // Limit camera angle
            minPolarAngle={Math.PI / 6} // Minimum camera angle
            maxDistance={30}
            minDistance={10}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}