import * as THREE from 'three'
import mapData from '../data/map.json'

// Cache for storing current character positions
const characterPositions = new Map()
const MOVEMENT_SPEED = 0.1
const COLLISION_THRESHOLD = 0.5

// Helper to get closest point from current position to target
const getClosestPoint = (current, target) => {
  const dx = target.x - current.x
  const dz = target.z - current.z
  const distance = Math.sqrt(dx * dx + dz * dz)
  return {
    direction: new THREE.Vector3(dx / distance, 0, dz / distance),
    distance
  }
}

// Helper function to check wall collisions
const checkWallCollision = (newPosition) => {
  for (const direction in mapData.walls) {
    const walls = mapData.walls[direction]
    for (const wall of walls) {
      const start = new THREE.Vector2(wall.start.x, wall.start.z)
      const end = new THREE.Vector2(wall.end.x, wall.end.z)
      
      // Calculate distance from point to line segment
      const line = end.clone().sub(start)
      const len = line.length()
      const lineDirection = line.clone().normalize()
      
      const point = new THREE.Vector2(newPosition.x, newPosition.z)
      const pointToStart = point.clone().sub(start)
      
      // Project point onto line
      const projection = pointToStart.dot(lineDirection)
      
      if (projection >= 0 && projection <= len) {
        const projectedPoint = start.clone().add(lineDirection.multiplyScalar(projection))
        const distance = point.distanceTo(projectedPoint)
        
        if (distance < COLLISION_THRESHOLD) {
          return true
        }
      }
    }
  }
  return false
}

// Get all available checkpoints from map data
export const getCheckpoints = () => {
  const checkpoints = {
    // Rooms and furniture
    ...Object.entries(mapData.rooms).reduce((acc, [roomKey, room]) => {
      Object.entries(room.furniture).forEach(([furnitureKey, position]) => {
        acc[`${roomKey}_${furnitureKey}`] = position
      })
      return acc
    }, {}),
    
    // Talking areas
    ...mapData.commonArea.talkingAreas.reduce((acc, area) => {
      acc[area.id] = { x: area.x, z: area.z }
      return acc
    }, {})
  }
  
  return checkpoints
}

// Check and store character position
export const checkPosition = (character, position) => {
  if (!position) return null
  
  const currentPos = {
    x: position.x,
    z: position.z
  }
  
  characterPositions.set(character, currentPos)
  
  // Find nearest checkpoint
  const checkpoints = getCheckpoints()
  let nearestPoint = null
  let shortestDistance = Infinity
  
  Object.entries(checkpoints).forEach(([id, point]) => {
    const dx = point.x - currentPos.x
    const dz = point.z - currentPos.z
    const distance = Math.sqrt(dx * dx + dz * dz)
    
    if (distance < shortestDistance) {
      shortestDistance = distance
      nearestPoint = { id, point, distance }
    }
  })
  
  console.log(`Character ${character} position:`, currentPos)
  return {
    position: currentPos,
    nearest: nearestPoint
  }
}

// Go to specified checkpoint
export const goto = (character, checkpointId, controller) => {
  const checkpoints = getCheckpoints()
  const target = checkpoints[checkpointId]
  
  if (!target) {
    console.error(`Checkpoint ${checkpointId} not found`)
    return null
  }
  
  let isRunning = false
  let lastPosition = null
  let stationaryTime = 0
  
  // Start running animation
  if (controller && controller.playAnimation) {
    controller.playAnimation('Run')
    isRunning = true
  }
  
  return {
    update: (model, delta) => {
      if (!model) return false
      
      // Calculate exact distance to target
      const dx = model.position.x - target.x
      const dz = model.position.z - target.z
      const distance = Math.sqrt(dx * dx + dz * dz)
      
      // If close enough to target (within 0.1 units), stop
      if (distance < 0.1) {
        // Stop at exact target position
        model.position.x = target.x
        model.position.z = target.z
        
        // Update cache
        characterPositions.set(character, {
          x: target.x,
          z: target.z
        })
        
        return true // This will trigger the animation change in Boy.js
      }
      
      // Continue movement
      const direction = new THREE.Vector3(
        target.x - model.position.x,
        0,
        target.z - model.position.z
      ).normalize()
      
      const moveAmount = MOVEMENT_SPEED * delta * 60
      const movement = direction.multiplyScalar(moveAmount)
      
      // Calculate new position
      const newPosition = model.position.clone().add(movement)
      
      // Check for collisions
      if (!checkWallCollision(newPosition)) {
        // Update position
        model.position.copy(newPosition)
        
        // Update rotation to face movement direction
        const targetRotation = Math.atan2(direction.x, direction.z)
        model.rotation.y = targetRotation
        
        // Update character position in cache
        characterPositions.set(character, {
          x: newPosition.x,
          z: newPosition.z
        })
      }
      
      return false
    }
  }
}

// Animation control function
export const playAnimation = (character, animationName, controller) => {
  if (!controller || !controller.playAnimation) {
    console.error('Animation controller not found')
    return null
  }

  // List of available animations
  const validAnimations = [
    'Run',
    'Dancing',
    'Happy',
    'Sad',
    'Singing',
    'Talking',
    'Arguing'
  ]

  if (!validAnimations.includes(animationName)) {
    console.error(`Invalid animation: ${animationName}`)
    return null
  }

  controller.playAnimation(animationName)
  return true
}

// Export map data for reference
export const mapInfo = {
  rooms: mapData.rooms,
  commonArea: mapData.commonArea,
  boundaries: mapData.metadata.boundaries
}

// Helper to get random talking area
const getRandomTalkingArea = () => {
  const areas = mapData.commonArea.talkingAreas
  return areas[Math.floor(Math.random() * areas.length)]
}

// Get random checkpoint for wandering
const getRandomCheckpoint = (currentCheckpoint) => {
  const checkpoints = getCheckpoints()
  const checkpointKeys = Object.keys(checkpoints)
  
  // Separate beds and meeting areas
  const beds = checkpointKeys.filter(key => key.includes('bed'))
  const meetingAreas = checkpointKeys.filter(key => key.includes('area'))
  
  // If current checkpoint is a bed, go to a meeting area
  if (currentCheckpoint && currentCheckpoint.includes('bed')) {
    return meetingAreas[Math.floor(Math.random() * meetingAreas.length)]
  }
  // If current checkpoint is a meeting area, go to a bed
  else if (currentCheckpoint && currentCheckpoint.includes('area')) {
    return beds[Math.floor(Math.random() * beds.length)]
  }
  // If no current checkpoint, start with a random bed
  else {
    return beds[Math.floor(Math.random() * beds.length)]
  }
}

// Wander around function
export const wanderAround = (character, controller) => {
  let currentDestination = null
  let moveTimer = 0
  const WAIT_TIME = 3000 // 3 seconds between movements
  let currentCheckpoint = null

  const movement = {
    update: (model, delta) => {
      if (!model) return false

      // If waiting between movements
      if (moveTimer > 0) {
        moveTimer -= delta * 1000
        return false
      }

      // If no current destination or reached destination, pick new one
      if (!currentDestination) {
        const newCheckpoint = getRandomCheckpoint(currentCheckpoint)
        const newDestination = goto(character, newCheckpoint, controller)
        if (newDestination) {
          currentDestination = newDestination
          currentCheckpoint = newCheckpoint
        }
        return false
      }

      // Update current movement
      const reachedDestination = currentDestination.update(model, delta)
      
      if (reachedDestination) {
        // Reset destination and start timer
        currentDestination = null
        moveTimer = WAIT_TIME
        // Play idle animation
        if (controller?.playAnimation) {
          controller.playAnimation('Happy')
        }
      }

      return false
    }
  }

  return movement
}

// Talk to another character
export const talkTo = (character1, character2, controller1, controller2) => {
  const talkingArea = getRandomTalkingArea()
  let phase = 'moving'
  let char1Movement = null
  let char2Movement = null
  
  // Create offset positions for the characters (1 unit apart)
  const OFFSET_DISTANCE = 1.0
  const char1Target = {
    x: talkingArea.x - OFFSET_DISTANCE/2,
    z: talkingArea.z
  }
  const char2Target = {
    x: talkingArea.x + OFFSET_DISTANCE/2,
    z: talkingArea.z
  }

  const interaction = {
    update: (model1, model2, delta) => {
      if (!model1 || !model2) return false

      switch (phase) {
        case 'moving':
          // Initialize movements if not already done
          if (!char1Movement) {
            const movement = {
              update: (model, delta) => {
                if (!model) return false
                
                const dx = model.position.x - char1Target.x
                const dz = model.position.z - char1Target.z
                const distance = Math.sqrt(dx * dx + dz * dz)
                
                if (distance < 0.1) {
                  model.position.x = char1Target.x
                  model.position.z = char1Target.z
                  return true
                }
                
                const direction = new THREE.Vector3(
                  char1Target.x - model.position.x,
                  0,
                  char1Target.z - model.position.z
                ).normalize()
                
                const moveAmount = 0.1 * delta * 60
                const movement = direction.multiplyScalar(moveAmount)
                const newPosition = model.position.clone().add(movement)
                
                if (!checkWallCollision(newPosition)) {
                  model.position.copy(newPosition)
                  model.rotation.y = Math.atan2(direction.x, direction.z)
                }
                
                return false
              }
            }
            controller1?.playAnimation('Run')
            char1Movement = movement
          }
          
          if (!char2Movement) {
            const movement = {
              update: (model, delta) => {
                if (!model) return false
                
                const dx = model.position.x - char2Target.x
                const dz = model.position.z - char2Target.z
                const distance = Math.sqrt(dx * dx + dz * dz)
                
                if (distance < 0.1) {
                  model.position.x = char2Target.x
                  model.position.z = char2Target.z
                  return true
                }
                
                const direction = new THREE.Vector3(
                  char2Target.x - model.position.x,
                  0,
                  char2Target.z - model.position.z
                ).normalize()
                
                const moveAmount = 0.1 * delta * 60
                const movement = direction.multiplyScalar(moveAmount)
                const newPosition = model.position.clone().add(movement)
                
                if (!checkWallCollision(newPosition)) {
                  model.position.copy(newPosition)
                  model.rotation.y = Math.atan2(direction.x, direction.z)
                }
                
                return false
              }
            }
            controller2?.playAnimation('Run')
            char2Movement = movement
          }

          // Make sure both movements were initialized
          if (!char1Movement || !char2Movement) return false

          // Update movements
          const char1Done = char1Movement.update(model1, delta)
          const char2Done = char2Movement.update(model2, delta)

          // If both characters reached their positions
          if (char1Done && char2Done) {
            phase = 'talking'
            
            // Face each other
            const angle = Math.atan2(
              model2.position.x - model1.position.x,
              model2.position.z - model1.position.z
            )
            model1.rotation.y = angle
            model2.rotation.y = angle + Math.PI

            // Stop running animations first
            controller1?.playAnimation('Talking')
            controller2?.playAnimation('Talking')
          }
          break

        case 'talking':
          // Ensure both characters are in talking animation
          controller1?.playAnimation('Talking')
          controller2?.playAnimation('Talking')
          return true
      }

      return false
    }
  }

  return interaction
} 