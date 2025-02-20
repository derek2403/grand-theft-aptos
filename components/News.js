import { useState } from 'react';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network, Account } from "@aptos-labs/ts-sdk";
import Image from 'next/image';

// Initialize Aptos client with same constants as coins.js
const MODULE_ADDRESS = "0x42cbb5d8dada99304869c2466fb0f90c40b55f323554438acd540fc397976704";
const SPONSOR_ADDRESS = "0x7bda16775910109bd87aef69fcb4cdeb8c3defbfd51332fd025252f7b2172aa3";
const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

export function News() {
    const { account, connected, signTransaction } = useWallet();
    const [headlines, setHeadlines] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const goodEvents = [
        "won the lottery",
        "made a successful investment",
        "received an inheritance",
        "found treasure",
        "got a promotion",
        "started a successful business"
    ];

    const badEvents = [
        "lost in a bad investment",
        "had unexpected expenses",
        "got scammed",
        "had to pay a fine",
        "made a costly mistake",
        "faced market losses"
    ];

    const fetchBalances = async () => {
        try {
            const resource = await aptos.getAccountResource({
                accountAddress: account.address,
                resourceType: `${MODULE_ADDRESS}::coins4::CoinStorage`,
            });
            return resource.balances || [];
        } catch (error) {
            console.error("Error fetching balances:", error);
            return [];
        }
    };

    const submitRandomAdjust = async () => {
        if (!account) return;
        
        try {
            // 1. Build transaction
            const transaction = await aptos.transaction.build.simple({
                sender: account.address,
                withFeePayer: true,
                data: {
                    function: `${MODULE_ADDRESS}::coins4::random_adjust_balance`,
                    functionArguments: [],
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
            
        } catch (error) {
            console.error("Error in random adjust:", error);
            throw error;
        }
    };

    const generateAIContent = async (change, isPositive, address) => {
        try {
            const response = await fetch('/api/generate-news', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    change, 
                    isPositive, 
                    address
                }),
            });
            
            if (!response.ok) throw new Error('Failed to generate news content');
            const data = await response.json();

            return {
                story: data.story
            };

        } catch (error) {
            console.error('Error generating AI content:', error);
            return {
                story: "Breaking news update..."
            };
        }
    };

    const generateNews = async () => {
        if (!connected || isGenerating) return;
        
        setIsGenerating(true);
        try {
            const beforeBalances = await fetchBalances();
            await submitRandomAdjust();
            const afterBalances = await fetchBalances();
            
            const newsPromises = beforeBalances.map(async (before) => {
                const after = afterBalances.find(b => b.user === before.user);
                if (!after) return null;
                
                const change = after.amount - before.amount;
                if (change === 0) return null;

                const aiContent = await generateAIContent(
                    Math.abs(change),
                    change > 0,
                    before.user
                );

                if (!aiContent) return null;

                return {
                    address: before.user,
                    change: Math.abs(change),
                    isPositive: change > 0,
                    story: aiContent.story,
                    timestamp: new Date().toLocaleTimeString()
                };
            });

            const newsItems = (await Promise.all(newsPromises)).filter(Boolean);
            // Add new items to the end and maintain only 4 items
            setHeadlines(prev => [...prev, ...newsItems].slice(-4));

        } catch (error) {
            console.error("Failed to generate news:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const formatAddress = (address) => {
        if (!address) return "";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    if (!connected) return null;

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 w-[1280px]">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                        GN
                    </div>
                    <h2 className="text-xl font-bold">GTA News Network</h2>
                </div>
                <button
                    onClick={generateNews}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-medium"
                >
                    {isGenerating ? "Generating..." : "Breaking News"}
                </button>
            </div>
            
            <div className="flex justify-between gap-4">
                {headlines.slice(0, 4).map((headline, index) => (
                    <div 
                        key={index}
                        className="bg-white rounded-lg shadow overflow-hidden w-[300px]"
                    >
                        <div className="relative h-32 w-full">
                            <Image
                                src={`/news/${index + 1}.png`}
                                alt="News illustration"
                                width={300}
                                height={128}
                                className="object-cover w-full h-full"
                                priority
                            />
                        </div>
                        <div className="p-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>{formatAddress(headline.address)}</span>
                                <span>{headline.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-800 font-medium line-clamp-2">
                                {headline.story}
                            </p>
                            <div className={`mt-1 text-sm font-medium ${
                                headline.isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {headline.isPositive ? '+' : '-'}{headline.change} GTA Coins
                            </div>
                        </div>
                    </div>
                ))}
                
                {headlines.length === 0 && (
                    <div className="flex items-center justify-center w-full">
                        <p className="text-gray-500 text-center py-8">No recent news</p>
                    </div>
                )}
                
                {/* Placeholder boxes when there are fewer than 4 headlines */}
                {headlines.length > 0 && headlines.length < 4 && (
                    [...Array(4 - headlines.length)].map((_, index) => (
                        <div 
                            key={`placeholder-${index}`}
                            className="bg-gray-100 rounded-lg shadow overflow-hidden w-[300px] h-[200px] animate-pulse"
                        />
                    ))
                )}
            </div>
        </div>
    );
} 