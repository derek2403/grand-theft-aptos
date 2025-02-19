"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { Button } from "../components/ui/button";

const MODULE_ADDRESS = "0x271e177d1961e818b23a1197299d73a6c2a8b4d2a8b7a4750b5f6901aa21e46d";

// Initialize Aptos client with testnet
const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

// NFT Collection details
const COLLECTION_NAME = "NFT";
const COLLECTION_DESCRIPTION = "A collection of NFTs";
const COLLECTION_URI = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg";

export default function NFTPage() {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [collectionCreated, setCollectionCreated] = useState(false);

  const createCollection = async () => {
    if (!account) return;
    setTransactionInProgress(true);
    
    try {
      const transaction = {
        data: {
          function: `${MODULE_ADDRESS}::nft4::create_collection`,
          functionArguments: [
            COLLECTION_NAME,
            COLLECTION_DESCRIPTION,
            COLLECTION_URI,
            1000 // max_supply
          ],
          type_arguments: []
        }
      };
      
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash });
      console.log("Collection created successfully!");
      setCollectionCreated(true);
      
    } catch (error) {
      console.error("Error creating collection:", error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  const mintNFT = async () => {
    if (!account) return;
    setTransactionInProgress(true);
    
    try {
      const transaction = {
        data: {
          function: `${MODULE_ADDRESS}::nft4::mint_nft`,
          functionArguments: [
            account.address, // creator_addr (minting from your own collection)
          ],
          type_arguments: []
        }
      };
      
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash });
      console.log("NFT minted successfully!");
      
    } catch (error) {
      console.error("Error minting NFT:", error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Create Your NFT Collection</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <img 
            src={COLLECTION_URI}
            alt="NFT Preview" 
            className="w-48 h-48 object-cover rounded-lg"
          />
        </div>
        
        {connected ? (
          <div className="space-y-4">
            {!collectionCreated && (
              <Button 
                onClick={createCollection}
                disabled={transactionInProgress}
                className="w-full"
              >
                {transactionInProgress ? "Creating Collection..." : "Create Your Collection"}
              </Button>
            )}
            
            <Button 
              onClick={mintNFT}
              disabled={transactionInProgress || !collectionCreated}
              className="w-full"
              variant="outline"
            >
              {transactionInProgress ? "Minting your NFT..." : "Mint NFT from Your Collection"}
            </Button>
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
