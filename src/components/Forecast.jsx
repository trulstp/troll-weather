import { describeSymbol } from '../symbols'
import { formatNumber, formatWeekday, stationTime } from '../format'
import './Forecast.css'

function Forecast({ forecast, error }) {
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

  return (
    <section className="forecast-card" aria-labelledby="forecast-heading">
      <div className="forecast-header">
        <h2 id="forecast-heading">Forecast, next {forecast.days.length} days</h2>
        <p className="forecast-subtitle">From MET Norway – the same forecast as Yr</p>
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
        <tbody>
          {forecast.days.map((day) => {
            const description = describeSymbol(day.symbol)
            return (
              <tr key={day.date}>
                <th scope="row">{day.date === today ? 'Rest of today' : formatWeekday(day.date)}</th>
                <td>
                  {day.symbol ? (
                    <img
                      className="forecast-icon"
                      src={`weather-icons/${day.symbol}.svg`}
                      alt={description}
                      title={description}
                      width="40"
                      height="40"
                      loading="lazy"
                    />
                  ) : '–'}
                </td>
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
            )
          })}
        </tbody>
      </table>
    </section>
  )
}

export default Forecast
