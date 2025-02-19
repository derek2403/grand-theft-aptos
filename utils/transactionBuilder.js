class AptosTransactionBuilder {
  constructor(client) {
    this.client = client;
  }
  
  async buildTransferTx(sender, recipient, amount) {
    const payload = {
      function: "0x1::coin::transfer",
      type_arguments: ["0x1::aptos_coin::AptosCoin"],
      arguments: [recipient, amount]
    };

    return await this.client.generateTransaction(sender.address, payload);
  }

  async submitAndWait(signedTx) {
    const pendingTx = await this.client.submitTransaction(signedTx);
    return await this.client.waitForTransaction(pendingTx.hash);
  }
}

export default AptosTransactionBuilder; 