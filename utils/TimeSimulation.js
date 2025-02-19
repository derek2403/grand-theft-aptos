export class TimeSimulation {
    constructor(speedMultiplier = 1000) {
      this.speedMultiplier = speedMultiplier
      this.currentTime = new Date()
    }
  
    update() {
      // Add milliseconds based on speed multiplier
      this.currentTime = new Date(this.currentTime.getTime() + (16.67 * this.speedMultiplier))
      
      // Get hour with decimal for smooth transitions (e.g., 14.5 for 2:30 PM)
      const hours = this.currentTime.getHours() + 
                   this.currentTime.getMinutes() / 60 + 
                   this.currentTime.getSeconds() / 3600
  
      // Calculate sun position (0-1)
      const dayProgress = (hours - 6) / 12 // Normalized to 0-1 between 6AM and 6PM
  
      // Determine time of day
      let timeOfDay
      if (hours >= 5 && hours < 7) timeOfDay = 'sunrise'
      else if (hours >= 7 && hours < 17) timeOfDay = 'day'
      else if (hours >= 17 && hours < 19) timeOfDay = 'sunset'
      else if (hours >= 19 && hours < 20) timeOfDay = 'dusk'
      else timeOfDay = 'night'
  
      return {
        hours,
        timeOfDay,
        dayProgress: Math.max(0, Math.min(1, dayProgress)), // Clamp between 0-1
        date: this.currentTime
      }
    }
  } 