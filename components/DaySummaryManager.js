import { useState, useEffect } from 'react';

export function useDaySummaryManager(timeState, weather) {
  const [showDaySummary, setShowDaySummary] = useState(false);

  useEffect(() => {
    if (timeState.hours === 23) { // 11 PM
      setShowDaySummary(true);
    }
  }, [timeState.hours]);

  const generateDayData = () => ({
    day: timeState.date.getDate(),
    date: timeState.date.toLocaleDateString('en-US', { 
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
    weather: weather,
    marketSentiment: 'Bullish',
    aiAgents: {
      phil: {
        name: "Phil (The Philosopher)",
        earnings: 2800.50,
        losses: 600.00,
        netProfit: 2200.50,
        transactionVolume: 12000,
        successRate: 82,
        riskScore: 45,
        specialty: "Long-term Value Investment",
        strategy: "Fundamental Analysis",
        performanceHistory: [
          { value: 2000 },
          { value: 2200 },
          { value: 2100 },
          { value: 2400 },
          { value: 2200 }
        ]
      },
      iu: {
        name: "IU (The Artist)",
        earnings: 3500.75,
        losses: 900.00,
        netProfit: 2600.75,
        transactionVolume: 18000,
        successRate: 78,
        riskScore: 75,
        specialty: "NFT Trading",
        strategy: "Trend Following",
        performanceHistory: [
          { value: 2400 },
          { value: 2800 },
          { value: 2600 },
          { value: 3000 },
          { value: 2600 }
        ]
      },
      leonardo: {
        name: "Leonardo (The Innovator)",
        earnings: 4200.25,
        losses: 1100.00,
        netProfit: 3100.25,
        transactionVolume: 20000,
        successRate: 85,
        riskScore: 65,
        specialty: "Tech & Innovation",
        strategy: "Growth Investment",
        performanceHistory: [
          { value: 2800 },
          { value: 3200 },
          { value: 3000 },
          { value: 3400 },
          { value: 3100 }
        ]
      }
    },
    player: {
      earnings: 5000.00,
      losses: 2000.00,
      netProfit: 3000.00,
      transactionVolume: 20000,
      successRate: 85,
      riskScore: 70,
      performanceHistory: [
        { value: 2800 },
        { value: 3200 },
        { value: 2900 },
        { value: 3400 },
        { value: 3000 }
      ]
    },
    market: {
      totalVolume: 100000,
      trending: 'Upward',
      volatility: 'Medium',
      opportunities: ['DeFi', 'NFTs', 'GameFi'],
      performanceHistory: [
        { value: 95000 },
        { value: 98000 },
        { value: 92000 },
        { value: 97000 },
        { value: 100000 }
      ]
    },
    biggestTransaction: {
      amount: 1500.00,
      type: 'Sale',
      parties: ['Player', 'Agent Alpha']
    },
    topAgent: {
      name: 'Leonardo',
      strategy: 'Growth Investment',
      successRate: 85
    }
  });

  return {
    showDaySummary,
    setShowDaySummary,
    dayData: generateDayData()
  };
} 