import { ImageResponse } from 'next/og';
import { ARTICLES } from '@/lib/articles-data';

export const alt = 'Article Zodyak Karukera';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);

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
          padding: '60px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 30%, rgba(212,175,80,0.10) 0%, transparent 60%)',
          }}
        />
        <div style={{ fontSize: 16, color: 'rgba(212,175,80,0.5)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 32 }}>
          Zodyak Karukera, Contes ancestraux
        </div>
        <div
          style={{
            fontSize: 46,
            fontWeight: 700,
            color: '#C8D8C0',
            marginBottom: 24,
            textAlign: 'center',
            lineHeight: 1.3,
            maxWidth: 900,
          }}
        >
          {article?.title ?? 'Article'}
        </div>
        {article?.tag && (
          <div style={{ fontSize: 16, color: 'rgba(212,175,80,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            {article.tag}
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(90deg, transparent, rgba(212,175,80,0.4), transparent)',
          }}
        />
      </div>
    ),
    { ...size },
  );
}
