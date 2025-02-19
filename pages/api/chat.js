import { Aptos, AptosConfig, Ed25519PrivateKey, Network } from "@aptos-labs/ts-sdk";
import { ChatOpenAI } from "@langchain/openai";
import { AgentRuntime, LocalSigner, createAptosTools } from "move-agent-kit";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { OpenAIStream } from 'ai';

const llm = new ChatOpenAI({
  temperature: 0.7,
  modelName: "gpt-4o-mini",
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
    const aptosConfig = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(aptosConfig);
    
    const account = await aptos.deriveAccountFromPrivateKey({
      privateKey: new Ed25519PrivateKey(
        process.env.APTOS_PRIVATE_KEY
      ),
    });

    const signer = new LocalSigner(account, Network.TESTNET);
    const aptosAgent = new AgentRuntime(signer, aptos);
    
    // Add this to debug
    console.log("Account initialized with address:", account.accountAddress.toString());
    console.log("Signer network:", Network.TESTNET);
    
    const rawTools = createAptosTools(aptosAgent);
    
    // More detailed debug logging
    console.log("Agent address:", account.accountAddress.toString());
    console.log("Number of tools:", rawTools.length);
    console.log("Tool names:", rawTools.map(t => t.name).join(', '));
    console.log("Has wallet tool:", rawTools.some(t => t.name === 'aptos_get_wallet_address'));
    
    // Modify tool descriptions to be shorter
    const tools = rawTools.map(tool => ({
      ...tool,
      description: tool.description.length > 1000 
        ? tool.description.substring(0, 1000) + "..."
        : tool.description
    }));

    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid message format' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const executor = await initializeAgentExecutorWithOptions(tools, llm, {
      agentType: "openai-functions",
      verbose: true,
      systemMessage: `You are a helpful assistant with access to Aptos blockchain tools. 
        The current wallet address is ${account.accountAddress.toString()}.
        Available tools: ${tools.map(t => t.name).join(', ')}.
        To get the wallet address, use the aptos_get_wallet_address tool.`,
    });

    // Convert previous messages to LangChain format
    const chatHistory = messages.slice(0, -1).map(m => 
      m.role === 'user' 
        ? new HumanMessage(m.content)
        : new AIMessage(m.content)
    );

    const stream = await executor.stream({
      input: messages[messages.length - 1].content,
      chat_history: chatHistory,
    });

    // Convert the executor stream to a text encoder stream
    const textEncoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.output || chunk.message?.content || '';
            if (text) {
              controller.enqueue(textEncoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
            }
          }
          controller.enqueue(textEncoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 