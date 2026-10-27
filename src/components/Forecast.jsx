import { useState } from 'react'
import { describeSymbol } from '../symbols'
import { formatNumber, formatWeekday, stationTime } from '../format'
import './Forecast.css'

function WeatherIcon({ symbol, size }) {
  if (!symbol) return '–'
  const description = describeSymbol(symbol)
  return (
    <img
      className="forecast-icon"
      src={`weather-icons/${symbol}.svg`}
      alt={description}
      title={description}
      width={size}
      height={size}
      loading="lazy"
    />
  )
}

/** '13–18', '18–24' – period start to the next period's start, in station time. */
function periodLabel(periods, i) {
  const pad = (h) => String(h).padStart(2, '0')
  const start = stationTime(periods[i].time).hour
  const end = periods[i + 1] ? stationTime(periods[i + 1].time).hour : Math.min(start + 6, 24)
  return `${pad(start)}–${pad(end)}`
}

function Periods({ day, label }) {
  return (
    <table className="period-table">
      <caption className="visually-hidden">6-hour forecast for {label}</caption>
      <thead>
        <tr>
          <th scope="col">Time</th>
          <th scope="col">Weather</th>
          <th scope="col">Temp.</th>
          <th scope="col">Precip.</th>
          <th scope="col">Wind</th>
        </tr>
      </thead>
      <tbody>
        {day.periods.map((p, i) => (
          <tr key={p.time}>
            <th scope="row">{periodLabel(day.periods, i)}</th>
            <td><WeatherIcon symbol={p.symbol} size={32} /></td>
            <td className={p.temp < 0 ? 'temp-low' : undefined}>{formatNumber(p.temp.toFixed(1))}°</td>
            <td className={p.precipitation > 0 ? 'precip precip-some' : 'precip'}>{formatNumber(p.precipitation)} mm</td>
            <td>{formatNumber(p.wind)} m/s</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Forecast({ forecast, error }) {
  const [open, setOpen] = useState(() => new Set())

  if (!forecast) {
    return (
      <section className="forecast-card" aria-labelledby="forecast-heading">
        <h2 id="forecast-heading">Forecast</h2>
        <p className="forecast-status" role={error ? 'alert' : 'status'}>
          {error ? `Could not load the forecast (${error}).` : 'Loading forecast…'}
        </p>
      </section>
    )
  }

  const today = stationTime(new Date().toISOString()).date
  const toggle = (date) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })

  return (
    <section className="forecast-card" aria-labelledby="forecast-heading">
      <div className="forecast-header">
        <h2 id="forecast-heading">Forecast, next {forecast.days.length} days</h2>
        <p className="forecast-subtitle">From MET Norway</p>
      </div>

      <table className="forecast-table">
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Weather</th>
            <th scope="col">Low / high</th>
            <th scope="col">Precipitation</th>
            <th scope="col">Max wind</th>
          </tr>
        </thead>
        {forecast.days.map((day) => {
          const label = day.date === today ? 'Rest of today' : formatWeekday(day.date)
          const isOpen = open.has(day.date)
          const detailsId = `periods-${day.date}`
          return (
            // One <tbody> per day keeps the summary row and its details together.
            <tbody key={day.date} className={isOpen ? 'day day-open' : 'day'}>
              {/* The button is the keyboard/screen reader control; clicks anywhere on the row bubble here too. */}
              <tr className="day-row" onClick={() => toggle(day.date)}>
                <th scope="row">
                  <button type="button" className="day-toggle" aria-expanded={isOpen} aria-controls={detailsId}>
                    <svg className="chevron" viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M6 3l5 5-5 5" />
                    </svg>
                    {label}
                  </button>
                </th>
                <td><WeatherIcon symbol={day.symbol} size={40} /></td>
                <td className="forecast-temps">
                  <span className="temp-low">{formatNumber(day.min.toFixed(1))}°</span>
                  <span aria-hidden="true"> / </span>
                  <span className="visually-hidden"> to </span>
                  <span className="temp-high">{formatNumber(day.max.toFixed(1))}°</span>
                </td>
                <td className={day.precipitation > 0 ? 'precip precip-some' : 'precip'}>
                  {formatNumber(day.precipitation)} mm
                </td>
                <td>{formatNumber(day.maxWind)} m/s</td>
              </tr>
              <tr id={detailsId} className="day-details" hidden={!isOpen}>
                <td colSpan={5}>
                  {isOpen && <Periods day={day} label={label} />}
                </td>
              </tr>
            </tbody>
          )
        })}
      </table>
    </section>
  )
}

export default Forecast
