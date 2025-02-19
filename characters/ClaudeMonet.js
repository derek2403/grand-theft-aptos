import { getAIResponse } from '../utils/deepseekAPI';
import { wanderAround, playAnimation, talkTo } from '../utils/character';

export class ClaudeMonet {
  constructor() {
    this.name = 'Claude Monet';
    this.position = [5, 0, 5]; // Starting position
    this.ref = null;
    this.animations = null;
    this.currentAction = 'WANDER';
    this.lastActionTime = 0;
    this.actionInterval = 10000; // 10 seconds
    this.currentMovement = null;
    this.actionTimer = null;
  }

  initialize() {
    // Start the action loop
    this.startActionLoop();
    // Start with wandering
    this.executeAction('WANDER');
  }

  startActionLoop() {
    // Clear any existing timer
    if (this.actionTimer) {
      clearInterval(this.actionTimer);
    }

    // Set up the interval to query for new actions
    this.actionTimer = setInterval(async () => {
      const newAction = await getAIResponse(this.currentAction);
      this.executeAction(newAction);
    }, this.actionInterval);
  }

  executeAction(action) {
    if (!this.ref?.current || !this.animations) return;

    // Clear current movement
    this.currentMovement = null;
    this.currentAction = action;

    console.log(`Claude Monet executing: ${action}`);

    switch (action) {
      case 'WANDER':
        this.currentMovement = wanderAround(this.name, {
          playAnimation: (anim) => this.playAnimation(anim)
        });
        break;

      case 'DANCE':
        this.playAnimation('Dancing');
        break;

      case 'SING':
        this.playAnimation('Singing');
        break;

      case 'HAPPY':
        this.playAnimation('Happy');
        break;

      case 'SAD':
        this.playAnimation('Sad');
        break;

      case 'ARGUE':
        this.playAnimation('Arguing');
        break;

      case 'TALK':
        this.playAnimation('Talking');
        break;

      default:
        // Default to wandering if unknown action
        this.currentMovement = wanderAround(this.name, {
          playAnimation: (anim) => this.playAnimation(anim)
        });
        break;
    }
  }

  update(delta) {
    if (this.currentMovement) {
      this.currentMovement.update(this.ref.current, delta);
    }
  }

  playAnimation(animationName) {
    if (this.animations && this.animations[animationName]) {
      // Stop all current animations
      Object.values(this.animations).forEach(anim => anim.stop());
      
      // Play the new animation
      this.animations[animationName].reset().fadeIn(0.5).play();
    }
  }

  cleanup() {
    // Clear the action timer when cleaning up
    if (this.actionTimer) {
      clearInterval(this.actionTimer);
    }
  }
}

// Create a single instance to be used throughout the application
export const claudeMonet = new ClaudeMonet(); 