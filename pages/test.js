import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { News } from '../components/News';
import { WeatherControls } from "@/components/WeatherControls";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Plane } from "@react-three/drei";
import { Boy } from "@/components/Boy";
import { Girl } from "@/components/Girl";
import { Suspense } from "react";
import { Phil } from '@/components/Phil'

export default function TestPage() {
    const { account, connected } = useWallet();

    const boyCharacter = {
        name: "John",
        position: [-2, 0, 0],
        animations: {},
    };

    const girlCharacter = {
        name: "Jane",
        position: [2, 0, 0],
        animations: {},
    };

    if (!connected) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl font-bold mb-4">Please Connect Your Wallet</h1>
                    <p className="text-gray-600">
                        Use the wallet extension to connect and test the News component
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">
                    Character Test Page
                </h1>
                
                <div className="bg-white shadow rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Connected Account</h2>
                    <p className="font-mono break-all">{account.address}</p>
                </div>

                {/* 3D Scene */}
                <div className="bg-white shadow rounded-lg overflow-hidden" style={{ height: "600px" }}>
                    <Canvas
                        shadows
                        camera={{ position: [0, 5, 10], fov: 50 }}
                    >
                        <Suspense fallback={null}>
                            {/* Lighting */}
                            <ambientLight intensity={0.5} />
                            <directionalLight
                                position={[10, 10, 5]}
                                intensity={1}
                                castShadow
                                shadow-mapSize-width={2048}
                                shadow-mapSize-height={2048}
                            />

                            {/* White plane */}
                            <Plane 
                                receiveShadow 
                                rotation={[-Math.PI / 2, 0, 0]} 
                                position={[0, 0, 0]} 
                                args={[20, 20]}
                            >
                                <meshStandardMaterial color="white" />
                            </Plane>

                            {/* Characters */}
                            <Boy character={boyCharacter} />
                            <Girl character={girlCharacter} />

                            {/* Controls */}
                            <OrbitControls 
                                enablePan={true}
                                enableZoom={true}
                                enableRotate={true}
                                minDistance={5}
                                maxDistance={20}
                                maxPolarAngle={Math.PI / 2 - 0.1}
                            />

                            <Phil />
                        </Suspense>
                    </Canvas>
                </div>

                <div className="bg-white shadow rounded-lg p-6 mt-8">
                    <h2 className="text-xl font-semibold mb-4">Instructions</h2>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Use mouse to orbit around the scene</li>
                        <li>Scroll to zoom in/out</li>
                        <li>Characters are positioned on a white plane</li>
                    </ul>
                </div>

                <WeatherControls />
            </div>
        </div>
    );
} 