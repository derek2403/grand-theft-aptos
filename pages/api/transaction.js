import { processUserCommand } from '../../utils/chatGPT';
import { validateTransactionInput } from '../../utils/validators';
import { executeWithRetry } from '../../utils/errorHandling';
import { executeTransaction } from '../../utils/transactionExecutor';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { command, sender } = req.body;
    const parsedCommand = await processUserCommand(command);
    
    // Add sender to all command types
    parsedCommand.sender = sender;
    
    // Replace placeholder with actual wallet address
    if (parsedCommand.address === 'CONNECTED_WALLET') {
      parsedCommand.address = sender;
    }

    if (!validateTransactionInput(parsedCommand).isValid) {
      return res.status(400).json({ error: 'Invalid transaction parameters' });
    }

    const result = await executeWithRetry(async () => {
      return await executeTransaction(parsedCommand);
    });

    res.status(200).json({ result });
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ error: error.message });
  }
} 