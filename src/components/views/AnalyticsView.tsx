import React, { useEffect, useState } from 'react';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';

export const AnalyticsView: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [data, setData] = useState(Array.from({ length: 20 }, (_, i) => ({
    time: i,
    usage: Math.random() * 100
  })));

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev.slice(1)];
        newData.push({
          time: prev[prev.length - 1].time + 1,
          usage: Math.max(0, Math.min(100, prev[prev.length - 1].usage + (Math.random() - 0.5) * 20))
        });
        return newData;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const color = isDarkMode ? '#509ff1' : '#186fee';

  return (
    <div className="w-full h-full flex flex-col p-2">
      <div className="text-[11px] font-bold mb-1 opacity-70">CPU USAGE (%)</div>
      <div className="flex-1 w-full -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <YAxis domain={[0, 100]} hide />
            <Line 
              type="monotone" 
              dataKey="usage" 
              stroke={color} 
              strokeWidth={2} 
              dot={false} 
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="text-[10px] mt-1 text-center opacity-50">Real-time stats</div>
    </div>
  );
};
