import { useEffect, useState } from 'react';
import { gameState } from '../utils/gameState';

export function ConversationDisplay() {
  const [conversation, setConversation] = useState(null);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      const latest = gameState.getLatestConversation();
      if (latest) {
        setConversation(latest);
      }
    }, 1000);

    return () => clearInterval(updateInterval);
  }, []);

  if (!conversation) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/50 text-white p-4 rounded-lg max-w-md">
      <h3 className="font-bold mb-2">
        {conversation.participants.join(' & ')}
      </h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {conversation.messages.map((msg, i) => (
          <div key={i} className="flex gap-2">
            <span className="font-bold">{msg.speaker}:</span>
            <span>{msg.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 