const item_1 = { 공고번호: 'R25BK01206972', 공고차수: '0' };
const item_2 = { 공고번호: 'R25BK01206972', 공고차수: '00' };
const item_3 = { 공고번호: 'R25BK01206972', 공고차수: undefined };
const item_4 = { 공고번호: 'R25BK01206972', 공고차수: '1' };

function getBidLink(item) {
    if (item.공고번호) {
        const rawSeq = item.공고차수 || '00';
        // Logic from g2b/page.tsx check:
        // const rawSeq = item.공고차수 || '0';
        // const seq = rawSeq.padStart(3, '0');

        // Let's replicate EXACTLY what I wrote in the file:
        const rawSeqActual = item.공고차수 || '0';
        const seq = rawSeqActual.toString().padStart(3, '0');
        return `https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=${item.공고번호}&bidPbancOrd=${seq}`;
    }
    return 'No Link';
}

console.log("Item 1 (Seq '0'):", getBidLink(item_1));
console.log("Item 2 (Seq '00'):", getBidLink(item_2));
console.log("Item 3 (Seq undefined):", getBidLink(item_3));
console.log("Item 4 (Seq '1'):", getBidLink(item_4));
