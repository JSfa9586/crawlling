/**
 * 날짜 문자열(KST or ISO)을 입력받아 만료 여부를 반환
 */
export function isExpired(dateStr: string | undefined): boolean {
    if (!dateStr) return false;
    try {
        const dateOnly = dateStr.split(' ')[0];
        const endDate = new Date(dateOnly);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return endDate < today;
    } catch {
        return false;
    }
}

/**
 * 금액 문자열을 보기 좋게 변환 (억, 만 단위)
 */
export function formatMoney(amount: string | undefined): string {
    if (!amount || amount === '0') return '-';
    // 숫자 이외의 문자 제거
    const cleanAmount = amount.replace(/[^0-9]/g, '');
    const num = parseInt(cleanAmount, 10);

    if (isNaN(num)) return '-';

    if (num >= 100000000) {
        return `${(num / 100000000).toFixed(1)}억원`;
    } else if (num >= 10000) {
        return `${Math.round(num / 10000).toLocaleString()}만원`;
    }
    return `${num.toLocaleString()}원`;
}

/**
 * 날짜 문자열을 짧은 형식(MM/DD(요일) HH:mm)으로 변환
 */
export function formatDateTime(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr.split(' ')[0];

        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dayOfWeek = days[date.getDay()];
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${month}/${day}(${dayOfWeek}) ${hours}:${minutes}`;
    } catch (e) {
        return dateStr.split(' ')[0];
    }
}
