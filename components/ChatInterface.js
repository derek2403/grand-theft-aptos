import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import TransactionStatus from './TransactionStatus';

export default function ChatInterface() {
  const { isConnected, account } = useWallet();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTxHash, setCurrentTxHash] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !isConnected) return;

    setIsLoading(true);
    setMessages(prev => [...prev, { type: 'user', content: input }]);

    try {
      const response = await fetch('/api/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          command: input,
          sender: account.address,
          address: account.address
        })
      });

      const data = await response.json();
      
      if (data.result?.hash) {
        setCurrentTxHash(data.result.hash);
      }

      setMessages(prev => [...prev, { 
        type: 'assistant',
        content: data.result?.message || data.error,
        hash: data.result?.hash
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'assistant',
        content: 'Sorry, something went wrong. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="space-y-4 mb-4 h-[400px] overflow-y-auto">
          {messages.map((message, index) => (
            <div key={index}>
              <div className={`p-3 rounded-lg ${
                message.type === 'user' 
                  ? 'bg-blue-100 ml-auto max-w-[80%]' 
                  : 'bg-gray-100 mr-auto max-w-[80%]'
              }`}>
                {message.content}
              </div>
              {message.hash && <TransactionStatus hash={message.hash} />}
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isConnected 
              ? "Enter your command (e.g., 'Send 1 APT to 0x123...')"
              : "Please connect your wallet first"
            }
            className="flex-1 p-2 border rounded-lg"
            disabled={isLoading || !isConnected}
          />
          <button
            type="submit"
            disabled={isLoading || !isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-blue-300"
          >
            {isLoading ? 'Processing...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
} 