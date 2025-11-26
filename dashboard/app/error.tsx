'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('애플리케이션 오류:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">오류 발생</h2>
        <p className="text-gray-600 mb-6">
          {error.message || '예상치 못한 오류가 발생했습니다.'}
        </p>
        {error.digest && (
          <p className="text-xs text-gray-500 mb-6 font-mono bg-gray-100 p-2 rounded">
            Error ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
