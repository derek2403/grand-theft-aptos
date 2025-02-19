import { useChat } from 'ai/react';
import { ChatMessageBubble } from './ChatMessageBubble';
import { IntermediateStep } from './IntermediateStep';
import { useRef, useState } from 'react';

export function ChatWindow({ 
  endpoint, 
  emptyStateComponent,
  placeholder,
  titleText,
  emoji 
}) {
  const messageContainerRef = useRef(null);
  const [showIntermediateSteps, setShowIntermediateSteps] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: endpoint,
    onResponse: (response) => {
      if (messageContainerRef.current) {
        messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
      }
    },
  });

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <span>{emoji}</span>
          <h1 className="text-lg font-semibold">{titleText}</h1>
        </div>
        <label className="flex items-center space-x-2">
          <span className="text-sm">Show intermediate steps</span>
          <input
            type="checkbox"
            checked={showIntermediateSteps}
            onChange={(e) => setShowIntermediateSteps(e.target.checked)}
          />
        </label>
      </div>

      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6"
      >
        {messages.length === 0 && emptyStateComponent}
        
        {messages.map((message) => {
          if (message.role === "system" && showIntermediateSteps) {
            return <IntermediateStep key={message.id} message={message} />;
          }
          return (
            <ChatMessageBubble
              key={message.id}
              message={message}
              aiEmoji={emoji}
            />
          );
        })}

        {error && (
          <div className="p-4 bg-red-500 text-white rounded m-4">
            Error: {error.message}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="flex-1 p-2 rounded bg-gray-800 text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 