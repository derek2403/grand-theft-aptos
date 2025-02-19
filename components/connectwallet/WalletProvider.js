"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { BitgetWallet } from "@bitget-wallet/aptos-wallet-adapter";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { MSafeWalletAdapter } from "@msafe/aptos-wallet-adapter";
import { OKXWallet } from "@okwallet/aptos-wallet-adapter";
import { TrustWallet } from "@trustwallet/aptos-wallet-adapter";
import { FewchaWallet } from "fewcha-plugin-wallet-adapter";
import { Network } from "@aptos-labs/ts-sdk";
import { useAutoConnect } from "./AutoConnectProvider";
import { useToast } from "../ui/use-toast";

export const WalletProvider = ({ children }) => {
  const { autoConnect } = useAutoConnect();
  const { toast } = useToast();
  const wallets = [
    new BitgetWallet(),
    new FewchaWallet(),
    new MartianWallet(),
    new MSafeWalletAdapter(),
    new TrustWallet(),
    new OKXWallet(),
  ];
  return (
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={autoConnect}
      dappConfig={{
        network: Network.TESTNET,
        aptosConnectDappId: "my-app",
        autoConnect: true,
        mizuwallet: {
          manifestURL:
            "https://assets.mz.xyz/static/config/mizuwallet-connect-manifest.json",
        },
      }}
      onError={(error) => {
        if (!error.toString().includes('auto-connect')) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error || "Unknown wallet error",
          });
        }
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};