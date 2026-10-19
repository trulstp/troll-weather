import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatDay, formatDateTime } from '../format'

function WeatherChart({ temps, latest }) {
    // One x-axis tick per day, placed at local midnight.
    const midnights = temps
        .filter(item => new Date(item.time).getHours() === 0)
        .map(item => item.time)

    const values = temps.map(item => item.temp).filter(t => t != null)
    const summary = values.length
        ? `Hourly averages ranged from ${Math.min(...values)} °C to ${Math.max(...values)} °C. Latest reading ${latest.TA1_0 ?? 'not available'} °C.`
        : 'No temperature readings available.'

        return (
            <>
            <div style={{ width: '100%', height: 300 }}
            role="img"
            aria-label="Line chart showing temperature at Troll Research Station over the last 4 days"
            >
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={temps}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                    dataKey="time"
                    ticks={midnights}
                    tickFormatter={formatDay}
                    />
                    <YAxis unit=" °C" width={64} />
                    <Tooltip labelFormatter={formatDateTime} formatter={(v) => [`${v} °C`, 'Temperature (hourly avg)']} />
                    <Line type="monotone" name="Temperature (°C)" dataKey="temp" stroke="#5b57c9" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
            </div>
            <p className="visually-hidden">Temperature over the last 4 days: {summary}</p>
            </>
        )
}

export default WeatherChart
