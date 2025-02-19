import { Aptos, AptosConfig, Ed25519PrivateKey, Network } from "@aptos-labs/ts-sdk";
import { ChatOpenAI } from "@langchain/openai";
import { AgentRuntime, LocalSigner, createAptosTools } from "move-agent-kit";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { OpenAIStream } from 'ai';
import { PrivateKey, PrivateKeyVariants } from "@aptos-labs/ts-sdk";
import { Tool } from "langchain/tools";

const llm = new ChatOpenAI({
  temperature: 0,
  modelName: "gpt-4o-mini",
  openAIApiKey: process.env.OPENAI_API_KEY,
  streaming: true,
});

export const config = {
  runtime: 'edge',
};

class GetWalletAddressTool extends Tool {
  name = "get_wallet_address";
  description = "Gets the current wallet address. Use this tool ONLY when the user EXPLICITLY asks 'what is my wallet address' or similar address-specific questions. DO NOT use for balance queries.";
  
  constructor(accountAddress) {
    super();
    this.accountAddress = accountAddress;
  }

  async _call() {
    console.log("Custom tool called with address:", this.accountAddress);
    return this.accountAddress;
  }
}

class GetBalanceTool extends Tool {
  name = "get_balance";
  description = "Gets the exact current wallet balance in APT. Use this tool ONLY when the user asks about balance, APT amount, or how much APT they have. DO NOT use for address queries.";
  
  constructor(aptos, accountAddress) {
    super();
    this.aptos = aptos;
    this.accountAddress = accountAddress;
  }

  async _call() {
    try {
      console.log("Custom balance tool called for address:", this.accountAddress);
      
      const resources = await this.aptos.getAccountResources({
        accountAddress: this.accountAddress
      });
      
      const aptResource = resources.find(
        (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
      );
      
      if (!aptResource) {
        throw new Error("APT resource not found");
      }
      
      // Convert to exact decimal string without rounding
      const rawBalance = BigInt(aptResource.data.coin.value);
      const balance = (rawBalance * BigInt(100000000) / BigInt(100000000)).toString();
      const decimalBalance = `${balance.slice(0, -8)}.${balance.slice(-8)}`;
      
      console.log("Balance retrieved:", decimalBalance, "APT");
      return decimalBalance;
    } catch (error) {
      console.error("Balance error:", error);
      throw error;
    }
  }
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    if (!process.env.APTOS_PRIVATE_KEY) {
      throw new Error('APTOS_PRIVATE_KEY environment variable is not set');
    }

    const aptosConfig = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(aptosConfig);
    
    // Format the private key properly
    const formattedPrivateKey = PrivateKey.formatPrivateKey(
      process.env.APTOS_PRIVATE_KEY,
      PrivateKeyVariants.Ed25519
    );
    
    const account = await aptos.deriveAccountFromPrivateKey({
      privateKey: new Ed25519PrivateKey(formattedPrivateKey),
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
    const tools = [
      new GetWalletAddressTool(account.accountAddress.toString()),
      new GetBalanceTool(aptos, account.accountAddress.toString()),
      ...rawTools.map(tool => ({
        ...tool,
        description: tool.description.length > 1000 
          ? tool.description.substring(0, 1000) + "..."
          : tool.description
      }))
    ];

    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid message format' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Deduplicate messages by taking only unique messages based on content
    const uniqueMessages = messages.filter((message, index, self) =>
      index === self.findIndex((m) => m.content === message.content)
    );

    const executor = await initializeAgentExecutorWithOptions(tools, llm, {
      agentType: "openai-functions",
      verbose: true,
      systemMessage: `You are a blockchain assistant with strict rules for tool usage.

        CRITICAL RULES (MUST FOLLOW):
        1. Tool Selection:
           - get_wallet_address: ONLY for "what is my wallet address" queries
           - get_balance: ONLY for balance/APT amount queries
           - NEVER use both tools in one response
           - NEVER mention information from one tool when using the other

        2. Response Formatting:
           For address queries:
           - EXACT format: "Your wallet address is: [address]"
           - NEVER mention balance
           
           For balance queries:
           - EXACT format: "Your wallet balance is: [amount] APT"
           - NEVER mention address
           - NEVER use "approximately" or round numbers
           - Show ALL decimal places

        3. Context Isolation:
           - Each query is independent
           - NEVER mix information from different queries
           - NEVER reference previous responses
           
        VIOLATION OF THESE RULES IS NOT ALLOWED UNDER ANY CIRCUMSTANCES.`,
      memory: null, // Disable memory to prevent context bleeding
    });

    // Convert previous messages to LangChain format using deduplicated messages
    const chatHistory = uniqueMessages.slice(0, -1).map(m => 
      m.role === 'user' 
        ? new HumanMessage(m.content)
        : new AIMessage(m.content)
    );

    const stream = await executor.stream({
      input: uniqueMessages[uniqueMessages.length - 1].content,
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