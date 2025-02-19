"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect } from "react";
import { Aptos, AptosConfig, Network, Account } from "@aptos-labs/ts-sdk";
import { Button } from "../components/ui/button";

const MODULE_ADDRESS = "0x6d1f906b2b12cb4c01119327bf3ea9a64fa578c66e46ab30c314bd359f80d090";
const SPONSOR_ADDRESS = "0x7bda16775910109bd87aef69fcb4cdeb8c3defbfd51332fd025252f7b2172aa3";

// Initialize Aptos client with testnet
const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

export default function NFTPage() {
  const { account, connected, signTransaction } = useWallet();
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [collectionCreated, setCollectionCreated] = useState(false);
  const [collectionCount, setCollectionCount] = useState(0);

  useEffect(() => {
    const checkCollection = async () => {
      if (!account?.address) return;
      
      try {
        const collectionResource = await aptos.getAccountResource({
          accountAddress: account.address,
          resourceType: `${MODULE_ADDRESS}::nft5::UserCollections`
        });

        setCollectionCreated(!!collectionResource);
      } catch (error) {
        if (error.message?.includes("Resource not found")) {
          setCollectionCreated(false);
        }
      }
    };

    if (connected) {
      checkCollection();
    }
  }, [account?.address, connected]);

  const submitSponsoredTransaction = async (functionName, args = []) => {
    if (!account) return;
    setTransactionInProgress(true);
    
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
      
      if (functionName === 'create_collection') {
        setCollectionCreated(true);
        setCollectionCount(prev => prev + 1);
      }
      
      console.log(`${functionName} completed successfully!`);
      
    } catch (error) {
      console.error(`Error in ${functionName}:`, error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  const createCollection = () => {
    const collectionName = `Collection ${collectionCount + 1}`;
    submitSponsoredTransaction('create_collection', [
      collectionName,
      `Description for ${collectionName}`,
      "https://files.oaiusercontent.com/file-9b4vzdBeQBJvf4YvSnh39X?se=2025-02-19T16%3A37%3A18Z&sp=r&sv=2024-08-04&sr=b&rscc=max-age%3D604800%2C%20immutable%2C%20private&rscd=attachment%3B%20filename%3Dba20cc77-82ba-4c7a-a6ae-b2bf1fb5a12e.webp&sig=N/9FOf3lf7hI1/Y0W7%2Bw/qlCpoOpx9BRflxIsyZSz34%3D",
      1000 // max_supply
    ]);
  };

  const mintNFT = () => submitSponsoredTransaction('mint_nft', [
    account.address // creator_addr (minting from your own collection)
  ]);

  return (
    <div className="mt-4 p-4 border rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Create Your NFT Collection</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg"
            alt="NFT Preview" 
            className="w-48 h-48 object-cover rounded-lg"
          />
        </div>
        
        {connected ? (
          <div className="space-y-4">
            <Button 
              onClick={createCollection}
              disabled={transactionInProgress}
              className="w-full"
            >
              {transactionInProgress ? "Creating Collection..." : "Create New Collection"}
            </Button>
            
            {collectionCreated && (
              <Button 
                onClick={mintNFT}
                disabled={transactionInProgress}
                className="w-full"
                variant="outline"
              >
                {transactionInProgress ? "Minting your NFT..." : "Mint NFT from Latest Collection"}
              </Button>
            )}

            {collectionCount > 0 && (
              <p className="text-sm text-gray-600 text-center">
                You have created {collectionCount} collection{collectionCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500">Connect your wallet to create your NFT collection</p>
        )}
        
        {transactionInProgress && (
          <p className="text-sm text-blue-600 text-center">
            Transaction in progress... Please wait.
          </p>
        )}
      </div>
    </div>
  );
}
