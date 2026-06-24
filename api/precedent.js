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
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const url = `https://www.law.go.kr/DRF/lawSearch.do?OC=clearlaw&target=prec&type=JSON&query=${encodeURIComponent(query)}&display=3&sort=ddes`;
    const response = await fetch(url);
    const data = await response.json();

    const precList = data?.PrecSearch?.prec || [];
    const result = Array.isArray(precList) ? precList : [precList];

    const filtered = result.map(p => ({
      사건명: p.사건명 || '',
      사건번호: p.사건번호 || '',
      선고일자: p.선고일자 || '',
      법원명: p.법원명 || '',
      링크: `https://www.law.go.kr/DRF/lawService.do?OC=clearlaw&target=prec&ID=${p.판례일련번호}&type=HTML&mobileYn=Y`,
    }));

    return new Response(JSON.stringify({ prec: filtered }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });

  } catch (e) {
    return new Response(JSON.stringify({ prec: [] }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }
}
