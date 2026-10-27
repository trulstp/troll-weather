import CurrentConditions from "./components/CurrentConditions";
import WeatherChart from "./components/WeatherChart";
import Forecast from "./components/Forecast";
import { useCachedData } from "./useCachedData";
import { fetchWeather } from "./api";
import { fetchForecast } from "./forecast";
import { useNow } from "./useNow";
import { formatDateTime, formatRelative } from "./format";
import './index.css';

const STALE_AFTER = 30 * 60 * 1000
// The station reports every minute; refreshing every 5 minutes is plenty.
const WEATHER_MAX_AGE = 5 * 60 * 1000
// MET updates the forecast about once an hour.
const FORECAST_MAX_AGE = 30 * 60 * 1000

function Shell({ children }) {
  return (
    <>
      <main>
        <header className="page-header">
          <p className="eyebrow">
            <svg className="logo" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2v20M4 6.5l16 11M4 17.5l16-11M9.5 3.5 12 6l2.5-2.5M9.5 20.5 12 18l2.5 2.5" />
            </svg>
            Dronning Maud Land, Antarctica
          </p>
          <h1>Troll Weather Station</h1>
        </header>
        {children}
      </main>
      <footer className="page-footer">
        <p>
          Data from the <a href="https://www.npolar.no/en/">Norwegian Polar Institute</a> (Norsk
          Polarinstitutt). Forecast from <a href="https://api.met.no/">MET Norway</a> (CC BY 4.0),
          weather icons by <a href="https://github.com/metno/weathericons">Yr</a> (MIT).
        </p>
        <p>Troll research station · 72.0° S, 2.5° E · ~1,270 m above sea level.</p>
        <p>
          <a href="https://github.com/trulstp/troll-weather">Source code on GitHub</a>
        </p>
      </footer>
    </>
  )
}

function App() {
  const { data, loading, error } = useCachedData('troll-weather:v2', fetchWeather, WEATHER_MAX_AGE)
  const forecast = useCachedData('troll-weather:forecast:v1', fetchForecast, FORECAST_MAX_AGE)
  const now = useNow()

  if (loading) return <Shell><p className="status" aria-live="polite">Loading weather data…</p></Shell>
  if (!data) return <Shell><p className="status" role="alert">Something went wrong: {error}</p></Shell>
  if (!data.latest) return <Shell><p className="status" role="status">No weather data from the last 4 days.</p></Shell>

  const measured = data.latest.measured
  const isStale = now - new Date(measured).getTime() > STALE_AFTER

  return (
    <Shell>
      <p className={isStale ? 'updated updated-stale' : 'updated'}>
        <span className="live-dot" aria-hidden="true" />
        <span>
          Updated <time dateTime={measured} title={formatDateTime(measured)}>{formatRelative(measured, now)}</time>
        </span>
      </p>
      {error && <p className="notice" role="status">Could not refresh data ({error}). Showing the last saved readings.</p>}
      <CurrentConditions latest={data.latest} series={data.series} range24h={data.range24h} />
      <Forecast forecast={forecast.data} error={forecast.error} />
      <WeatherChart series={data.series} />
    </Shell>
  )
}

export default App
