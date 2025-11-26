import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Vercel 배포를 위한 환경 변수 설정
  env: {
    // NEXT_PUBLIC_* 변수는 자동으로 클라이언트에 노출됨
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  },

  // 서버 사이드에서 googleapis 사용 허용
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },

  // Vercel에서의 빌드 타임아웃 설정
  // 기본값: 60초, 최대: 900초 (15분)
  // Google Sheets API 호출이 있으므로 적절히 증가
  output: "standalone",
};

export default nextConfig;
