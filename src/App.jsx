import { lazy, Suspense } from "react";
import CurrentConditions from "./components/CurrentConditions";
import WhenVisible from "./components/WhenVisible";
import Forecast from "./components/Forecast";
import { useCachedData } from "./useCachedData";
import { fetchWeather } from "./api";
import { fetchForecast } from "./forecast";
import { SOURCES } from "./sources";
import { useNow } from "./useNow";
import { formatDateTime, formatRelative } from "./format";
import './index.css';

// The chart library (Recharts) is most of the JavaScript, and the chart is below the
// fold – load it separately, and only when the visitor scrolls near it.
const WeatherChart = lazy(() => import("./components/WeatherChart"));
const chartPlaceholder = <div className="chart-placeholder" aria-hidden="true" />;

const STALE_AFTER = 30 * 60 * 1000

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
        {/* CC BY 4.0 requires credit, a link to the licence and a note that the data was changed. */}
        <p>
          Measurements: <a href="https://doi.org/10.21334/npolar.2017.79d4b7c7">Norwegian Polar
          Institute</a> (Norsk Polarinstitutt). Forecast: based on data from{' '}
          <a href="https://api.met.no/">MET Norway</a>. Both licensed under{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>; shown here as
          hourly averages and daily summaries. Weather icons ©{' '}
          <a href="https://github.com/metno/weathericons">Yr</a> (MIT).
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
  const { data, loading, error } = useCachedData(SOURCES.weather.key, fetchWeather, SOURCES.weather.maxAge)
  const forecast = useCachedData(SOURCES.forecast.key, fetchForecast, SOURCES.forecast.maxAge)
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
      <WhenVisible placeholder={chartPlaceholder}>
        <Suspense fallback={chartPlaceholder}>
          <WeatherChart series={data.series} />
        </Suspense>
      </WhenVisible>
    </Shell>
  )
}

export default App
