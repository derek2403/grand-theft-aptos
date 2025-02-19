import { useState, useEffect, useRef } from 'react'

const generateDialogue = async (action, character, targetCharacter = null) => {
  try {
    // Validate required data before sending
    if (!action?.type || !character?.name) {
      console.error('Missing required data for dialogue generation:', { action, character })
      return null
    }

    const response = await fetch('/api/generate-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        character: {
          name: character.name,
          occupation: character.occupation || 'Unknown',
          mbti: character.mbti || 'Unknown',
          hobby: character.hobby || 'Unknown',
          characteristics: character.characteristics || [],
          gender: character.gender || 'Unknown'
        },
        targetCharacter: targetCharacter ? {
          name: targetCharacter.name,
          occupation: targetCharacter.occupation || 'Unknown',
          mbti: targetCharacter.mbti || 'Unknown',
          hobby: targetCharacter.hobby || 'Unknown',
          characteristics: targetCharacter.characteristics || [],
          gender: targetCharacter.gender || 'Unknown'
        } : null
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('API Error:', data)
      // Return null instead of throwing to avoid crashing
      return null
    }

    return data.dialogue
  } catch (error) {
    console.error('Error generating dialogue:', error)
    return null
  }
}

export function ChatLog() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const chatEndRef = useRef(null)

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  // Add a new message to the chat
  const addMessage = async (message) => {
    // If it's a system message, add it directly
    if (message.character === 'System') {
      setMessages(prev => [...prev, {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        character: 'System',
        text: message.text
      }])
      return
    }

    // Add the initial action message
    setMessages(prev => [...prev, {
      id: message.id || Date.now(),
      timestamp: message.timestamp || new Date().toLocaleTimeString(),
      character: message.displayName || message.character,
      text: message.text
    }])

    // For character actions, generate contextual dialogue
    if (message.action && message.characterData) {
      const dialogue = await generateDialogue(
        message.action,
        message.characterData,
        message.targetCharacterData || null
      )

      if (dialogue) {
        // Add each line of dialogue with a small delay
        dialogue.forEach((line, index) => {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now() + index,
              timestamp: new Date().toLocaleTimeString(),
              character: line.speaker,
              text: line.text
            }])
          }, index * 1000) // 1 second delay between messages
        })
      }
    }
  }

  // Clear all messages
  const clearMessages = () => {
    setMessages([])
  }

  return {
    addMessage,
    clearMessages,
    component: (
      <>
        {/* Chat Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 z-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>

        {/* Chat Window */}
        {isOpen && (
          <div className="fixed bottom-20 right-4 w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col z-50">
            {/* Header */}
            <div className="flex justify-between items-center p-3 border-b">
              <h3 className="font-bold">Activity Log</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map(msg => (
                <div key={msg.id} className="mb-2">
                  <div className="text-xs text-gray-500">{msg.timestamp}</div>
                  <div className="flex items-start">
                    <span className="font-bold text-blue-600">{msg.character}</span>
                    <span className="ml-2 text-gray-700">{msg.text}</span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Clear Button */}
            <div className="p-3 border-t">
              <button
                onClick={clearMessages}
                className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Clear Log
              </button>
            </div>
          </div>
        )}
      </>
    )
  }
} 