export interface WeatherContext {
  humidity: number
  aqi: number        // 1=Boa 2=Razoável 3=Moderada 4=Ruim 5=Péssima
  description: string
  villain: string | null
}

export async function fetchWeatherContext(lat: number, lng: number): Promise<WeatherContext | null> {
  const key = import.meta.env.VITE_OPENWEATHER_API_KEY
  if (!key) return null

  try {
    const [weatherRes, aqiRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${key}&units=metric&lang=pt_br`),
      fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${key}`),
    ])

    if (!weatherRes.ok || !aqiRes.ok) return null

    const [weather, aqiData] = await Promise.all([weatherRes.json(), aqiRes.json()])

    const humidity: number = weather.main.humidity as number
    const aqi: number = (aqiData.list[0].main.aqi as number)

    // Identify the active villain based on conditions
    let villain: string | null = null
    if (aqi >= 4)         villain = 'Polu-Monstro'
    else if (humidity < 30) villain = 'Dona Secura'
    else if (aqi >= 3)    villain = 'General Poeira'

    return {
      humidity,
      aqi,
      description: weather.weather[0].description as string,
      villain,
    }
  } catch {
    return null
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' } },
    )
    if (!res.ok) throw new Error('geocode failed')
    const data = await res.json() as { address?: Record<string, string> }
    const addr = data.address ?? {}
    return (
      addr['suburb'] ??
      addr['neighbourhood'] ??
      addr['city_district'] ??
      addr['town'] ??
      addr['city'] ??
      `${lat.toFixed(3)}, ${lng.toFixed(3)}`
    )
  } catch {
    return `${lat.toFixed(3)}, ${lng.toFixed(3)}`
  }
}
