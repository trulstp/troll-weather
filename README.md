# Troll Weather Station

Live weather dashboard for the Norwegian **Troll research station** in Dronning Maud Land,
Antarctica, built with React. Live measurements come from the Norwegian Polar Institute and
the 7-day forecast from MET Norway (the same forecast as Yr).

**[Live demo →](https://trulstp.github.io/troll-weather/)**

![Troll Weather Station dashboard in light mode](docs/light.png)

<p>
  <img src="docs/dark.png" alt="Dashboard in dark mode" width="64%">
  <img src="docs/phone.png" alt="Dashboard on a phone" width="28%">
</p>

## Features

- **Current conditions** — temperature with 24-hour low/high and trend, wind chill
  ("feels like") when it applies, wind speed with direction and gusts, humidity and air pressure
- **7-day forecast** — weather symbol, low/high, precipitation and max wind per day;
  expand a day to see it in 6-hour periods
- **4-day chart** of hourly averages, switchable between temperature, wind and pressure
- **Live** — refreshes every 5 minutes while the tab is visible, shows "Updated 3 minutes ago" and flags stale data
- **Light and dark mode** following the system setting
- **Responsive** layout from phone to desktop
- **Accessible** — semantic markup, a real data table for the forecast, units spelled out for
  screen readers, keyboard-operable controls and checked colour contrast

## How it works

- **Measurements** are fetched with a single OpenSearch query that returns the latest reading,
  hourly averages (`date_histogram`) and the 24-hour min/max (`filter` aggregation), so the
  browser downloads about 15 KB instead of every per-minute reading. See [`src/api.js`](src/api.js).
- **Forecast** data from MET Norway is hourly for the first ~2.5 days and 6-hourly after that.
  [`src/forecast.js`](src/forecast.js) combines the overlapping precipitation blocks without
  counting anything twice, groups the data by day in station time and picks a midday symbol
  for each day.
- **Caching** — both sources use [`src/useCachedData.js`](src/useCachedData.js), a
  stale-while-revalidate hook backed by `localStorage`. Repeat visits render instantly from the
  cache, refreshes happen in the background, and refreshing pauses while the tab is hidden.
  If a refresh fails, the last data stays on screen with a notice.
- **Page load** — the chart library is loaded only when the chart scrolls into view, and when
  the cache is stale the data requests start alongside the HTML instead of waiting for the
  JavaScript (see [`vite.config.js`](vite.config.js)).

## Getting started

Requires Node.js 20.19+ or 22.12+.

```bash
git clone https://github.com/trulstp/troll-weather.git
cd troll-weather
npm install
npm run dev
```

Open http://localhost:5173.

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm test` | Run the unit tests (Vitest) |
| `npm run lint` | Lint with ESLint |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |

Every push runs lint, tests and build in GitHub Actions; pushes to `main` are deployed
to GitHub Pages.

## Project structure

```
src/
├── api.js                 OpenSearch query and response parsing (measurements)
├── forecast.js            MET Norway forecast fetch and per-day aggregation
├── sources.js             API URLs, cache keys and max ages (also used by vite.config.js)
├── useCachedData.js       Data hook with localStorage cache and visibility-aware refresh
├── symbols.js             Weather symbol descriptions (from metno/weathericons)
├── weather.js             Wind chill, compass direction, temperature trend
├── format.js              Station time zone, dates, relative time, numbers
├── useNow.js              Ticking clock for "updated X minutes ago"
├── components/
│   ├── CurrentConditions  Hero temperature and secondary measurements
│   ├── Forecast           7-day forecast table with expandable 6-hour periods
│   ├── WhenVisible        Renders children only when scrolled near (lazy chart)
│   └── WeatherChart       4-day chart with metric switcher
└── *.test.js              Unit tests
```

## Tech

React 19 · Vite 8 · Recharts · Vitest · ESLint · GitHub Actions / Pages

## Notes

- The station has no precipitation gauge, so precipitation comes from the forecast only.
  In this polar desert it is usually 0 mm, falling as light snow when it does occur.
- Times and dates are shown in station time (`Antarctica/Troll`, UTC+0 or UTC+2).
- The chart shows hourly averages; the cards show the latest per-minute reading.
- Wind chill uses the North American / UK formula and is only shown for wind above 4.8 km/h.
- The low air pressure (~840 hPa) is expected: Troll lies about 1,270 m above sea level.

## Data and licences

| Source | Licence |
|---|---|
| [Troll meteorological data](https://doi.org/10.21334/npolar.2017.79d4b7c7), Norwegian Polar Institute | CC BY 4.0 |
| [Locationforecast](https://api.met.no/weatherapi/locationforecast/2.0/documentation), MET Norway | CC BY 4.0 / NLOD 2.0 |
| [Weather icons](https://github.com/metno/weathericons), © Yr | MIT |

The site sets no cookies and has no analytics; `localStorage` only holds cached weather data.
