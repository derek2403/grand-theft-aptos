import { AptosConfig, Aptos, Ed25519PrivateKey, Network } from '@aptos-labs/ts-sdk';
import { AgentRuntime, LocalSigner } from 'move-agent-kit';

export const initializeMoveAgent = (privateKey) => {
  const aptosConfig = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(aptosConfig);
  
  const account = aptos.deriveAccountFromPrivateKey({
    privateKey: new Ed25519PrivateKey(privateKey)
  });

  const signer = new LocalSigner(account, Network.TESTNET);
  return new AgentRuntime(signer, aptos);
}; 