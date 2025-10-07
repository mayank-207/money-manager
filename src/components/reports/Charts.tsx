import React, { useEffect, useRef } from 'react';

interface BaseChartProps {
  width?: number | string;
  height?: number | string;
}

interface SeriesPoint {
  label: string;
  value: number;
}

interface BarChartProps extends BaseChartProps {
  data: SeriesPoint[];
  color?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, color = '#0A84FF', width = '100%', height = 240 }) => {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="h-full" style={{ width, height }}>
      <div className="flex h-full items-end justify-between">
        {data.map((d, i) => {
          const h = (d.value / max) * 100;
          return (
            <div key={i} className="flex flex-col items-center flex-1">
              <div className="relative w-full flex justify-center mb-2">
                <div className="w-4/5 max-w-[40px] rounded-t-md" style={{ background: color, height: `${h}%` }} />
              </div>
              <div className="text-xs font-medium text-[#86868B] truncate w-full text-center">{d.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface LineChartProps extends BaseChartProps {
  data: SeriesPoint[];
  color?: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data, color = '#5E5CE6', width = '100%', height = 240 }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const min = Math.min(0, ...data.map((d) => d.value));
  const padding = 16;
  const w = 600;
  const h = typeof height === 'number' ? height : 240;
  const points = data.map((d, i) => {
    const x = padding + (i * (w - padding * 2)) / Math.max(1, data.length - 1);
    const y = h - padding - ((d.value - min) / Math.max(1, max - min)) * (h - padding * 2);
    return `${x},${y}`;
  });
  return (
    <div style={{ width, height }}>
      <svg ref={svgRef} viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
        <polyline fill="none" stroke={color} strokeWidth="3" points={points.join(' ')} />
      </svg>
      <div className="flex justify-between text-xs text-[#86868B] mt-1">
        {data.map((d, i) => (
          <span key={i} className="truncate">{d.label}</span>
        ))}
      </div>
    </div>
  );
};

interface PieChartProps extends BaseChartProps {
  data: SeriesPoint[];
  colors?: string[];
}

export const PieChart: React.FC<PieChartProps> = ({ data, colors = ['#0A84FF', '#5E5CE6', '#30D158', '#FF9F0A', '#FF453A'], width = 240, height = 240 }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  const radius = 100;
  const center = 120;
  return (
    <svg viewBox="0 0 240 240" width={width} height={height} className="mx-auto">
      {data.map((d, i) => {
        const value = total === 0 ? 0 : d.value / total;
        const startAngle = cumulative * 2 * Math.PI;
        cumulative += value;
        const endAngle = cumulative * 2 * Math.PI;
        const x1 = center + radius * Math.cos(startAngle);
        const y1 = center + radius * Math.sin(startAngle);
        const x2 = center + radius * Math.cos(endAngle);
        const y2 = center + radius * Math.sin(endAngle);
        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
        const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        return <path key={i} d={pathData} fill={colors[i % colors.length]} />;
      })}
    </svg>
  );
};


