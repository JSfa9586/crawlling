'use client';

import Link from 'next/link';

interface G2BItem {
    구분: string;
    카테고리: string;
    공고명: string;
    발주기관: string;
    등록일?: string;
    공고일?: string;
    링크: string;
    등록번호?: string;
    공고번호?: string;
    공고차수?: string;
}

interface RecentG2BPostsProps {
    data: G2BItem[];
    isLoading?: boolean;
}

export function RecentG2BPosts({ data, isLoading = false }: RecentG2BPostsProps) {
    const getG2BLink = (item: G2BItem) => {
        if (item.구분 === '사전규격') {
            if (item.등록번호) {
                return `https://www.g2b.go.kr/link/PRCA001_04/single/?srch=${item.등록번호}&flag=cnrtSl`;
            }
        } else {
            if (item.공고번호) {
                const rawSeq = item.공고차수 || '0';
                const seq = rawSeq.toString().padStart(3, '0');
                return `https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=${item.공고번호}&bidPbancOrd=${seq}`;
            }
        }
        return item.링크 || '#';
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 h-full flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-purple-50 text-purple-700 border-purple-200">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🏛️</span>
                    <h2 className="text-lg font-bold">나라장터 (G2B)</h2>
                </div>
                <Link
                    href="/g2b"
                    className="text-sm font-medium hover:underline opacity-80 hover:opacity-100 transition-opacity"
                >
                    더보기 →
                </Link>
            </div>

            <div className="flex-1 p-0">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">
                        <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
                        <p className="text-sm">로딩 중...</p>
                    </div>
                ) : data.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        게시물이 없습니다.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {data.slice(0, 5).map((item, index) => (
                            <li key={index} className="hover:bg-gray-50 transition-colors">
                                <a
                                    href={getG2BLink(item)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block px-6 py-3"
                                >
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                        <div className="flex gap-1 shrink-0">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${item.구분 === '사전규격' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'
                                                }`}>
                                                {item.구분}
                                            </span>
                                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                                {item.카테고리}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400 shrink-0">
                                            {(item.등록일 || item.공고일 || '').split(' ')[0]}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-900 line-clamp-1" title={item.공고명}>
                                        {item.공고명}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                        {item.발주기관}
                                    </p>
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
