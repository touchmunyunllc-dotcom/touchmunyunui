import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartCardProps {
  title: string;
  data: Array<{
    date: string;
    [key: string]: string | number | undefined;
  }>;
  dataKey: string;
  color: string;
  type?: 'line' | 'bar';
  formatValue?: (value: number) => string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  data,
  dataKey,
  color,
  type = 'line',
  formatValue,
}) => {
  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const ChartComponent = type === 'bar' ? BarChart : LineChart;
  const DataComponent = type === 'bar' ? Bar : Line;

  return (
    <div className="group relative bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-6 md:p-8 border border-foreground/10 hover:border-foreground/30 transition-all duration-500 overflow-hidden">
      {/* Premium gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-button to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
      
      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6 group-hover:text-button transition-colors duration-300">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(233, 239, 241, 0.1)" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            stroke="rgba(233, 239, 241, 0.6)"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="rgba(233, 239, 241, 0.6)"
            style={{ fontSize: '12px' }}
            tickFormatter={formatValue || ((val) => val.toString())}
          />
          <Tooltip 
            formatter={(value: any) => formatValue ? formatValue(value) : value}
            labelFormatter={(label) => `Date: ${formatDate(label)}`}
            contentStyle={{ 
              backgroundColor: 'rgba(18, 18, 20, 0.95)', 
              border: '1px solid rgba(233, 239, 241, 0.2)',
              borderRadius: '12px',
              padding: '12px',
              backdropFilter: 'blur(10px)',
              color: '#E9EFF1'
            }}
            labelStyle={{ color: '#E9EFF1' }}
          />
          <Legend 
            wrapperStyle={{ color: '#E9EFF1', paddingTop: '20px' }}
          />
          <DataComponent 
            type={type === 'bar' ? 'monotone' : undefined}
            dataKey={dataKey} 
            stroke={color} 
            fill={type === 'bar' ? color : undefined}
            strokeWidth={3}
            dot={{ fill: color, r: 5, strokeWidth: 2, stroke: 'rgba(18, 18, 20, 0.8)' }}
            activeDot={{ r: 8, stroke: color, strokeWidth: 2 }}
          />
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

