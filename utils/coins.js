import { Aptos, AptosConfig, Network, Account } from "@aptos-labs/ts-sdk";

const MODULE_ADDRESS = "0x42cbb5d8dada99304869c2466fb0f90c40b55f323554438acd540fc397976704";
const SPONSOR_ADDRESS = "0x7bda16775910109bd87aef69fcb8c3defbfd51332fd025252f7b2172aa3";

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

export const submitSponsoredTransaction = async (account, signTransaction, functionName, args = []) => {
    if (!account) return;
    
    try {
        // 1. Build transaction
        const transaction = await aptos.transaction.build.simple({
            sender: account.address,
            withFeePayer: true,
            data: {
                function: `${MODULE_ADDRESS}::coins4::${functionName}`,
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
};

export const transferCoins = async (account, signTransaction, fromAddress, toAddress, amount) => {
    return submitSponsoredTransaction(account, signTransaction, 'transfer', [fromAddress, toAddress, parseInt(amount)]);
}; 