"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect } from "react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// This is the address of the account that has the `coins1::CoinStorage` resource.
// You must replace this with the actual address where your Move module is deployed.
const MODULE_ADDRESS = "0x5fb5091a35dbc17a1e695ae3c6717e566be5094e95be499e0672c7e63cca30df";

// Initialize Aptos client with Testnet configuration.
// Adjust as needed if you’re on Devnet, Mainnet, or a local network.
const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

export default function CoinsPage() {
  // Hooks from the Aptos Wallet Adapter
  const { account, connected, signAndSubmitTransaction } = useWallet();

  // State variables
  const [balances, setBalances] = useState([]);
  const [totalSupply, setTotalSupply] = useState("0");
  const [owner, setOwner] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactionInProgress, setTransactionInProgress] = useState(false);

  // Whenever the user connects/disconnects or changes accounts, fetch balances
  useEffect(() => {
    if (connected && account?.address) {
      fetchAmount();
    }
  }, [account?.address, connected]);

  // Fetch the resource from the chain
  const fetchAmount = async () => {
    if (!account?.address) return;

    setLoading(true);
    try {
      console.log("Fetching resource for address:", account.address);

      // IMPORTANT: We query the resource at the user's address, 
      // but typically you'd query the *owner* address if that's where it's stored.
      // If your resource is at the *owner's* address, then replace `account.address` below
      // with that owner address.
      const resource = await aptos.getAccountResource({
        accountAddress: account.address,
        resourceType: `${MODULE_ADDRESS}::coins1::CoinStorage`,
      });

      console.log("Full resource response:", resource);

      // The resource object from the Aptos SDK already has `balances`, `owner`, etc. 
      // There's no `data` property here.
      setBalances(resource.balances || []);
      setTotalSupply(resource.total_supply || "0");
      setOwner(resource.owner || "");
      setError(null);
    } catch (err) {
      console.error("Error fetching amount:", err);
      if (err?.message?.includes("Resource not found")) {
        setError("Coin Storage not initialized for this account");
      } else {
        setError("Error fetching amount");
      }
    } finally {
      setLoading(false);
    }
  };

  // Utility to shorten an address for display
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // If user isn't connected to a wallet, you might show nothing or a prompt.
  if (!connected) return null;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          GTA Coins Dashboard
        </h1>

        {/* Loading and Error States */}
        {loading ? (
          <div className="text-center">
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          // Main content
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Contract Info</h2>
              <div className="space-y-2 mb-4">
                <p>
                  <span className="font-medium">Owner: </span>
                  {formatAddress(owner)}
                </p>
                <p>
                  <span className="font-medium">Total Supply: </span>
                  {totalSupply} GTA Coins
                </p>
              </div>
              <h3 className="text-lg font-semibold mb-4">All User Balances</h3>
              <div className="space-y-4">
                {balances.map((balance, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 last:border-0 pb-4 last:pb-0"
                  >
                    <p>
                      <span className="font-medium">Address: </span>
                      {formatAddress(balance.user)}
                      {balance.user === account?.address && " (You)"}
                    </p>
                    <p>
                      <span className="font-medium">Amount: </span>
                      {balance.amount} GTA Coins
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Transaction in Progress Indicator */}
        {transactionInProgress && (
          <div className="fixed bottom-4 right-4 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg shadow">
            Transaction in progress...
          </div>
        )}
      </div>
    </div>
  );
}
