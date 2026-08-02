export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || '';

  if (!query) {
    return new Response(JSON.stringify({ prec: [] }), {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    });
  }

  try {
    // search=2: 본문 검색 (기본값은 사건명만 검색해서 "임금체불" 같은 키워드가 0건이 됨)
    const url = `https://www.law.go.kr/DRF/lawSearch.do?OC=clearlaw&target=prec&type=XML&query=${encodeURIComponent(query)}&display=3&sort=ddes&search=2`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/xml',
        'Referer': 'https://www.law.go.kr',
      },
    });
    const text = await response.text();

    const getTag = (str, tag) => {
      const match = str.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return match ? match[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
    };

    const precBlocks = [...text.matchAll(/<prec\s[^>]*>([\s\S]*?)<\/prec>/g)];

    const filtered = precBlocks.map(block => {
      const b = block[1];
      const id = getTag(b, '판례일련번호');
      const caseNo = getTag(b, '사건번호');
      // 법제처 데이터 일부(국세법령정보시스템 출처)는 법원명 태그가 빈 값 → 사건번호 앞부분에서 추출
      let court = getTag(b, '법원명');
      if (!court) {
        const m = caseNo.match(/^([가-힣]+법원(?:[가-힣]*지원)?)/);
        if (m) court = m[1];
      }
      return {
        사건명: getTag(b, '사건명'),
        사건번호: caseNo,
        선고일자: getTag(b, '선고일자'),
        법원명: court,
        링크: `https://www.law.go.kr/DRF/lawService.do?OC=clearlaw&target=prec&ID=${id}&type=HTML&mobileYn=Y`,
      };
    });

    return new Response(JSON.stringify({ prec: filtered }), {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    });

  } catch (e) {
    return new Response(JSON.stringify({ prec: [] }), {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    });
  }
}
