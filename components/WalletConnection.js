import { useWallet } from '../contexts/WalletContext';

export default function WalletConnection() {
  const { isConnected, account, connectWallet, disconnectWallet } = useWallet();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  return (
    <div className="fixed top-4 right-4">
      {isConnected ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </span>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
} 