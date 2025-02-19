import { claudeMonet } from '../characters/ClaudeMonet';
import { taylorSwift } from '../characters/TaylorSwift';

class GameState {
  constructor() {
    this.characters = new Map();
    this.characterActions = new Map();
    this.characterPositions = new Map();
    this.conversations = [];
    this.isInitialized = false;
  }

  initialize() {
    if (this.isInitialized) return;
    
    // Add both characters
    this.addCharacter('claudeMonet', claudeMonet);
    this.addCharacter('taylorSwift', taylorSwift);
    
    // Initialize both characters
    claudeMonet.initialize();
    taylorSwift.initialize();
    
    this.isInitialized = true;
  }

  addCharacter(id, character) {
    this.characters.set(id, character);
    this.characterActions.set(id, 'WANDER');
  }

  getCharacter(id) {
    return this.characters.get(id);
  }

  updateCharacterAction(id, action) {
    this.characterActions.set(id, action);
  }

  getCharacterAction(id) {
    return this.characterActions.get(id) || 'WANDER';
  }

  startConversation(speaker1, speaker2) {
    this.conversations.push({
      participants: [speaker1, speaker2],
      messages: [],
      startTime: Date.now()
    });
  }

  addConversationMessage(speaker, message) {
    const currentConversation = this.conversations[this.conversations.length - 1];
    if (currentConversation) {
      currentConversation.messages.push({
        speaker,
        message,
        timestamp: Date.now()
      });
    }
  }

  getLatestConversation() {
    return this.conversations[this.conversations.length - 1];
  }

  update(delta) {
    this.characters.forEach(character => {
      if (character.update) {
        character.update(delta);
      }
    });
  }

  updateCharacterPosition(id, position) {
    this.characterPositions.set(id, position);
  }

  getCharacterPosition(id) {
    return this.characterPositions.get(id);
  }

  getClosestCharacter(position, excludeId) {
    let closest = null;
    let minDistance = Infinity;

    this.characterPositions.forEach((pos, id) => {
      if (id !== excludeId) {
        const dx = position.x - pos.x;
        const dz = position.z - pos.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        if (distance < minDistance) {
          minDistance = distance;
          closest = id;
        }
      }
    });

    return closest;
  }
}

// Create a single instance to be used throughout the application
export const gameState = new GameState(); 