import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatDay, formatDateTime, formatNumber } from '../format'
import './WeatherChart.css'

const METRICS = {
  temp: { label: 'Temperature', unit: '°C', spokenUnit: 'degrees Celsius' },
  wind: { label: 'Wind speed', unit: 'm/s', spokenUnit: 'metres per second' },
  pressure: { label: 'Air pressure', unit: 'hPa', spokenUnit: 'hectopascal' },
}

function WeatherChart({ series }) {
    const [metric, setMetric] = useState('temp')
    const { label, unit, spokenUnit } = METRICS[metric]

    // One x-axis tick per day, placed at local midnight.
    const midnights = series
        .filter(item => new Date(item.time).getHours() === 0)
        .map(item => item.time)

    const values = series.map(item => item[metric]).filter(v => v != null)
    const summary = values.length
        ? `Hourly averages ranged from ${Math.min(...values)} to ${Math.max(...values)} ${spokenUnit}.`
        : 'No readings available.'

    return (
        <section className="chart-card" aria-labelledby="chart-heading">
            <div className="chart-header">
                <div>
                    <h2 id="chart-heading">{label}, last 4 days</h2>
                    <p className="chart-subtitle">Hourly averages</p>
                </div>
                <div className="segmented" role="group" aria-label="Chart metric">
                    {Object.entries(METRICS).map(([key, m]) => (
                        <button
                            key={key}
                            type="button"
                            aria-pressed={metric === key}
                            onClick={() => setMetric(key)}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="chart" role="img" aria-label={`Area chart of ${label.toLowerCase()} at Troll over the last 4 days. ${summary}`}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                        <defs>
                            <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" className="chart-fill-top" />
                                <stop offset="100%" className="chart-fill-bottom" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="time"
                            ticks={midnights}
                            tickFormatter={formatDay}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            tickFormatter={formatNumber}
                            unit={` ${unit}`}
                            width={72}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            labelFormatter={formatDateTime}
                            formatter={(v) => [`${formatNumber(v)} ${unit}`, label]}
                            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
                            labelStyle={{ color: 'var(--muted)' }}
                            cursor={{ stroke: 'var(--muted)', strokeDasharray: '3 3' }}
                        />
                        <Area
                            key={metric}
                            type="monotone"
                            dataKey={metric}
                            name={label}
                            className="chart-area"
                            fill="url(#chart-fill)"
                            baseValue="dataMin"
                            strokeWidth={2}
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </section>
    )
}

export default WeatherChart
