export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || '상속세';

  const url = `https://www.law.go.kr/DRF/lawSearch.do?OC=clearlaw&target=prec&type=XML&query=${encodeURIComponent(query)}&display=3&sort=ddes`;
  const response = await fetch(url);
  const text = await response.text();

  return new Response(text, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/plain',
    },
  });
}
