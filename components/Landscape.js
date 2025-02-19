import { Tree } from './Tree'
import { Road } from './Road'
import { HOUSE_CONFIG } from './House'

const { UNIT } = HOUSE_CONFIG

export function Landscape() {
  // Extended tree positions around the house and roads
  const treePositions = [
    // Original front yard trees
    [-UNIT * 10, 0, -UNIT * 8],
    [-UNIT * 10, 0, -UNIT * 6],
    [-UNIT * 12, 0, -UNIT * 7],
    
    // Additional front yard trees
    [-UNIT * 11, 0, -UNIT * 9],
    [-UNIT * 9, 0, -UNIT * 7],
    [-UNIT * 13, 0, -UNIT * 8],
    
    // Original back yard trees
    [-UNIT * 10, 0, UNIT * 8],
    [-UNIT * 12, 0, UNIT * 7],
    [-UNIT * 9, 0, UNIT * 6],
    
    // Additional back yard trees
    [-UNIT * 11, 0, UNIT * 9],
    [-UNIT * 13, 0, UNIT * 8],
    
    // Right side trees - extended
    [UNIT * 8, 0, -UNIT * 8],
    [UNIT * 8, 0, -UNIT * 4],
    [UNIT * 8, 0, 0],
    [UNIT * 8, 0, UNIT * 4],
    [UNIT * 8, 0, UNIT * 8],
    [UNIT * 9, 0, -UNIT * 6],
    [UNIT * 9, 0, -UNIT * 2],
    [UNIT * 9, 0, UNIT * 2],
    [UNIT * 9, 0, UNIT * 6],
    
    // Far right trees - extended
    [UNIT * 12, 0, -UNIT * 6],
    [UNIT * 12, 0, -UNIT * 2],
    [UNIT * 12, 0, UNIT * 2],
    [UNIT * 12, 0, UNIT * 6],
    [UNIT * 13, 0, -UNIT * 4],
    [UNIT * 13, 0, 0],
    [UNIT * 13, 0, UNIT * 4],
    
    // Road side trees - extended
    [-UNIT * 14, 0, -UNIT * 12],
    [-UNIT * 14, 0, -UNIT * 8],
    [-UNIT * 14, 0, -UNIT * 4],
    [-UNIT * 14, 0, 0],
    [-UNIT * 14, 0, UNIT * 4],
    [-UNIT * 14, 0, UNIT * 8],
    [-UNIT * 14, 0, UNIT * 12],
    [-UNIT * 15, 0, -UNIT * 10],
    [-UNIT * 15, 0, -UNIT * 6],
    [-UNIT * 15, 0, -UNIT * 2],
    [-UNIT * 15, 0, UNIT * 2],
    [-UNIT * 15, 0, UNIT * 6],
    [-UNIT * 15, 0, UNIT * 10],
    
    // Corner clusters - extended
    [-UNIT * 10, 0, -UNIT * 12],
    [-UNIT * 12, 0, -UNIT * 14],
    [-UNIT * 11, 0, -UNIT * 13],
    [UNIT * 10, 0, -UNIT * 12],
    [UNIT * 12, 0, -UNIT * 14],
    [UNIT * 11, 0, -UNIT * 13],
    [UNIT * 10, 0, UNIT * 12],
    [UNIT * 12, 0, UNIT * 14],
    [UNIT * 11, 0, UNIT * 13],
    
    // Random forest effect - extended
    [UNIT * 16, 0, -UNIT * 8],
    [UNIT * 15, 0, -UNIT * 4],
    [UNIT * 16, 0, 0],
    [UNIT * 15, 0, UNIT * 4],
    [UNIT * 16, 0, UNIT * 8],
    [UNIT * 17, 0, -UNIT * 6],
    [UNIT * 17, 0, -UNIT * 2],
    [UNIT * 17, 0, UNIT * 2],
    [UNIT * 17, 0, UNIT * 6],
    
    // New dense forest areas
    [UNIT * 14, 0, -UNIT * 10],
    [UNIT * 14, 0, UNIT * 10],
    [-UNIT * 16, 0, -UNIT * 14],
    [-UNIT * 16, 0, UNIT * 14],
    
    // Additional scattered trees
    [-UNIT * 13, 0, -UNIT * 11],
    [-UNIT * 13, 0, UNIT * 11],
    [UNIT * 11, 0, -UNIT * 9],
    [UNIT * 11, 0, UNIT * 9],
  ]

  return (
    <group>
      <Road />
      {treePositions.map((position, index) => (
        <Tree 
          key={index} 
          position={position} 
          // More varied scale for natural look
          scale={[
            1.2 + Math.random() * 0.8,  // Increased random variation
            1.3 + Math.random() * 0.7,  // Taller trees possible
            1.2 + Math.random() * 0.8
          ]}
        />
      ))}
    </group>
  )
} 