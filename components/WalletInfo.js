"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect } from "react";

export function WalletInfo() {
  const { account, connected } = useWallet();
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!account?.address) return;
      
      try {
        const response = await fetch(`https://fullnode.testnet.aptoslabs.com/v1/accounts/${account.address}/resources`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const resources = await response.json();
        
        // Find the AptosCoin resource
        const aptosCoin = resources.find(
          (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
        );
        
        if (aptosCoin?.data?.coin?.value) {
          // Convert from octas to APT (1 APT = 100000000 octas)
          const balanceInApt = parseInt(aptosCoin.data.coin.value) / 100000000;
          setBalance(balanceInApt.toFixed(4));
        } else {
          setBalance('0.0000');
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance('Error');
      }
    };

    if (connected) {
      fetchBalance();
      // Set up an interval to fetch balance every 10 seconds
      const intervalId = setInterval(fetchBalance, 10000);
      return () => clearInterval(intervalId);
    } else {
      setBalance(null);
    }
  }, [account?.address, connected]);

  if (!connected) return null;

  return (
    <div className="mt-4 p-4 border rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Wallet Info</h2>
      <div className="space-y-2">
        <p className="break-all">
          <span className="font-medium">Address: </span>
          {account?.address}
        </p>
        <p>
          <span className="font-medium">Balance: </span>
          {balance !== null ? `${balance} APT` : 'Loading...'}
        </p>
      </div>
    </div>
  );
} 