const API_URL = 'https://app.npolar.no/opensearch/weather-troll-station/_search'

// Ask OpenSearch for the latest reading plus hourly temperature averages,
// instead of downloading every per-minute document (~4.7 MB → ~12 KB).
const QUERY = {
  size: 1,
  sort: [{ measured: { order: 'desc' } }],
  _source: ['measured', 'TA1_0', 'FF0_0', 'UU0_0', 'PO0_0'],
  query: { range: { measured: { gte: 'now-4d' } } },
  aggs: {
    hourly: {
      date_histogram: { field: 'measured', fixed_interval: '1h' },
      aggs: { temp: { avg: { field: 'TA1_0' } } },
    },
  },
}

export async function fetchWeather() {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(QUERY),
  })
  if (!response.ok) throw new Error(`Error: ${response.status}`)
  const result = await response.json()

  return {
    latest: result.hits.hits[0]?._source ?? null,
    temps: result.aggregations.hourly.buckets.map((b) => ({
      time: b.key_as_string,
      temp: b.temp.value == null ? null : Math.round(b.temp.value * 10) / 10,
    })),
  }
}
