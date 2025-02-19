# Complete Guide: Implementing MoveAgentKit in Next.js (Pages Router) with GPT

## Project Setup

1. Create a new Next.js project: 
```bash
npx create-next-app@latest my-moveagent-app
# Choose the following options:
# - No to TypeScript
# - No to App Router
# - Yes to TailwindCSS
# - No to other options
cd my-moveagent-app
```

2. Install required dependencies:
```bash
npm install move-agent-kit @aptos-labs/ts-sdk langchain openai ai react-markdown isomorphic-dompurify marked
```

## Project Structure
```plaintext
my-moveagent-app/
├── components/
│   ├── ChatWindow.js
│   ├── ChatMessageBubble.js
│   └── IntermediateStep.js
├── pages/
│   ├── _app.js
│   ├── index.js
│   └── api/
│       └── chat.js
├── styles/
│   └── globals.css
└── .env.local
```

## Implementation

1. Create `.env.local` in the root directory:
```env
APTOS_PRIVATE_KEY="your_private_key"
OPENAI_API_KEY="your_openai_key"
```

2. Create `components/ChatMessageBubble.js`:
```javascript
export function ChatMessageBubble({ message, aiEmoji, sources }) {
  const colorClassName = message.role === "user" ? "bg-sky-600" : "bg-slate-50 text-black";
  const alignmentClassName = message.role === "user" ? "ml-auto" : "mr-auto";
  const prefix = message.role === "user" ? "🧑" : aiEmoji;
  
  return (
    <div className={`${alignmentClassName} ${colorClassName} rounded px-4 py-2 max-w-[80%] mb-8 flex`}>
      <div className="mr-2">{prefix}</div>
      <div className="whitespace-pre-wrap flex flex-col">
        <span>{message.content}</span>
      </div>
    </div>
  );
}
```

3. Create `components/IntermediateStep.js`:
```javascript
import { useState } from "react";

export function IntermediateStep({ message }) {
  const parsedInput = JSON.parse(message.content);
  const action = parsedInput.action;
  const observation = parsedInput.observation;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="ml-auto bg-green-600 rounded px-4 py-2 max-w-[80%] mb-8 whitespace-pre-wrap flex flex-col cursor-pointer">
      <div 
        className={`text-right ${expanded ? "w-full" : ""}`} 
        onClick={() => setExpanded(!expanded)}
      >
        <code className="mr-2 bg-slate-600 px-2 py-1 rounded hover:text-blue-600">
          🛠 <b>{action.name}</b>
        </code>
        <span>{expanded ? "🔼" : "🔽"}</span>
      </div>
      {expanded && (
        <div className="mt-2">
          <div className="bg-slate-600 rounded p-4 mt-1">
            <code>
              Tool Input:
              <br />
              <br />
              {JSON.stringify(action.args, null, 2)}
            </code>
          </div>
          <div className="bg-slate-600 rounded p-4 mt-1">
            <code>{observation}</code>
          </div>
        </div>
      )}
    </div>
  );
}
```

4. Create `components/ChatWindow.js`:
```javascript
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
```

5. Create `pages/api/chat.js`:
```javascript
import { Aptos, AptosConfig, Ed25519PrivateKey, Network, PrivateKey, PrivateKeyVariants } from "@aptos-labs/ts-sdk";
import { OpenAI } from "langchain/llms/openai";
import { StreamingTextResponse } from "ai";
import { AgentRuntime, LocalSigner, createAptosTools } from "move-agent-kit";

const llm = new OpenAI({
  temperature: 0.7,
  modelName: "gpt-4-turbo-preview",
  openAIApiKey: process.env.OPENAI_API_KEY,
  streaming: true,
});

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const aptosConfig = new AptosConfig({
      network: Network.MAINNET,
    });

    const aptos = new Aptos(aptosConfig);
    
    const account = await aptos.deriveAccountFromPrivateKey({
      privateKey: new Ed25519PrivateKey(
        PrivateKey.formatPrivateKey(
          process.env.APTOS_PRIVATE_KEY,
          PrivateKeyVariants.Ed25519
        )
      ),
    });

    const signer = new LocalSigner(account, Network.MAINNET);
    const aptosAgent = new AgentRuntime(signer, aptos);
    const tools = createAptosTools(aptosAgent);

    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid message format' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const stream = await llm.pipe(tools).stream(messages);

    return new StreamingTextResponse(stream);
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

6. Update `pages/index.js`:
```javascript
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
```

7. Update `styles/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 255, 255, 255;
  --background-rgb: 17, 17, 17;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
}
```

8. Update `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
```

## Running the Project

1. Start the development server:
```bash
npm run dev
```

2. Visit `http://localhost:3000` in your browser.

## Security Considerations

1. Environment Variables:
- Never commit `.env.local` to version control
- Keep private keys secure
- Use proper environment variable management for different environments

2. API Security:
- Implement rate limiting for production use
- Add proper error handling and validation
- Consider adding authentication for sensitive operations

3. Best Practices:
- Regularly update dependencies
- Monitor API usage and costs
- Implement proper logging and monitoring
- Consider implementing request caching where appropriate

## Troubleshooting

Common issues and solutions:

1. API Key Issues:
- Verify environment variables are properly set
- Check API key permissions and quotas
- Ensure keys are properly formatted

2. Network Issues:
- Check network connectivity
- Verify Aptos node availability
- Monitor API response times

3. Wallet Connection Issues:
- Verify private key format
- Check network configuration
- Ensure sufficient funds for transactions

## Additional Resources

- [MoveAgentKit Documentation](https://www.moveagentkit.xyz)
- [Aptos SDK Documentation](https://aptos.dev)
- [LangChain Documentation](https://js.langchain.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
```

This implementation guide provides a complete walkthrough for setting up MoveAgentKit with Next.js and GPT. It includes all necessary components, security considerations, and troubleshooting tips. 