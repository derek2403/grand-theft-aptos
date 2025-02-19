import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `
You are a blockchain transaction assistant. Parse user inputs into structured commands.
Valid actions: transfer, check_balance, transaction_history, get_address

For check_balance commands, return JSON in this format:
{
  "action": "check_balance",
  "address": "CONNECTED_WALLET"
}

For get_address commands, return JSON in this format:
{
  "action": "get_address"
}

For transfer commands, parse amounts as numbers and return JSON in this format:
{
  "action": "transfer",
  "sender": "CONNECTED_WALLET",
  "recipient": "<recipient_address>",
  "amount": <number>
}

Note: For transfer commands, convert text amounts like "1 APT" to just the number (e.g., 1)

For transaction_history commands, return JSON in this format:
{
  "action": "transaction_history",
  "address": "CONNECTED_WALLET"
}
`;

const formatUserPrompt = (userInput) => `
Parse the following command into a JSON transaction object using the specified formats:
Command: "${userInput}"
Return ONLY valid JSON, no backticks, no json keyword, no additional text.
`;

export const processUserCommand = async (input) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: formatUserPrompt(input) }
    ],
    temperature: 0.1
  });

  const content = completion.choices[0].message.content.trim();
  return JSON.parse(content);
}; 