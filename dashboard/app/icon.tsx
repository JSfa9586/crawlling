import { ImageResponse } from 'next/og';

// 이미지 메타데이터
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// 파비콘 생성
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #0066cc 0%, #0097a7 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '20%',
        }}
      >
        🌊
      </div>
    ),
    {
      ...size,
    }
  );
}
