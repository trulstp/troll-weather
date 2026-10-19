# Troll Weather Station

Live weather dashboard for the Norwegian **Troll research station** in Dronning Maud Land,
Antarctica, built with React and data from the Norwegian Polar Institute.

**[Live demo →](https://trulstp.github.io/troll-weather/)**

![Troll Weather Station dashboard in light mode](docs/light.png)

<p>
  <img src="docs/dark.png" alt="Dashboard in dark mode" width="64%">
  <img src="docs/phone.png" alt="Dashboard on a phone" width="28%">
</p>

## Features

- **Current conditions** — temperature with 24-hour low/high and trend, wind chill
  ("feels like") when it applies, wind speed with direction and gusts, humidity and air pressure
- **4-day chart** of hourly averages, switchable between temperature, wind and pressure
- **Live** — refreshes every 5 minutes, shows "Updated 3 minutes ago" and flags stale data
- **Light and dark mode** following the system setting
- **Responsive** layout from phone to desktop

## Engineering highlights

### ~400× smaller data payload

The first version downloaded every per-minute reading for the last four days
(~7000 documents, **~4.7 MB, ~2.2 s**) and then threw most of them away to draw the chart.
It now lets OpenSearch do the work: one query returns the latest reading, hourly averages
(`date_histogram`) and the 24-hour min/max (`filter` aggregation) — **~15 KB in ~0.2 s**.
See [`src/api.js`](src/api.js).

### Stale-while-revalidate caching

Responses are cached in `localStorage`. Repeat visits render instantly from the cache and
refresh in the background once the data is more than 5 minutes old. If a refresh fails, the
last readings stay on screen with a notice instead of an error page. Storage errors (private
mode, full quota, corrupted entries) are handled and covered by tests.
See [`src/useWeatherData.js`](src/useWeatherData.js).

### Accessibility

- Semantic structure: landmarks, a logical heading outline, `dl`/`dt`/`dd` for measurements
- Units spelled out for screen readers ("−20.4 degrees Celsius", not "°C")
- Missing sensor readings shown as "–" and announced as "Not available"
- Chart has a text alternative with its range; metric switcher uses `aria-pressed`
- Visible focus styles, no motion, colour contrast checked in both themes

### Lighthouse (production build)

| Performance | Accessibility | Best Practices | SEO |
|:---:|:---:|:---:|:---:|
| 92–95 | 100 | 100 | 100 |

Total page weight is ~180 KB. Measured with Lighthouse 12 in headless Chrome against
`npm run build && npm run preview`.

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
├── api.js                 OpenSearch query and response parsing
├── useWeatherData.js      Data hook with localStorage cache and auto-refresh
├── weather.js             Wind chill, compass direction, temperature trend
├── format.js              Date, relative time and number formatting
├── useNow.js              Ticking clock for "updated X minutes ago"
├── components/
│   ├── CurrentConditions  Hero temperature and secondary measurements
│   └── WeatherChart       4-day chart with metric switcher
└── *.test.js              Unit tests
```

## Tech

React 19 · Vite 8 · Recharts · Vitest · ESLint · GitHub Actions / Pages

**Recharts** was chosen for the chart because it is built for React, has a
declarative API and good documentation.

## Notes

- The chart shows hourly averages; the cards show the latest per-minute reading.
- Wind chill uses the North American / UK formula and is only shown for wind above 4.8 km/h.
- The low air pressure (~840 hPa) is expected: Troll lies about 1,270 m above sea level.

Data: [Norwegian Polar Institute](https://www.npolar.no/en/) open weather API.
