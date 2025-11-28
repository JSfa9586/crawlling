/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // Server Components 외부 패키지 설정 (Next.js 16.0+)
  serverExternalPackages: ['googleapis'],

  // 환경 변수 설정
  env: {
    // 환경 변수는 자동으로 로드됨
    // .env.local, .env.production 등이 자동으로 사용됨
  },

  // 이미지 최적화 설정
  images: {
    unoptimized: true,
  },

  // Server Actions 설정 (파일 업로드 용량 증대)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // 헤더 설정 (캐시 정책)
  async headers() {
    return [
      {
        source: '/api/sheets',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
    ];
  },

  // 리다이렉트 설정
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
