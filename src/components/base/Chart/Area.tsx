import React from 'react';
import { LineChart, areaElementClasses, lineElementClasses } from '@mui/x-charts/LineChart';

interface AreaChartProps {
    categories: string[];
    series: { name: string; data: number[] }[];
    height: number;
}

export function AreaChart({ categories, series, height }: AreaChartProps) {
    const maxValue = Math.max(...series.flatMap((s) => s.data));
    const yMax = maxValue + maxValue * 0.25;

    return (
        <LineChart
            height={height}
            xAxis={[
                {
                    scaleType: 'point',
                    data: categories,
                },
            ]}
            yAxis={[
                {
                    max: yMax,
                },
            ]}
            series={series.map((s) => ({
                label: s.name,
                data: s.data,
                area: true,
                showMark: false,
                curve: 'monotoneX',
            }))}
            slotProps={{
                legend: {
                    position: { vertical: 'bottom', horizontal: 'center' },
                },
            }}
            margin={{ top: 20, right: 40, bottom: 10, left: 0 }}
            sx={{
                [`& .${areaElementClasses.root}`]: {
                    opacity: 0.25,
                },
                [`& .${lineElementClasses.root}`]: {
                    strokeWidth: 3,
                },
            }}
        />
    );
}
