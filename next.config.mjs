/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  basePath: '/horoscope-ia',
  images: {
    unoptimized: true,
  },
}

export default nextConfig
