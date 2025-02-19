import { initializeMoveAgent } from './moveAgentConfig';
import { TransactionError } from './errorHandling';

class TransactionExecutor {
  constructor() {
    this.agent = initializeMoveAgent(process.env.WALLET_PRIVATE_KEY);
  }

  async executeTransaction(parsedCommand) {
    switch (parsedCommand.action) {
      case 'check_balance':
        return await this.checkBalance(parsedCommand.address);
      case 'transfer':
        return await this.executeTransfer(parsedCommand);
      case 'get_address':
        return await this.getAddress();
      case 'transaction_history':
        return await this.getTransactionHistory(parsedCommand.address);
      default:
        throw new Error('Unsupported action');
    }
  }

  async checkBalance(address) {
    try {
      const targetAddress = address || this.agent.signer.account.address.toString();
      const balance = await this.agent.getBalance(targetAddress);
      
      return {
        balance: balance,
        message: `Current balance: ${balance} APT`
      };
    } catch (error) {
      console.error('Balance check error:', error);
      throw new TransactionError(
        `Balance check failed: ${error.message}`,
        'balance_error',
        error.message.includes('network')
      );
    }
  }

  async executeTransfer({ recipient, amount }) {
    try {
      const result = await this.agent.transferTokens(recipient, amount);
      
      return {
        hash: result.hash,
        message: `Transfer of ${amount} APT completed. Transaction hash: ${result.hash}`
      };
    } catch (error) {
      console.error('Transfer error:', error);
      throw new TransactionError(
        `Transfer failed: ${error.message}`,
        'transfer_error',
        error.message.includes('network')
      );
    }
  }

  async getTransactionHistory(address) {
    try {
      const history = await this.agent.getAccountTransactions(address);
      return {
        transactions: history,
        message: `Found ${history.length} transactions`
      };
    } catch (error) {
      throw new TransactionError(
        `History fetch failed: ${error.message}`,
        'history_error',
        error.message.includes('network')
      );
    }
  }

  async getAddress() {
    return {
      address: this.agent.signer.account.address.toString(),
      message: `Your wallet address: ${this.agent.signer.account.address.toString()}`
    };
  }
}

export const executeTransaction = (parsedCommand) => new TransactionExecutor().executeTransaction(parsedCommand); 