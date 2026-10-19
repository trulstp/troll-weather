# Troll Weather Station

Web application displaying weather data from Troll Research Station, Antarctica.

## Getting started

Requires Node.js 20.19+ or 22.12+ (needed by Vite 8).

```bash
git clone https://github.com/trulstp/polar_oppgave.git
cd polar_oppgave
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## What is shown

- Current temperature, wind speed, humidity and air pressure
- Temperature trend chart over the last 4 days

Data is fetched from the Norsk Polarinstitutt OpenSearch API.

## Data loading and caching

- **Server-side aggregation** — instead of downloading every per-minute reading
  (~7000 documents, ~4.7 MB), the app asks OpenSearch for the latest reading plus
  hourly temperature averages (`date_histogram`), about 12 KB.
- **Stale-while-revalidate cache** — the response is stored in `localStorage`.
  On repeat visits the page renders instantly from the cache, and refreshes in
  the background when the data is older than 5 minutes.
- **Auto-refresh** — while the page is open, data is refreshed every 5 minutes.
- If a refresh fails, the last saved readings stay visible with a notice.
- `preconnect` to the API host so the connection is opened while JS loads.

## Libraries

**Recharts** — used for the temperature chart. Chosen because it is built 
natively for React, has a straightforward API and good documentation. 

## Accessibility

- Semantic HTML elements (main, section, dl/dt/dd for measurements)
- Units are spelled out for screen readers (e.g. "degrees Celsius")
- Missing readings are shown as "–" and announced as "Not available"
- The chart has a text alternative (min/max/latest temperature)
- Responsive layout using flexbox — works on mobile and desktop

## Known limitations and notes

- The chart shows hourly averages, not every individual measurement
- The chart is a summary for screen readers — individual data points are not exposed

## Lighthouse scores (production build)

Measured with `npm run build && npm run preview`, Lighthouse 12, headless Chrome:

| Category | Score |
|---|---|
| Performance | 95 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

Total page weight is ~173 KiB. Before switching to aggregated queries the
weather request alone was ~4.7 MB.
