import { ChatWindow } from '../components/ChatWindow';

export default function Home() {
  const InfoCard = (
    <div className="p-4 md:p-8 rounded bg-gray-800 w-full max-h-[85%] overflow-hidden">
      <h1 className="text-3xl md:text-4xl mb-4">MoveAgentKit + Next.js</h1>
      <ul className="space-y-2">
        <li className="text-lg">
          🤖 Welcome to your Aptos blockchain assistant
        </li>
        <li className="text-lg">
          💡 Try asking:
          <ul className="ml-4 mt-2 space-y-1">
            <li>• "What is my wallet address?"</li>
            <li>• "Check my APT balance"</li>
            <li>• "Get token details for USDT"</li>
          </ul>
        </li>
      </ul>
    </div>
  );

  return (
    <div className="h-screen">
      <ChatWindow
        endpoint="/api/chat"
        emoji="🤖"
        titleText="Aptos Agent"
        placeholder="Ask about your wallet or blockchain operations..."
        emptyStateComponent={InfoCard}
      />
    </div>
  );
}
