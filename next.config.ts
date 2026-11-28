import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
        ],
      },
      {
        // lukisan tidak berubah antar rilis kecuali namanya ikut berubah: browser menyimpannya 30 hari, jadi lukisan
        // yang ISINYA diubah wajib diberi NAMA BARU (mis. bg-kereta-malam menggantikan bg-anniversary), kalau tidak
        // pengunjung lama terus melihat versi lamanya
        source: '/art/:file*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }],
      },
    ];
  },
};

export default config;
