import { createContext, useContext, useState, useEffect } from 'react';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null);
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);

  const connectWallet = async () => {
    try {
      const isPetraInstalled = window.petra;
      if (!isPetraInstalled) {
        throw new Error('Petra wallet is not installed!');
      }

      await window.petra.connect();
      const walletAccount = await window.petra.account();
      const networkInfo = await window.petra.network();

      setWallet(window.petra);
      setAccount(walletAccount);
      setNetwork(networkInfo);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    if (wallet) {
      await wallet.disconnect();
      setWallet(null);
      setAccount(null);
      setNetwork(null);
    }
  };

  return (
    <WalletContext.Provider value={{
      wallet,
      account,
      network,
      connectWallet,
      disconnectWallet,
      isConnected: !!account
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext); 