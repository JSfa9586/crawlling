interface Organization {
  name: string;
  url?: string;
  boards: {
    type: string;
    url: string;
  }[];
}

const organizations: Record<string, Organization[]> = {
  '본부': [
    {
      name: '해양수산부',
      url: 'https://www.mof.go.kr',
      boards: [
        { type: '공지사항', url: 'https://www.mof.go.kr/doc/ko/selectDocList.do?menuSeq=375&bbsSeq=9' },
        { type: '입찰', url: 'https://www.mof.go.kr/doc/ko/selectDocList.do?menuSeq=379&bbsSeq=13' },
        { type: '인사', url: 'https://www.mof.go.kr/doc/ko/selectDocList.do?menuSeq=380&bbsSeq=14' }
      ]
    }
  ],
  '어업관리단': [
    {
      name: '동해어업관리단',
      url: 'https://eastship.mof.go.kr',
      boards: [
        { type: '인사발령', url: 'https://eastship.mof.go.kr/ko/board.do?menuIdx=265' }
      ]
    },
    {
      name: '남해어업관리단',
      url: 'https://southship.mof.go.kr',
      boards: [
        { type: '인사발령', url: 'https://southship.mof.go.kr/ko/board.do?menuIdx=766' }
      ]
    }
  ],
  '지방청': [
    {
      name: '부산지방해양수산청',
      url: 'https://busan.mof.go.kr',
      boards: [
        { type: '공지사항', url: 'https://busan.mof.go.kr/ko/board.do?menuIdx=4468' },
        { type: '입찰', url: 'https://busan.mof.go.kr/ko/board.do?menuIdx=4469' },
        { type: '인사발령', url: 'https://busan.mof.go.kr/ko/board.do?menuIdx=4470' }
      ]
    },
    {
      name: '인천지방해양수산청',
      url: 'https://incheon.mof.go.kr',
      boards: [
        { type: '공지사항', url: 'https://incheon.mof.go.kr/ko/board.do?menuIdx=1688' },
        { type: '입찰', url: 'https://incheon.mof.go.kr/ko/board.do?menuIdx=1690' },
        { type: '인사발령', url: 'https://incheon.mof.go.kr/ko/board.do?menuIdx=1693' }
      ]
    },
    {
      name: '여수지방해양수산청',
      url: 'https://yeosu.mof.go.kr',
      boards: [
        { type: '공지사항', url: 'https://yeosu.mof.go.kr/ko/board.do?menuIdx=3807' },
        { type: '입찰', url: 'https://yeosu.mof.go.kr/ko/board.do?menuIdx=3808' },
        { type: '인사발령', url: 'https://yeosu.mof.go.kr/ko/board.do?menuIdx=4148' }
      ]
    },
    {
      name: '마산지방해양수산청',
      url: 'https://masan.mof.go.kr',
      boards: [
        { type: '공지사항', url: 'https://masan.mof.go.kr/ko/board.do?menuIdx=2307' },
        { type: '입찰', url: 'https://masan.mof.go.kr/ko/board.do?menuIdx=2309' },
        { type: '인사발령', url: 'https://masan.mof.go.kr/ko/board.do?menuIdx=2314' }
      ]
    },
    {
      name: '울산지방해양수산청',
      url: 'https://ulsan.mof.go.kr',
      boards: [
        { type: '공지사항', url: 'https://ulsan.mof.go.kr/ko/board.do?menuIdx=868' },
        { type: '입찰', url: 'https://ulsan.mof.go.kr/ko/board.do?menuIdx=872' },
        { type: '인사발령', url: 'https://ulsan.mof.go.kr/ko/board.do?menuIdx=877' }
      ]
    },
    {
      name: '동해지방해양수산청',
      url: 'https://donghae.mof.go.kr',
      boards: [
        { type: '공지사항', url: 'https://donghae.mof.go.kr/ko/board.do?menuIdx=2532' },
        { type: '입찰', url: 'https://donghae.mof.go.kr/ko/board.do?menuIdx=2534' },
        { type: '인사발령', url: 'https://donghae.mof.go.kr/ko/board.do?menuIdx=2539' }
      ]
    },
    {
      name: '군산지방해양수산청',
      url: 'https://gunsan.mof.go.kr',
      boards: [
        { type: '공지사항', url: 'https://gunsan.mof.go.kr/ko/board.do?menuIdx=1111' },
        { type: '입찰', url: 'https://gunsan.mof.go.kr/ko/board.do?menuIdx=1113' },
        { type: '인사발령', url: 'https://gunsan.mof.go.kr/ko/board.do?menuIdx=1120' }
      ]
    },
    {
      name: '목포지방해양수산청',
      url: 'https://mokpo.mof.go.kr',
      boards: [
        { type: '공지사항', url: 'https://mokpo.mof.go.kr/ko/board.do?menuIdx=1312' },
        { type: '입찰', url: 'https://mokpo.mof.go.kr/ko/board.do?menuIdx=1314' }
      ]
    },
    {
      name: '포항지방해양수산청',
      url: 'https://pohang.mof.go.kr',
      boards: [
        { type: '공지사항', url: 'https://pohang.mof.go.kr/ko/board.do?menuIdx=2848' },
        { type: '입찰', url: 'https://pohang.mof.go.kr/ko/board.do?menuIdx=2853' },
        { type: '인사발령', url: 'https://pohang.mof.go.kr/ko/board.do?menuIdx=2858' }
      ]
    },
    {
      name: '평택지방해양수산청',
      url: 'https://pyeongtaek.mof.go.kr',
      boards: [
        { type: '공지사항', url: 'https://pyeongtaek.mof.go.kr/ko/board.do?menuIdx=2122' },
        { type: '입찰', url: 'https://pyeongtaek.mof.go.kr/ko/board.do?menuIdx=2125' },
        { type: '인사발령', url: 'https://pyeongtaek.mof.go.kr/ko/board.do?menuIdx=2129' }
      ]
    },
    {
      name: '대산지방해양수산청',
      url: 'https://daesan.mof.go.kr',
      boards: [
        { type: '공지사항', url: 'https://daesan.mof.go.kr/ko/board.do?menuIdx=3016' },
        { type: '입찰', url: 'https://daesan.mof.go.kr/ko/board.do?menuIdx=3018' },
        { type: '인사발령', url: 'https://daesan.mof.go.kr/ko/board.do?menuIdx=3021' }
      ]
    }
  ],
  '공단': [
    {
      name: '해양환경공단',
      url: 'https://www.koem.or.kr',
      boards: [
        { type: '공지사항', url: 'https://www.koem.or.kr/site/koem/ex/board/List.do?cbIdx=236' }
      ]
    }
  ],
  '항만공사': [
    {
      name: '부산항만공사',
      url: 'https://www.busanpa.com',
      boards: [
        { type: '공지사항', url: 'https://www.busanpa.com/kor/Board.do?mCode=MN1439' },
        { type: '입찰', url: 'https://www.busanpa.com/kor/Board.do?mCode=MN1259' }
      ]
    },
    {
      name: '인천항만공사',
      url: 'https://www.icpa.or.kr',
      boards: [
        { type: '공지사항', url: 'https://www.icpa.or.kr/article/list.do?boardKey=213&menuKey=397' },
        { type: '입찰', url: 'https://www.icpa.or.kr/article/list.do?boardKey=213&menuKey=397' }
      ]
    },
    {
      name: '울산항만공사',
      url: 'https://www.upa.or.kr',
      boards: [
        { type: '공지사항', url: 'https://www.upa.or.kr/portal/board/post/list.do?bcIdx=676&mid=0601000000' },
        { type: '입찰', url: 'https://www.upa.or.kr/portal/board/post/list.do?bcIdx=685&mid=0605080100' }
      ]
    }
  ],
  '지자체': [
    {
      name: '제주특별자치도',
      url: 'https://www.jeju.go.kr',
      boards: [
        { type: '공지사항', url: 'https://www.jeju.go.kr/news/news/news.htm' },
        { type: '입법,고시,공고', url: 'https://www.jeju.go.kr/news/news/law/jeju2.htm' }
      ]
    }
  ]
};

export function CrawlingLinks() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">모니터링 중인 게시판</h2>

      <div className="space-y-8">
        {Object.entries(organizations).map(([category, orgs]) => (
          <div key={category}>
            <h3 className="text-lg font-medium text-blue-600 mb-4 border-b-2 border-blue-100 pb-2">
              {category} ({orgs.length}개 기관)
            </h3>

            <div className="space-y-4">
              {orgs.map((org) => (
                <div key={org.name} className="pl-4 border-l-2 border-gray-200">
                  <div className="mb-2">
                    <a
                      href={org.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 font-medium hover:text-blue-600 transition-colors"
                    >
                      {org.name}
                    </a>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {org.boards.map((board) => (
                      <a
                        key={board.type}
                        href={board.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                      >
                        {board.type}
                        <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          총 <span className="font-medium text-blue-600">{Object.values(organizations).flat().length}개 기관</span>의 게시판을 모니터링하고 있습니다.
        </p>
      </div>
    </div>
  );
}
