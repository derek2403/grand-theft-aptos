import { useEffect, useRef, useState } from 'react'
import { useTexture, useAnimations } from '@react-three/drei'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import * as THREE from 'three'
import { useCharacterController } from '../utils/CharacterController'

export function Girl() {
  const [fbx, setFbx] = useState(null)
  const [animations, setAnimations] = useState({})
  const texture = useTexture('/women/shaded.png')
  const modelRef = useRef()

  useEffect(() => {
    const loader = new FBXLoader()
    const animationFiles = {
      Stand: '/animations/Stand.fbx',
      Run: '/animations/Run.fbx',
      Left: '/animations/Left.fbx',
      Right: '/animations/Right.fbx'
    }

    // Load character model
    loader.load('/women/Women.fbx', (fbxModel) => {
      fbxModel.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({ map: texture })
        }
      })
      setFbx(fbxModel)

      // Load animations
      Promise.all(
        Object.entries(animationFiles).map(([name, file]) =>
          new Promise((resolve) => {
            loader.load(file, (animFBX) => {
              resolve({ name, animation: animFBX.animations[0] })
            })
          })
        )
      ).then((loadedAnimations) => {
        const animMap = {}
        loadedAnimations.forEach(({ name, animation }) => {
          animMap[name] = animation
        })
        setAnimations(animMap)
      })
    })
  }, [texture])

  const { actions } = useAnimations(Object.values(animations), modelRef)
  useCharacterController(actions, modelRef)

  if (!fbx) return null
  return <primitive ref={modelRef} object={fbx} scale={0.01} position={[0, 0, 0]} />
} 