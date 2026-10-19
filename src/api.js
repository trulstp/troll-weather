const API_URL = 'https://app.npolar.no/opensearch/weather-troll-station/_search'

// Ask OpenSearch for the latest reading, hourly averages and the 24-hour
// temperature range, instead of downloading every per-minute document
// (~4.7 MB → ~15 KB).
const QUERY = {
  size: 1,
  sort: [{ measured: { order: 'desc' } }],
  _source: ['measured', 'TA1_0', 'FF0_0', 'FG0_0', 'DD0_0', 'UU0_0', 'PO0_0'],
  query: { range: { measured: { gte: 'now-4d' } } },
  aggs: {
    hourly: {
      date_histogram: { field: 'measured', fixed_interval: '1h' },
      aggs: {
        temp: { avg: { field: 'TA1_0' } },
        wind: { avg: { field: 'FF0_0' } },
        pressure: { avg: { field: 'PO0_0' } },
      },
    },
    last24h: {
      filter: { range: { measured: { gte: 'now-24h' } } },
      aggs: {
        min: { min: { field: 'TA1_0' } },
        max: { max: { field: 'TA1_0' } },
      },
    },
  },
}

const round1 = (v) => (v == null ? null : Math.round(v * 10) / 10)

export function parseResponse(result) {
  const { hourly, last24h } = result.aggregations
  return {
    latest: result.hits.hits[0]?._source ?? null,
    series: hourly.buckets.map((b) => ({
      time: b.key_as_string,
      temp: round1(b.temp.value),
      wind: round1(b.wind.value),
      pressure: round1(b.pressure.value),
    })),
    range24h: { min: round1(last24h.min.value), max: round1(last24h.max.value) },
  }
}

export async function fetchWeather() {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(QUERY),
  })
  if (!response.ok) throw new Error(`Error: ${response.status}`)
  return parseResponse(await response.json())
}
