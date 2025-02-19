import { Aptos, AptosConfig, Network, Account } from "@aptos-labs/ts-sdk";

const MODULE_ADDRESS = "0xc18ba9c71683d205b0d0ff908dd9b4c0b9c992c9c9532e74f26e71d2604e835f";
const SPONSOR_ADDRESS = "0x7bda16775910109bd87aef69fcb4cdeb8c3defbfd51332fd025252f7b2172aa3";

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

export async function submitSponsoredNFTTransaction(account, signTransaction, functionName, args = []) {
  try {
    // 1. Build transaction
    const transaction = await aptos.transaction.build.simple({
      sender: account.address,
      withFeePayer: true,
      data: {
        function: `${MODULE_ADDRESS}::nft5::${functionName}`,
        functionArguments: args,
        typeArguments: []
      },
    });

    // 2. Sign transaction with user's wallet
    const userAuthenticator = await signTransaction(transaction);

    // 3. Sign with sponsor account
    const sponsorAccount = Account.fromDerivationPath({
      path: "m/44'/637'/0'/0'/0'",
      mnemonic: "social measure neck dance beyond candy torch timber praise leave rebuild spend"
    });
    
    const sponsorAuthenticator = aptos.transaction.signAsFeePayer({
      signer: sponsorAccount,
      transaction
    });

    // 4. Submit transaction with both signatures
    const committedTransaction = await aptos.transaction.submit.simple({
      transaction,
      senderAuthenticator: userAuthenticator,
      feePayerAuthenticator: sponsorAuthenticator,
    });

    // 5. Wait for transaction
    await aptos.waitForTransaction({ transactionHash: committedTransaction.hash });
    
    return committedTransaction.hash;
  } catch (error) {
    console.error(`Error in ${functionName}:`, error);
    throw error;
  }
} 