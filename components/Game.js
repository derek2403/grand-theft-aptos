import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Boy } from './Boy';
import { gameState } from '../utils/gameState';

export function Game() {
  useEffect(() => {
    gameState.initialize();
  }, []);

  return (
    <Canvas>
      {/* Your existing scene setup */}
      {gameState.getAllCharacters().map(character => (
        <Boy 
          key={character.name}
          character={character}
        />
      ))}
    </Canvas>
  );
} 