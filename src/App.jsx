import WeatherCard from "./components/WeatherCard";
import WeatherChart from "./components/WeatherChart";
import { useWeatherData } from "./useWeatherData";
import { formatDateTime } from "./format";
import './index.css';

function App() {
  const { data, loading, error } = useWeatherData()

  if (loading) return <main><p aria-live="polite">Loading weather data...</p></main>
  if (!data) return <main><p role="alert">Something went wrong: {error}</p></main>
  if (!data.latest) return <main><p role="status">No weather data from the last 4 days.</p></main>

  return (

    <main>
      <h1>Troll Weather Station</h1>
      <p>Latest weather data from Troll Research Station, Antarctica</p>
      <p className="last-updated">{"Last updated: "}
        <time dateTime={data.latest.measured}>{formatDateTime(data.latest.measured)}</time>
      </p>
      {error && <p className="stale-warning" role="status">Could not refresh data ({error}). Showing the last saved readings.</p>}
      <section aria-label="Current weather at Troll Weather Station">
        <WeatherCard latest={data.latest}/>
      </section>
      <section aria-label="Temperature over the last 4 days">
        <WeatherChart temps={data.temps} latest={data.latest}/>
      </section>
    </main>
  )
}

export default App
