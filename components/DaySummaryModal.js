import { useEffect, useState } from 'react';
import { PerformanceSparkline } from './PerformanceSparkline';
import styles from '../styles/DaySummaryModal.module.css';

export default function DaySummaryModal({ isOpen, onClose, dayData }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const renderAgentCard = (agentId, agent) => {
    const sparklineColors = {
      phil: '#8b5cf6',    // Purple
      iu: '#ec4899',      // Pink
      leonardo: '#10b981'  // Green
    };

    return (
      <div className={`${styles.summaryItem} ${styles[agentId]}`}>
        <h3>{agent.name}</h3>
        <p className={styles.agentSpecialty}>{agent.specialty}</p>
        <div className={styles.metrics}>
          <p>Earnings: <span className={styles.positive}>${agent.earnings.toFixed(2)}</span></p>
          <p>Losses: <span className={styles.negative}>${agent.losses.toFixed(2)}</span></p>
          <p>Net Profit: <span className={styles.positive}>${agent.netProfit.toFixed(2)}</span></p>
          <p>Success Rate: {agent.successRate}%</p>
          <p>Risk Score: {agent.riskScore}</p>
        </div>
        <div className={styles.sparkline}>
          <p className={styles.sparklineLabel}>Performance Trend</p>
          <PerformanceSparkline 
            data={agent.performanceHistory} 
            color={sparklineColors[agentId]}
          />
        </div>
      </div>
    );
  };

  const renderPlayerCard = (player) => (
    <div className={`${styles.summaryItem} ${styles.player}`}>
      <h3 className={styles.playerTitle}>You (The Player)</h3>
      <p className={styles.agentSpecialty}>Personal Trading Portfolio</p>
      <div className={styles.metrics}>
        <p>Earnings: <span className={styles.positive}>${player.earnings.toFixed(2)}</span></p>
        <p>Losses: <span className={styles.negative}>${player.losses.toFixed(2)}</span></p>
        <p>Net Profit: <span className={styles.positive}>${player.netProfit.toFixed(2)}</span></p>
        <p>Success Rate: {player.successRate}%</p>
        <p>Risk Score: {player.riskScore}</p>
      </div>
      <div className={styles.sparkline}>
        <p className={styles.sparklineLabel}>Performance Trend</p>
        <PerformanceSparkline data={player.performanceHistory} color="#FFD700" />
      </div>
    </div>
  );

  return (
    <div 
      className={`${styles.modalOverlay} ${isVisible ? styles.visible : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={styles.modalContainer}>
        <div>
          <h2 id="modal-title" className={styles.title}>Day Summary</h2>
          <p className={styles.subtitle}>
            Day {dayData.day} - {dayData.date}
          </p>
          
          <div className={styles.weatherInfo}>
            <span>Weather: {dayData.weather}</span>
            <span>Market Sentiment: {dayData.marketSentiment}</span>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.summaryGrid}>
            {renderPlayerCard(dayData.player)}
            {renderAgentCard('phil', dayData.aiAgents.phil)}
            {renderAgentCard('iu', dayData.aiAgents.iu)}
            {renderAgentCard('leonardo', dayData.aiAgents.leonardo)}
          </div>

          <div className={styles.additionalInfo}>
            <h3>Additional Insights</h3>
            <div className={styles.insights}>
              <p>Biggest Transaction: ${dayData.biggestTransaction.amount.toFixed(2)} ({dayData.biggestTransaction.type})</p>
              <p>Top Agent: {dayData.topAgent.name} - {dayData.topAgent.successRate}% Success Rate</p>
              <p>Strategy: {dayData.topAgent.strategy}</p>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button 
              className={styles.primaryButton}
              onClick={onClose}
            >
              Continue to Next Day
            </button>
            <button 
              className={styles.secondaryButton}
              onClick={() => {/* Implement detailed report view */}}
            >
              View Detailed Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 