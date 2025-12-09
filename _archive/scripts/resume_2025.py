
import subprocess
import calendar
from datetime import datetime

def collect_month(year, month):
    """특정 월의 데이터 수집"""
    _, last_day = calendar.monthrange(year, month)
    start_date = f"{year}-{month:02d}-01"
    end_date = f"{year}-{month:02d}-{last_day}"
    
    # 미래 날짜 제한
    today = datetime.now().strftime("%Y-%m-%d")
    if start_date > today:
        return False
    if end_date > today:
        end_date = today
        
    print(f"\n{'='*50}")
    print(f"=== {year}년 {month}월 데이터 수집 시작 ({start_date} ~ {end_date}) ===")
    print(f"{'='*50}")
    
    cmd = ['python', 'c:\\AI\\251118 크롤링\\collect_contracts.py', 'range', start_date, end_date]
    try:
        # check=True로 설정하여 에러 발생 시 예외 처리
        subprocess.run(cmd, check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"!!! {month}월 수집 중 오류 발생: {e}")
        return False
    except KeyboardInterrupt:
        print("\n사용자에 의해 중단됨")
        return False

def resume_2025():
    year = 2025
    print(f"### 2025년 G2B 용역 계약 데이터 수집 재개 ###")
    
    # 1월부터 12월까지 순차 수집
    for month in range(1, 13):
        success = collect_month(year, month)
        if not success:
            # 미래 날짜 도달 또는 치명적 오류 시 중단? 
            # 호출된 프로세스가 성공적으로 끝나지 않았으면 중단할지 결정
            # 여기서는 에러나면 다음 달로 넘어갈지, 멈출지...
            # API 제한이면 멈추는게 맞음.
            pass

if __name__ == "__main__":
    resume_2025()
