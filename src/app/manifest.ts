import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '8-Ball Africa',
    short_name: '8-Ball',
    description: 'Premium pool tables, cues, and accessories for players across Africa.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B1020',
    theme_color: '#0D3B66',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
