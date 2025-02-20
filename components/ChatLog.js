import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'

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

const formatMessage = (message) => {
  // Define message types and their formats
  const messageTypes = {
    DIALOGUE: 'dialogue',
    ACTION: 'action',
    SYSTEM: 'system',
    EMOTE: 'emote'
  }

  // Determine message type
  let type = messageTypes.DIALOGUE
  if (message.action) type = messageTypes.ACTION
  if (message.text.startsWith('*') && message.text.endsWith('*')) type = messageTypes.EMOTE
  if (message.character === 'System') type = messageTypes.SYSTEM

  return {
    ...message,
    type,
    read: message.read ?? false,
    formattedText: type === messageTypes.ACTION 
      ? `${message.character} ${message.text}`
      : message.text
  }
}

export function ChatLog() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [unreadMessages, setUnreadMessages] = useState([])
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setMessages(prevMessages => 
        prevMessages.map(msg => ({ ...msg, read: true }))
      )
      setUnreadMessages([])
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    } else {
      setUnreadMessages(messages.filter(msg => !msg.read && msg.type !== 'system'))
    }
  }, [isOpen, messages])

  const addMessage = async (message) => {
    const formattedMessage = formatMessage({
      id: message.id || Date.now(),
      timestamp: message.timestamp || new Date().toLocaleTimeString(),
      character: message.displayName || message.character,
      text: message.text,
      action: message.action,
      read: false
    })

    setMessages(prev => [...prev, formattedMessage])
    if (!isOpen) {
      setUnreadMessages(prev => [...prev, formattedMessage])
    }

    // Handle dialogue generation for character actions
    if (message.action && message.characterData) {
      const dialogue = await generateDialogue(
        message.action,
        message.characterData,
        message.targetCharacterData || null
      )

      if (dialogue) {
        dialogue.forEach((line, index) => {
          setTimeout(() => {
            const formattedDialogue = formatMessage({
              id: Date.now() + index,
              timestamp: new Date().toLocaleTimeString(),
              character: line.speaker,
              text: line.text,
              read: false
            })
            setMessages(prev => [...prev, formattedDialogue])
            if (!isOpen) setUnreadMessages(prev => [...prev, formattedDialogue])
          }, index * 1000)
        })
      }
    }
  }

  return {
    addMessage,
    clearMessages: () => {
      setMessages([])
      setUnreadMessages([])
    },
    component: (
      <div className="fixed bottom-4 left-4 z-[100]">
        {/* Notification Button */}
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setIsOpen(true)}
            className="relative bg-white dark:bg-gray-900 p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow ml-0"
          >
            <MessageCircle size={32} className="text-gray-700 dark:text-gray-300" />
            {unreadMessages.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full"
              >
                {unreadMessages.length}
              </motion.span>
            )}
          </motion.button>
        )}

        {/* Chat Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-0 left-0 w-[400px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b dark:border-gray-800 flex items-center justify-between bg-white/50 dark:bg-gray-900/50">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Activity Log</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Messages */}
              <div className="max-h-[500px] overflow-y-auto p-4 space-y-3">
                {messages
                  .filter(msg => msg.type !== 'system')
                  .map(msg => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`rounded-lg p-3 ${
                        msg.type === 'action' ? 'bg-blue-50 dark:bg-blue-900/10' :
                        msg.type === 'emote' ? 'bg-purple-50 dark:bg-purple-900/10' :
                        'bg-white dark:bg-gray-800'
                      } ${!msg.read ? 'border-l-4 border-blue-500' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-[150px] max-w-[150px]">
                          <span className={`font-medium text-sm truncate ${
                            msg.type === 'action' ? 'text-blue-600 dark:text-blue-400' :
                            'text-gray-900 dark:text-gray-100'
                          }`}>
                            {msg.character}
                          </span>
                          {!msg.read && (
                            <span className="inline-block w-2 h-2 shrink-0 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                        {msg.formattedText}
                      </p>
                    </motion.div>
                  ))}
                <div ref={chatEndRef} />
              </div>

              {/* Clear Button */}
              <button
                onClick={() => setMessages([])}
                className="w-full px-4 py-2 text-sm text-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border-t dark:border-gray-800"
              >
                Clear Log
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
} 