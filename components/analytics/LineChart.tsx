import React, { useState } from 'react';

interface ChartData {
    date: string;
    value: number;
}

interface LineChartProps {
    data: ChartData[];
    width?: number;
    height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({ data, width = 600, height = 300 }) => {
    const [tooltip, setTooltip] = useState<{ x: number, y: number, data: ChartData } | null>(null);
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    
    if (data.length < 2) return null;

    const PADDING = 40;
    const chartWidth = width - PADDING * 2;
    const chartHeight = height - PADDING * 2;

    const maxValue = Math.max(...data.map(d => d.value));
    const xScale = chartWidth / (data.length - 1);
    const yScale = chartHeight / maxValue;

    const pathData = data.map((point, i) => {
        const x = i * xScale;
        const y = chartHeight - (point.value * yScale);
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
    }).join(' ');
    
    const areaPathData = `${pathData} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const svgRect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX - svgRect.left - PADDING;
        
        const index = Math.round(mouseX / xScale);
        
        if(index >= 0 && index < data.length) {
            const point = data[index];
            const x = index * xScale + PADDING;
            const y = chartHeight - (point.value * yScale) + PADDING;
            setTooltip({ x, y, data: point });
        }
    };
    
    const handleMouseLeave = () => {
        setTooltip(null);
    };
    
    const yAxisLabels = [];
    for (let i = 0; i <= 4; i++) {
        const value = (maxValue / 4) * i;
        yAxisLabels.push({
            value: `SLL ${value > 1000 ? `${(value/1000).toFixed(1)}k` : Math.round(value)}`,
            y: chartHeight - (value * yScale)
        });
    }

    const xAxisLabels = data.length > 7
      ? [data[0], data[Math.floor(data.length / 2)], data[data.length - 1]]
      : data;


    return (
        <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="w-full h-auto">
                <g transform={`translate(${PADDING}, ${PADDING})`}>
                    {/* Y-axis grid lines and labels */}
                    {yAxisLabels.map((label, i) => (
                        <g key={i}>
                            <text
                                x={-10}
                                y={label.y}
                                textAnchor="end"
                                alignmentBaseline="middle"
                                fontSize="12"
                                fill={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                            >
                                {label.value}
                            </text>
                            {i > 0 && (
                               <line
                                  x1={0}
                                  y1={label.y}
                                  x2={chartWidth}
                                  y2={label.y}
                                  stroke={theme === 'dark' ? '#374151' : '#E5E7EB'}
                                  strokeWidth="1"
                                />
                            )}
                        </g>
                    ))}
                    
                    {/* X-axis labels */}
                     {xAxisLabels.map((point, i) => {
                        let actualIndex = data.findIndex(d => d.date === point.date);
                        return (
                          <text
                            key={i}
                            x={actualIndex * xScale}
                            y={chartHeight + 20}
                            textAnchor="middle"
                            fontSize="12"
                            fill={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                          >
                            {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </text>
                        )
                     })}

                    {/* Gradient for area */}
                    <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0078D4" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#0078D4" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={areaPathData} fill="url(#areaGradient)" />
                    
                    {/* The line */}
                    <path d={pathData} fill="none" stroke="#0078D4" strokeWidth="2" />
                    
                    {/* Data points for hover */}
                     {data.map((point, i) => (
                        <circle
                            key={i}
                            cx={i * xScale}
                            cy={chartHeight - (point.value * yScale)}
                            r={tooltip?.data.date === point.date ? 6 : 4}
                            fill="#0078D4"
                            className="transition-all"
                        />
                    ))}
                </g>
            </svg>
            {tooltip && (
                <div 
                    className="absolute p-2 text-xs bg-gray-800 dark:bg-gray-900 text-white rounded-md shadow-lg pointer-events-none transition-transform duration-100"
                    style={{
                        left: `${tooltip.x}px`,
                        top: `${tooltip.y - 50}px`,
                        transform: `translateX(-50%)`,
                    }}
                >
                    <div>{new Date(tooltip.data.date).toLocaleDateString()}</div>
                    <div className="font-bold">SLL {new Intl.NumberFormat().format(tooltip.data.value)}</div>
                </div>
            )}
        </div>
    );
};
