import { NextResponse } from 'next/server';

const WMO_LABELS: Record<number, string> = {
  0: 'Ciel dégagé', 1: 'Principalement dégagé', 2: 'Partiellement nuageux', 3: 'Couvert',
  45: 'Brouillard', 48: 'Brouillard givrant',
  51: 'Bruine légère', 53: 'Bruine modérée', 55: 'Bruine dense',
  61: 'Pluie légère', 63: 'Pluie modérée', 65: 'Pluie forte',
  80: 'Averses légères', 81: 'Averses modérées', 82: 'Averses violentes',
  95: 'Orage', 96: 'Orage avec grêle',
};

export interface WeatherData {
  tmin: number;
  tmax: number;
  rain: number;
  wind: number;
  code: number;
  label: string;
  summary: string;
}

export async function GET() {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast' +
        '?latitude=16.17&longitude=-61.58' +
        '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode' +
        '&timezone=America%2FGuadeloupe&forecast_days=1',
      { next: { revalidate: 3600 } },
    );

    if (!res.ok) throw new Error(`open-meteo ${res.status}`);

    const data = await res.json();
    const d = data.daily;

    if (!d?.time?.length) throw new Error('no data');

    const tmax  = Math.round(d.temperature_2m_max[0]);
    const tmin  = Math.round(d.temperature_2m_min[0]);
    const rain  = d.precipitation_sum[0] as number;
    const wind  = Math.round(d.windspeed_10m_max[0]);
    const code  = d.weathercode?.[0] ?? 0;
    const label = WMO_LABELS[code] ?? 'Temps variable';

    const rainLabel =
      rain === 0  ? 'pas de pluie'
      : rain < 5  ? 'légère pluie'
      : rain < 20 ? 'pluie modérée'
      : 'fortes pluies';
    const windLabel =
      wind < 20 ? 'vent faible'
      : wind < 40 ? 'vent modéré'
      : 'vent fort';

    const summary = `${tmin}–${tmax}°C, ${rainLabel}, ${windLabel} (${wind} km/h)`;

    const payload: WeatherData = { tmin, tmax, rain, wind, code, label, summary };

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' },
    });
  } catch (err) {
    console.error('Weather route error:', err);
    return NextResponse.json(
      { error: 'Météo indisponible' },
      { status: 503 },
    );
  }
}
