import { LineChart, Line, ResponsiveContainer } from 'recharts';

export function PerformanceSparkline({ data, color = "#3b82f6" }) {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <LineChart data={data}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2.5}
          dot={false}
          style={{
            filter: `drop-shadow(0 0 3px ${color})`
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
} 