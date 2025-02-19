import { getTaylorResponse } from '../utils/taylorSwiftAPI';
import { wanderAround, playAnimation, talkTo } from '../utils/character';
import { gameState } from '../utils/gameState';
import { claudeMonet } from './ClaudeMonet';

export class TaylorSwift {
  constructor() {
    this.name = 'Taylor Swift';
    this.position = [-5, 0, 5];
    this.ref = null;
    this.animations = null;
    this.currentAction = 'WANDER';
    this.actionTimer = null;
    this.currentMovement = null;
  }

  initialize() {
    this.startActionLoop();
    this.executeAction('WANDER');
  }

  startActionLoop() {
    if (this.actionTimer) clearInterval(this.actionTimer);

    this.actionTimer = setInterval(async () => {
      const claudePos = gameState.getCharacterPosition('claudeMonet');
      const myPos = this.ref?.current?.position;
      
      if (!claudePos || !myPos) return;

      const dx = claudePos.x - myPos.x;
      const dz = claudePos.z - myPos.z;
      const distanceToClaude = Math.sqrt(dx * dx + dz * dz);

      const claudeAction = gameState.getCharacterAction('claudeMonet');
      const newAction = await getTaylorResponse(
        this.currentAction,
        claudeAction,
        distanceToClaude
      );

      this.executeAction(newAction);
    }, 10000);
  }

  executeAction(action) {
    if (!this.ref?.current) {
      console.log('No ref for Taylor Swift');
      return;
    }

    this.currentMovement = null;
    this.currentAction = action;
    gameState.updateCharacterAction('taylorSwift', action);
    console.log(`Taylor Swift executing: ${action}`);

    switch (action) {
      case 'TALK_TO_CLAUDE':
        const claude = gameState.getCharacter('claudeMonet');
        if (claude) {
          this.currentMovement = talkTo(
            'taylorSwift',
            'claudeMonet',
            this,
            claude
          );
        }
        break;

      case 'WANDER':
      default:
        this.currentMovement = wanderAround('taylorSwift', {
          playAnimation: (anim) => this.playAnimation(anim),
          speed: 2,
          range: 10
        });
        break;
    }
  }

  update(delta) {
    if (this.currentMovement && this.ref?.current) {
      this.currentMovement.update(this.ref.current, delta);
    }
  }

  playAnimation(animationName) {
    if (this.animations && this.animations[animationName]) {
      // Stop all current animations
      Object.values(this.animations).forEach(anim => anim.stop());
      
      // Play the new animation
      this.animations[animationName].reset().fadeIn(0.5).play();
    } else {
      console.log('Animation not found:', animationName);
    }
  }

  cleanup() {
    if (this.actionTimer) {
      clearInterval(this.actionTimer);
    }
  }
}

export const taylorSwift = new TaylorSwift(); 