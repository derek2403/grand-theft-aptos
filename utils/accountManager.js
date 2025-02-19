import { Account, AptosClient } from "@aptos-labs/ts-sdk";

class AptosAccountManager {
  constructor(nodeUrl) {
    this.client = new AptosClient(nodeUrl);
  }

  createAccount() {
    return Account.generate();
  }

  recoverAccount(privateKey) {
    return Account.fromPrivateKey(privateKey);
  }

  async getBalance(address) {
    return await this.client.getAccountBalance(address);
  }
}

export default AptosAccountManager; 