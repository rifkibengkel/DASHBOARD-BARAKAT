import * as React from 'react';
import { PieChart as PieChartMUI } from '@mui/x-charts/PieChart';
import { legendClasses } from '@mui/x-charts/ChartsLegend';

interface PieChartProps {
    label: string[];
    series: number[];
    height: number;
}

export function PieChart({ label, series, height }: PieChartProps) {
    const data = label.map((name, i) => ({
        id: i,
        value: series[i] ?? 0,
        label: name,
    }));

    return (
        <PieChartMUI
            height={height - 35}
            series={[{ data }]}
            slotProps={{
                legend: {
                    position: { vertical: 'top', horizontal: 'end' },
                    direction: 'vertical',
                    sx: {
                        display: 'flex',
                        flexWrap: 'wrap',
                        overflowY: 'auto',
                        maxWidth: '200px',
                        gap: 1.5,
                        justifyContent: 'flex-start',
                        [`.${legendClasses.series}`]: {
                            alignItems: 'start',
                        },

                        [`.${legendClasses.mark}`]: {
                            width: 12,
                            height: 12,
                            borderRadius: '2px',
                            flexShrink: 0,
                        },

                        [`.${legendClasses.label}`]: {
                            lineHeight: 1.2,
                        },
                    },
                },
            }}
            margin={{ top: 20, bottom: 50 }}
        />
    );
}
