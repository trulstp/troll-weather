import { WEATHER_URL } from './api'
import { FORECAST_URL } from './forecast'

// Data sources with their localStorage cache key and max age. Shared by the app
// and by vite.config.js, which uses them to start fetching early (see preload there).
export const SOURCES = {
  // The station reports every minute; refreshing every 5 minutes is plenty.
  weather: { url: WEATHER_URL, key: 'troll-weather:v2', maxAge: 5 * 60 * 1000 },
  // MET updates the forecast about once an hour.
  forecast: { url: FORECAST_URL, key: 'troll-weather:forecast:v2', maxAge: 30 * 60 * 1000 },
}
