export const config = { runtime: 'edge' };

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS_CAP = 2000;

function jsonError(status, type, message) {
  return new Response(JSON.stringify({ error: { type, message } }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (req.method !== 'POST') return jsonError(405, 'invalid_request_error', 'POST 요청만 지원합니다.');

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, 'invalid_request_error', '잘못된 요청 형식입니다.');
  }

  // 허용된 필드만 통과 (제3자가 임의 파라미터로 API 크레딧을 소진하는 것 방지)
  const system = typeof body.system === 'string' ? body.system : undefined;
  const messages = Array.isArray(body.messages) ? body.messages : null;
  const max_tokens = Math.min(Math.max(parseInt(body.max_tokens, 10) || 1500, 1), MAX_TOKENS_CAP);
  const stream = body.stream === true;
  if (!messages || messages.length === 0) {
    return jsonError(400, 'invalid_request_error', 'messages가 필요합니다.');
  }

  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.REACT_APP_ANTHROPIC_KEY;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: MODEL, max_tokens, system, messages, stream }),
  });

  // 업스트림 에러(401/429/529 등)는 스트림 시작 전에 JSON으로 오므로 그대로 전달
  if (!r.ok) {
    return new Response(await r.text(), {
      status: r.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // stream 플래그 없는 요청(배포 순간 열려 있던 구버전 탭) 호환 경로
  if (!stream) {
    return new Response(r.body, { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // SSE 패스스루 — 본문을 버퍼링하지 않고 그대로 흘려보냄 (긴 응답 타임아웃의 근본 해결)
  return new Response(r.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
