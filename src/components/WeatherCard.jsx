import './WeatherCard.css'

function WeatherCard({ latest }) {
  const measurements = [
    { label: 'Temperature', value: latest.TA1_0, unit: '°C', spoken: 'degrees Celsius' },
    { label: 'Wind speed', value: latest.FF0_0, unit: 'm/s', spoken: 'metres per second' },
    { label: 'Humidity', value: latest.UU0_0, unit: '%', spoken: 'percent' },
    { label: 'Air pressure', value: latest.PO0_0, unit: 'hPa', spoken: 'hectopascal' },
  ]

  return (
    <dl className="cards" aria-label="Current weather measurements">
      {measurements.map((m) => (
        <div key={m.label} className="card">
          <dt className="card-label">{m.label}</dt>
          <dd className="card-value">
            {m.value == null ? (
              <>
                <span aria-hidden="true">–</span>
                <span className="visually-hidden">Not available</span>
              </>
            ) : (
              <>
                {m.value}{' '}
                <span className="card-unit" aria-hidden="true">{m.unit}</span>
                <span className="visually-hidden">{m.spoken}</span>
              </>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export default WeatherCard
