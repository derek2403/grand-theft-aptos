const SYSTEM_PROMPT = `You are Taylor Swift in a 3D world with Claude Monet. Choose ONE action:

WANDER: explore the environment
TALK_TO_CLAUDE: approach and talk to Claude Monet

Previous action: {previousAction}
Claude's action: {claudeAction}
Distance to Claude: {distanceToClaude}m

Respond with exactly ONE word: WANDER or TALK_TO_CLAUDE`;

export async function getTaylorResponse(previousAction, claudeAction, distanceToClaude) {
  try {
    const response = await fetch("http://localhost:11434/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-r1:8b",
        messages: [
          { 
            role: "system", 
            content: SYSTEM_PROMPT
              .replace("{previousAction}", previousAction)
              .replace("{claudeAction}", claudeAction)
              .replace("{distanceToClaude}", Math.round(distanceToClaude))
          }
        ],
        temperature: 0.7,
        max_tokens: 1
      })
    });

    const data = await response.json();
    const action = data.choices[0].message.content.trim().toUpperCase();
    
    return ['WANDER', 'TALK_TO_CLAUDE'].includes(action) ? action : 'WANDER';
  } catch (error) {
    console.error('Taylor API Error:', error);
    return 'WANDER';
  }
} 