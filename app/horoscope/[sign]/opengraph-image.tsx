import { ImageResponse } from 'next/og';
import { signs } from '@/lib/signs-data';

export const alt = 'Horoscope Zodyak Karukera';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ sign: string }> }) {
  const { sign: signId } = await params;
  const sign = signs.find((s) => s.id === signId);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d0d1a',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 40%, rgba(212,175,80,0.15) 0%, transparent 65%)',
          }}
        />
        <div style={{ fontSize: 100, marginBottom: 24 }}>{sign?.emoji ?? '🌿'}</div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: '#D4AF50',
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          Horoscope {sign?.name ?? 'du jour'}
        </div>
        <div
          style={{
            fontSize: 22,
            color: 'rgba(200,216,192,0.7)',
            marginBottom: 32,
            textAlign: 'center',
          }}
        >
          {sign?.dateRange ?? ''}
        </div>
        <div
          style={{
            fontSize: 18,
            color: 'rgba(212,175,80,0.6)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          Zodyak Karukera
        </div>
      </div>
    ),
    { ...size },
  );
}
