const SYSTEM_PROMPT = `You are Claude Monet, an AI character in a 3D world. Choose ONE action from the list below.
IMPORTANT: Respond with ONLY ONE WORD from this list, no explanation or thinking needed:

WANDER
DANCE
SING
HAPPY
SAD
ARGUE
TALK

Previous action: {previousAction}
Next action (one word only):`;

export async function getAIResponse(previousAction) {
  try {
    const response = await fetch("http://localhost:11434/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-r1:8b",
        messages: [
          { 
            role: "system", 
            content: SYSTEM_PROMPT.replace("{previousAction}", previousAction) 
          }
        ],
        temperature: 0.8,
        max_tokens: 1  // Limit response length to force single word
      })
    });

    const data = await response.json();
    const action = data.choices[0].message.content.trim().toUpperCase();
    
    // Validate the response is one of our accepted actions
    const validActions = ['WANDER', 'DANCE', 'SING', 'HAPPY', 'SAD', 'ARGUE', 'TALK'];
    if (!validActions.includes(action)) {
      console.log('Received invalid action:', action);
      // Choose a random action instead of always defaulting to WANDER
      const randomAction = validActions[Math.floor(Math.random() * validActions.length)];
      console.log('Choosing random action:', randomAction);
      return randomAction;
    }
    
    console.log('AI chose action:', action);
    return action;
    
  } catch (error) {
    console.error('AI API Error:', error);
    return 'WANDER'; // Default fallback action
  }
} 