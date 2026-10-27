import { windChill, compassDirection, temperatureTrend } from '../weather'
import { formatNumber } from '../format'
import './CurrentConditions.css'

function Trend({ delta }) {
  if (delta == null) return null
  if (delta === 0) return <span>Same as 24 h ago</span>
  const warmer = delta > 0
  return (
    <span className={warmer ? 'trend trend-up' : 'trend trend-down'}>
      <span aria-hidden="true">{warmer ? '↑' : '↓'} {formatNumber(Math.abs(delta))}° vs 24 h ago</span>
      <span className="visually-hidden">
        {Math.abs(delta)} degrees {warmer ? 'warmer' : 'colder'} than 24 hours ago
      </span>
    </span>
  )
}

function Stat({ label, value, unit, spokenUnit, children }) {
  return (
    <div className="stat">
      <dt>{label}</dt>
      <dd>
        {value == null ? (
          <>
            <span className="stat-value" aria-hidden="true">–</span>
            <span className="visually-hidden">Not available</span>
          </>
        ) : (
          <>
            <span className="stat-value">{formatNumber(value)}</span>
            <span className="stat-unit" aria-hidden="true">{unit}</span>
            <span className="visually-hidden">{spokenUnit}</span>
          </>
        )}
        {children && <span className="stat-note">{children}</span>}
      </dd>
    </div>
  )
}

function CurrentConditions({ latest, series, range24h }) {
  const temp = latest.TA1_0
  const feelsLike = windChill(temp, latest.FF0_0)
  const direction = compassDirection(latest.DD0_0)
  const trend = temperatureTrend(series, latest)

  return (
    <section className="conditions" aria-labelledby="conditions-heading">
      <h2 id="conditions-heading" className="visually-hidden">Current conditions</h2>

      <div className="hero">
        <p className="hero-temp">
          {temp == null ? (
            <>
              <span aria-hidden="true">–</span>
              <span className="visually-hidden">Temperature not available</span>
            </>
          ) : (
            <>
              <span className="visually-hidden">Temperature </span>
              {formatNumber(temp.toFixed(1))}
              <span className="hero-unit" aria-hidden="true">°C</span>
              <span className="visually-hidden"> degrees Celsius</span>
            </>
          )}
        </p>
        {feelsLike != null && (
          <p className="hero-feels">Feels like {formatNumber(feelsLike)} °C with wind chill</p>
        )}
        <p className="hero-range">
          {range24h.min != null && (
            <span>
              Last 24 h: low {formatNumber(range24h.min)}°, high {formatNumber(range24h.max)}°
            </span>
          )}
          <Trend delta={trend} />
        </p>
      </div>

      <dl className="stats">
        <Stat label="Wind" value={latest.FF0_0} unit="m/s" spokenUnit="metres per second">
          {direction && (
            <>
              <svg
                className="wind-arrow"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                {/* DD is where the wind comes from; the arrow points where it blows to. */}
                <path d="M8 1 L13 13 L8 10 L3 13 Z" transform={`rotate(${latest.DD0_0 + 180} 8 8)`} />
              </svg>
              from {direction}
              {latest.FG0_0 != null && <>, gusts {formatNumber(latest.FG0_0)} m/s</>}
            </>
          )}
        </Stat>
        <Stat label="Humidity" value={latest.UU0_0} unit="%" spokenUnit="percent" />
        <Stat label="Air pressure" value={latest.PO0_0} unit="hPa" spokenUnit="hectopascal">
          Low because Troll lies ~1,270 m above sea level
        </Stat>
      </dl>
    </section>
  )
}

export default CurrentConditions
