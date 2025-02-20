import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'

const ChatContext = createContext()

export function useChatLog() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatLog must be used within a ChatLogProvider')
  }
  return context
}

export function ChatLogProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [unreadMessages, setUnreadMessages] = useState([])

  const addMessage = async (message) => {
    if (!message) return
    
    // Format the message
    const formattedMessage = {
      id: message.id || Date.now(),
      timestamp: message.timestamp || new Date().toLocaleTimeString(),
      character: message.character || message.speaker, // Support both formats
      text: message.text,
      action: message.action,
      read: isOpen
    }

    // If there's an action, generate AI dialogue
    if (message.action && message.characterData) {
      try {
        const response = await fetch('/api/generate-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: message.action,
            character: message.characterData,
            targetCharacter: message.targetCharacterData || null
          })
        })

        const data = await response.json()
        if (data.dialogue) {
          // Add AI-generated messages with a delay
          data.dialogue.forEach((dialogue, index) => {
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now() + index,
                timestamp: new Date().toLocaleTimeString(),
                character: dialogue.speaker,
                text: dialogue.text,
                read: isOpen
              }])
              if (!isOpen) {
                setUnreadMessages(prev => [...prev, {
                  id: Date.now() + index,
                  timestamp: new Date().toLocaleTimeString(),
                  character: dialogue.speaker,
                  text: dialogue.text,
                  read: false
                }])
              }
            }, index * 1000)
          })
        }
      } catch (error) {
        console.error('Error generating dialogue:', error)
      }
    }

    // Add the original message
    setMessages(prev => [...prev, formattedMessage])
    if (!isOpen) {
      setUnreadMessages(prev => [...prev, formattedMessage])
    }
  }

  const value = {
    isOpen,
    setIsOpen,
    messages,
    setMessages,
    addMessage,
    unreadMessages,
    setUnreadMessages
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function ChatLog() {
  const { 
    isOpen, 
    setIsOpen, 
    messages, 
    setMessages,
    unreadMessages, 
    setUnreadMessages 
  } = useChatLog()
  
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setMessages(prevMessages => 
        prevMessages.map(msg => ({ ...msg, read: true }))
      )
      setUnreadMessages([])
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isOpen, setMessages, setUnreadMessages])

  return (
    <div className="fixed bottom-4 left-4 z-[100]">
      {/* Notification Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="relative bg-white dark:bg-gray-900 p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow"
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
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Character Chat</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="max-h-[500px] overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`rounded-lg p-3 ${
                    msg.action ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-white dark:bg-gray-800'
                  } ${!msg.read ? 'border-l-4 border-blue-500' : ''}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {msg.character}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {msg.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {msg.text}
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
              Clear Chat
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 