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
    const url = `https://www.law.go.kr/DRF/lawSearch.do?OC=clearlaw&target=prec&type=XML&query=${encodeURIComponent(query)}&display=3&sort=ddes`;
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
      return {
        사건명: getTag(b, '사건명'),
        사건번호: getTag(b, '사건번호'),
        선고일자: getTag(b, '선고일자'),
        법원명: getTag(b, '법원명'),
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
