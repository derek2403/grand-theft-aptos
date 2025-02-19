"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect } from "react";
import { Aptos, AptosConfig, Network, Account } from "@aptos-labs/ts-sdk";

// Update this to match your deployed contract address
const MODULE_ADDRESS = "0xe59834a16ee98917c5a3896ab8b704ed3187f683b464e54c10e58b4cb653bda0";
const SPONSOR_ADDRESS = "0x7bda16775910109bd87aef69fcb4cdeb8c3defbfd51332fd025252f7b2172aa3";

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

export default function CoinsPage() {
    const { account, connected, signTransaction } = useWallet();

    const [balances, setBalances] = useState([]);
    const [totalSupply, setTotalSupply] = useState("0");
    const [owner, setOwner] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const [fromAddress, setFromAddress] = useState("");
    // New state for transfer form
    const [transferTo, setTransferTo] = useState("");
    const [transferAmount, setTransferAmount] = useState("");

    // New state for reset form
    const [user1, setUser1] = useState("");
    const [user2, setUser2] = useState("");
    const [user3, setUser3] = useState("");

    useEffect(() => {
        if (connected && account?.address) {
            fetchAmount();
        }
    }, [account?.address, connected]);

    const fetchAmount = async () => {
        if (!account?.address) return;

        setLoading(true);
        try {
            console.log("Fetching from module address:", MODULE_ADDRESS);
            const resource = await aptos.getAccountResource({
                accountAddress: account.address,
                resourceType: `${MODULE_ADDRESS}::coins4::CoinStorage`,
            });

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

    const submitSponsoredTransaction = async (functionName, args = []) => {
        if (!account) return;
        setTransactionInProgress(true);
        
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
            await fetchAmount();
            
        } catch (error) {
            console.error(`Error in ${functionName}:`, error);
            setError(`${functionName} failed: ${error.message}`);
        } finally {
            setTransactionInProgress(false);
        }
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        if (!connected) return;
        await submitSponsoredTransaction('transfer', [fromAddress, transferTo, parseInt(transferAmount)]);
        setFromAddress("");
        setTransferTo("");
        setTransferAmount("");
    };

    const handleReset = async (e) => {
        e.preventDefault();
        if (!connected) return;

        setTransactionInProgress(true);
        try {
            const transaction = {
                function: `${MODULE_ADDRESS}::coins4::reset_state`,
                type_arguments: [],
                arguments: [user1, user2, user3],
            };

            await signTransaction(transaction);
            await fetchAmount(); // Refresh balances after reset
            setUser1("");
            setUser2("");
            setUser3("");
        } catch (error) {
            console.error("Reset failed:", error);
            setError("Reset failed: " + error.message);
        } finally {
            setTransactionInProgress(false);
        }
    };

    const handleRandomAdjust = async () => {
        if (!connected) return;
        await submitSponsoredTransaction('random_adjust_balance', []);
    };

    const formatAddress = (address) => {
        if (!address) return "";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    if (!connected) return null;

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">
                    GTA Coins Dashboard
                </h1>

                {loading ? (
                    <div className="text-center">
                        <p>Loading...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-red-600">{error}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Contract Info */}
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

                            {/* Transfer Form */}
                            <div className="border-t pt-4 mt-4">
                                <h3 className="text-lg font-semibold mb-4">Transfer Coins</h3>
                                <form onSubmit={handleTransfer} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            From Address
                                        </label>
                                        <input
                                            type="text"
                                            value={fromAddress}
                                            onChange={(e) => setFromAddress(e.target.value)}
                                            className="w-full p-2 border rounded"
                                            placeholder="0x..."
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            To Address
                                        </label>
                                        <input
                                            type="text"
                                            value={transferTo}
                                            onChange={(e) => setTransferTo(e.target.value)}
                                            className="w-full p-2 border rounded"
                                            placeholder="0x..."
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Amount
                                        </label>
                                        <input
                                            type="number"
                                            value={transferAmount}
                                            onChange={(e) => setTransferAmount(e.target.value)}
                                            className="w-full p-2 border rounded"
                                            placeholder="Amount"
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                        disabled={transactionInProgress}
                                    >
                                        Transfer
                                    </button>
                                </form>
                            </div>
                            {/* Add Random Adjust Button (Only visible to owner) */}
                            {account?.address === owner && (
                                <div className="border-t pt-4 mt-4">
                                    <h3 className="text-lg font-semibold mb-4">Random Balance Adjustment</h3>
                                    <button
                                        onClick={handleRandomAdjust}
                                        className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                                        disabled={transactionInProgress}
                                    >
                                        Randomly Adjust Balances
                                    </button>
                                </div>
                            )}
                            {/* Reset Form (Only visible to owner) */}
                            {account?.address === owner && (
                                <div className="border-t pt-4 mt-4">
                                    <h3 className="text-lg font-semibold mb-4">Reset Contract</h3>
                                    <form onSubmit={handleReset} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                User 1 Address
                                            </label>
                                            <input
                                                type="text"
                                                value={user1}
                                                onChange={(e) => setUser1(e.target.value)}
                                                className="w-full p-2 border rounded"
                                                placeholder="0x..."
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                User 2 Address
                                            </label>
                                            <input
                                                type="text"
                                                value={user2}
                                                onChange={(e) => setUser2(e.target.value)}
                                                className="w-full p-2 border rounded"
                                                placeholder="0x..."
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                User 3 Address
                                            </label>
                                            <input
                                                type="text"
                                                value={user3}
                                                onChange={(e) => setUser3(e.target.value)}
                                                className="w-full p-2 border rounded"
                                                placeholder="0x..."
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                            disabled={transactionInProgress}
                                        >
                                            Reset Contract
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Balances List */}
                            <h3 className="text-lg font-semibold mb-4 mt-6">All User Balances</h3>
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

                {transactionInProgress && (
                    <div className="fixed bottom-4 right-4 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg shadow">
                        Transaction in progress...
                    </div>
                )}
            </div>
        </div>
    );
}