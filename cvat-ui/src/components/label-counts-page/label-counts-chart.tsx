// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import {
    Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, ChartOptions, ChartData,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

import { SerializedLabelCounts } from 'cvat-core-wrapper';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

// Height per label row; bars are capped thinner than this so rows stay readable.
const ROW_HEIGHT = 22;
const X_AXIS_HEIGHT = 32;

// Colors and font come from styles.scss through CSS custom properties on the wrapper.
function cssValue(chart: ChartJS, name: string): string {
    return getComputedStyle(chart.canvas).getPropertyValue(`--label-counts-${name}`).trim();
}

function tickFont({ chart }: { chart: ChartJS }): { family: string } {
    return { family: getComputedStyle(chart.canvas).fontFamily };
}

const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    // Hovering anywhere on a label's row shows its tooltip, not only the bar itself.
    interaction: { mode: 'index', axis: 'y', intersect: false },
    // One series, so the page title names it. Set explicitly because another CVAT chart
    // imports chart.js/auto, which registers the legend plugin globally.
    plugins: { legend: { display: false } },
    scales: {
        x: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: ({ chart }) => cssValue(chart, 'grid') },
            ticks: {
                precision: 0,
                color: ({ chart }) => cssValue(chart, 'text-secondary'),
                font: tickFont,
            },
        },
        y: {
            grid: { display: false },
            ticks: {
                autoSkip: false,
                color: ({ chart }) => cssValue(chart, 'text'),
                font: tickFont,
            },
        },
    },
};

interface Props {
    labels: SerializedLabelCounts['labels'];
}

function LabelCountsChart({ labels }: Props): JSX.Element {
    const sorted = [...labels].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    const data: ChartData<'bar'> = {
        labels: sorted.map((label) => label.name),
        datasets: [{
            label: 'Annotations',
            data: sorted.map((label) => label.count),
            backgroundColor: ({ chart }) => cssValue(chart, 'bar'),
            borderRadius: 4,
            maxBarThickness: 14,
        }],
    };

    return (
        <div
            className='cvat-label-counts-chart'
            style={{ height: sorted.length * ROW_HEIGHT + X_AXIS_HEIGHT }}
        >
            <Bar options={options} data={data} />
        </div>
    );
}

export default React.memo(LabelCountsChart);
