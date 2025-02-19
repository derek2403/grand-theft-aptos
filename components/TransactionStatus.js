import { useState, useEffect } from 'react';
import { AptosClient } from "@aptos-labs/ts-sdk";

export default function TransactionStatus({ hash }) {
  const [status, setStatus] = useState('pending');
  const [details, setDetails] = useState(null);
  
  useEffect(() => {
    if (!hash) return;
    
    const client = new AptosClient(process.env.NEXT_PUBLIC_APTOS_NODE_URL);
    const checkStatus = async () => {
      try {
        const txnInfo = await client.getTransactionByHash(hash);
        setStatus(txnInfo.status);
        setDetails(txnInfo);
      } catch (error) {
        console.error('Error checking transaction status:', error);
        setStatus('error');
      }
    };

    const interval = setInterval(checkStatus, 3000);
    checkStatus();

    return () => clearInterval(interval);
  }, [hash]);

  return (
    <div className="mt-2 p-3 rounded-lg bg-gray-50">
      <div className="flex items-center gap-2">
        <span className="font-medium">Status:</span>
        <span className={`
          ${status === 'pending' && 'text-yellow-600'}
          ${status === 'success' && 'text-green-600'}
          ${status === 'error' && 'text-red-600'}
        `}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
      {details && (
        <div className="mt-2 text-sm text-gray-600">
          <div>Gas Used: {details.gas_used}</div>
          <div>Version: {details.version}</div>
        </div>
      )}
    </div>
  );
} 