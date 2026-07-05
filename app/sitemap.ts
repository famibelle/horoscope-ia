import type { MetadataRoute } from 'next';
import { signs } from '@/lib/signs-data';
import { ARTICLES } from '@/lib/articles-data';

const BASE_URL = 'https://zodyak-karukera.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                                   lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/a-propos`,                     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/articles`,                     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/contact`,                      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/newsletter`,                   lastModified: now, changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${BASE_URL}/politique-de-confidentialite`, lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/mentions-legales`,             lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/cgu`,                          lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ];

  const signPages: MetadataRoute.Sitemap = signs.map((sign) => ({
    url: `${BASE_URL}/horoscope/${sign.id}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  const articlePages: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: `${BASE_URL}/articles/${article.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticPages, ...signPages, ...articlePages];
}
