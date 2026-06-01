import { useState, useRef, useEffect } from "react";

// ─── 상수 ───────────────────────────────────────────────
const APP_NAME = "클리어로";

const FIELDS = [
  { id: "labor",     name: "노동·고용",    desc: "임금체불, 부당해고, 직장 내 괴롭힘, 산재, 퇴직금",  color: "#1D4ED8" },
  { id: "estate",    name: "부동산·임대차",desc: "전세사기, 보증금 반환, 층간소음, 계약 해지",        color: "#0369A1" },
  { id: "family",    name: "가사·상속",    desc: "이혼, 양육권, 상속 분쟁, 유언장",                  color: "#7C3AED" },
  { id: "consumer",  name: "소비자·계약",  desc: "환불 거부, 계약 불이행, 사기, 소액사건",           color: "#B45309" },
  { id: "copyright", name: "저작권·지재",  desc: "저작권 침해, 상표 등록, 콘텐츠 무단 도용",         color: "#0F766E" },
  { id: "cyber",     name: "사이버·디지털",desc: "명예훼손, 딥페이크 피해, 개인정보 유출, 스토킹",   color: "#6D28D9" },
  { id: "finance",   name: "금융·투자",    desc: "보이스피싱, 금융사기, 불법 대출, 코인 사기",       color: "#065F46" },
  { id: "criminal",  name: "형사·피해자",  desc: "고소·고발 절차, 고소장 작성, 피해 구제",           color: "#9F1239" },
];

const EMERGENCY_CONTACTS = [
  { name: "경찰", number: "112", desc: "범죄 피해·긴급신고", color: "#1D4ED8" },
  { name: "법률구조공단", number: "132", desc: "무료 법률 상담", color: "#0369A1" },
  { name: "고용노동부", number: "1350", desc: "임금체불·노동 상담", color: "#B45309" },
  { name: "주택도시보증공사", number: "1566-9009", desc: "전세 피해 상담", color: "#065F46" },
  { name: "금융감독원", number: "1332", desc: "금융 사기 신고", color: "#7C3AED" },
  { name: "사이버범죄신고", number: "182", desc: "온라인 범죄 신고", color: "#6D28D9" },
  { name: "여성긴급전화", number: "1366", desc: "가정폭력·성폭력", color: "#BE185D" },
];

// 서류 타입: "legal" = 법적 효력 있음(전문가 검토 권고), "free" = 직접 사용 가능
const DOCS = [
  {
    id: "complaint", name: "고소장", type: "legal",
    fields: ["고소인 이름","피고소인 이름","피고소인 연락처(알면)","범죄 발생 일시","범죄 발생 장소","피해 내용 (구체적으로)","증거 (있으면)"],
    template: (d) => `고 소 장\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n고 소 인: ${d["고소인 이름"]||"___"}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n피고소인: ${d["피고소인 이름"]||"___"}  연락처: ${d["피고소인 연락처(알면)"]||"불상"}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n■ 고소 취지\n고소인은 피고소인을 고소하오니 엄중 처벌하여 주시기 바랍니다.\n\n■ 범죄 사실\n1. 발생 일시: ${d["범죄 발생 일시"]||"___"}\n2. 발생 장소: ${d["범죄 발생 장소"]||"___"}\n3. 피해 내용:\n${d["피해 내용 (구체적으로)"]||"___"}\n\n■ 증거 자료\n${d["증거 (있으면)"]||"추후 제출 예정"}\n\n${new Date().getFullYear()}년 ${new Date().getMonth()+1}월 ${new Date().getDate()}일\n고소인: ${d["고소인 이름"]||"___"}  (인)\n\n○○경찰서장 귀중`
  },
  {
    id: "cert_mail", name: "내용증명", type: "free",
    fields: ["발신인 이름","발신인 주소","수신인 이름","수신인 주소","제목","요구 사항 (구체적으로)","이행 기한"],
    template: (d) => `내 용 증 명\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n발신인: ${d["발신인 이름"]||"___"} / ${d["발신인 주소"]||"___"}\n수신인: ${d["수신인 이름"]||"___"} / ${d["수신인 주소"]||"___"}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n제목: ${d["제목"]||"___"}\n\n■ 요구 사항\n${d["요구 사항 (구체적으로)"]||"___"}\n\n■ 이행 기한\n수령일로부터 ${d["이행 기한"]||"___"} 이내 이행 바랍니다.\n미이행 시 법적 조치를 취할 것임을 통보합니다.\n\n${new Date().getFullYear()}년 ${new Date().getMonth()+1}월 ${new Date().getDate()}일\n발신인: ${d["발신인 이름"]||"___"}  (인)`
  },
  {
    id: "wage_claim", name: "임금체불 진정서", type: "legal",
    fields: ["진정인 이름","진정인 연락처","회사명","사업주 이름","재직 기간","체불 기간","체불 금액","체불 내용"],
    template: (d) => `진 정 서\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n진정인: ${d["진정인 이름"]||"___"} (${d["진정인 연락처"]||"___"})\n피진정인: ${d["사업주 이름"]||"___"} (${d["회사명"]||"___"} 대표)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n재직기간: ${d["재직 기간"]||"___"}\n체불기간: ${d["체불 기간"]||"___"}\n체불금액: ${d["체불 금액"]||"___"}원\n\n내용: ${d["체불 내용"]||"___"}\n\n위 체불 임금 지급을 요청하오니 조사하여 주시기 바랍니다.\n\n${new Date().getFullYear()}년 ${new Date().getMonth()+1}월 ${new Date().getDate()}일\n진정인: ${d["진정인 이름"]||"___"}  (인)\n\n고용노동부 ○○지청장 귀중`
  },
  {
    id: "agreement", name: "합의서", type: "free",
    fields: ["갑 이름","을 이름","사건 내용","합의 금액","지급 방법","추가 합의 조건"],
    template: (d) => `합 의 서\n\n갑: ${d["갑 이름"]||"___"}\n을: ${d["을 이름"]||"___"}\n\n■ 사건 내용\n${d["사건 내용"]||"___"}\n\n■ 합의 내용\n1. 을은 갑에게 합의금 ${d["합의 금액"]||"___"}원을 지급한다.\n2. 지급 방법: ${d["지급 방법"]||"___"}\n3. ${d["추가 합의 조건"]||"갑은 합의금 수령 후 민·형사상 이의를 제기하지 않는다."}\n\n${new Date().getFullYear()}년 ${new Date().getMonth()+1}월 ${new Date().getDate()}일\n갑: ${d["갑 이름"]||"___"}  (인)\n을: ${d["을 이름"]||"___"}  (인)`
  },
  {
    id: "copyright_warning", name: "저작권 침해\n경고장", type: "free",
    fields: ["발신인 이름","발신인 연락처","저작물 종류 (예: 사진, 영상, 글 등)","저작물 제목 또는 설명","침해자 이름 또는 채널명","침해 URL 또는 위치","침해 발견 일자","요구 사항"],
    template: (d) => `저 작 권 침 해 경 고 장\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n발 신 인: ${d["발신인 이름"]||"___"}\n연 락 처: ${d["발신인 연락처"]||"___"}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n수 신 인: ${d["침해자 이름 또는 채널명"]||"___"}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n■ 저작권 침해 사실 통보\n\n본인은 아래 저작물의 정당한 저작권자로서, 귀하가 본인의 허락 없이 해당 저작물을 무단으로 사용하고 있음을 확인하였기에 이에 경고합니다.\n\n■ 침해 저작물\n1. 저작물 종류: ${d["저작물 종류 (예: 사진, 영상, 글 등)"]||"___"}\n2. 저작물 제목·설명: ${d["저작물 제목 또는 설명"]||"___"}\n3. 침해 위치: ${d["침해 URL 또는 위치"]||"___"}\n4. 침해 발견 일자: ${d["침해 발견 일자"]||"___"}\n\n■ 요구 사항\n${d["요구 사항"]||"1. 즉시 해당 저작물 게시 중단 및 삭제\n2. 향후 무단 사용 금지"}\n\n■ 경고\n위 요구 사항을 본 경고장 수령일로부터 7일 이내에 이행하지 않을 경우, 저작권법 제136조에 따른 형사 고소 및 민사상 손해배상 청구를 진행할 것임을 알려드립니다.\n\n${new Date().getFullYear()}년 ${new Date().getMonth()+1}월 ${new Date().getDate()}일\n\n저작권자: ${d["발신인 이름"]||"___"}  (인)`
  },
  {
    id: "defamation", name: "명예훼손 고소장", type: "legal",
    fields: ["고소인 이름","고소인 연락처","피고소인 이름","피고소인 연락처(알면)","명예훼손 발생 일시","명예훼손 발생 장소 또는 플랫폼","명예훼손 내용 (구체적으로)","피해 사실","증거 (캡처, 링크 등)"],
    template: (d) => `고 소 장\n(명예훼손)\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n고 소 인: ${d["고소인 이름"]||"___"}\n연 락 처: ${d["고소인 연락처"]||"___"}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n피고소인: ${d["피고소인 이름"]||"___"}\n연 락 처: ${d["피고소인 연락처(알면)"]||"불상"}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n■ 고소 취지\n\n고소인은 피고소인을 명예훼손죄(형법 제307조)로 고소하오니 철저히 수사하여 엄중히 처벌하여 주시기 바랍니다.\n\n■ 범죄 사실\n\n1. 발생 일시: ${d["명예훼손 발생 일시"]||"___"}\n2. 발생 장소·플랫폼: ${d["명예훼손 발생 장소 또는 플랫폼"]||"___"}\n\n3. 명예훼손 내용:\n${d["명예훼손 내용 (구체적으로)"]||"___"}\n\n4. 피해 사실:\n${d["피해 사실"]||"___"}\n\n■ 증거 자료\n${d["증거 (캡처, 링크 등)"]||"추후 제출 예정"}\n\n■ 적용 법조\n- 형법 제307조 (명예훼손)\n- 정보통신망 이용촉진 및 정보보호 등에 관한 법률 제70조 (온라인 명예훼손)\n\n■ 결론\n\n위와 같은 사실로 피고소인을 고소하오니 수사하여 주시기 바랍니다.\n\n${new Date().getFullYear()}년 ${new Date().getMonth()+1}월 ${new Date().getDate()}일\n\n고소인: ${d["고소인 이름"]||"___"}  (인)\n\n○○경찰서장 귀중`
  },
];

// ─── 컬러 팔레트 (밝은 화이트 테마) ───────────────────
const C = {
  bg:       "#F7F8FC",
  surface:  "#FFFFFF",
  surface2: "#F1F4FB",
  border:   "#E4E9F4",
  border2:  "#CBD5E8",
  blue:     "#2563EB",
  blueLt:   "#EEF3FF",
  blueMd:   "#BFDBFE",
  text1:    "#0F172A",
  text2:    "#475569",
  text3:    "#94A3B8",
  userBg:   "#1E40AF",
  green:    "#059669",
  greenLt:  "#D1FAE5",
  amber:    "#D97706",
  amberLt:  "#FEF3C7",
  red:      "#DC2626",
  redLt:    "#FEE2E2",
};

// ─── 로고 SVG (Claude 스타일 나선) ─────────────────────
function Logo({ size = 36, borderRadius = 10 }) {
  const r = size / 2;
  return (
    <div style={{
      width: size, height: size, borderRadius,
      border: `1.5px solid ${C.border}`,
      background: C.surface,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
    }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
        <path d="M12 4 C7.5 4 4 7.5 4 12 C4 14.5 5.1 16.7 6.8 18.2" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
        <path d="M12 7 C9.2 7 7 9.2 7 12 C7 13.5 7.6 14.8 8.6 15.8" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.65"/>
        <path d="M12 10 C10.3 10 9 11.3 9 13" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.35"/>
        <circle cx="12" cy="12" r="1.5" fill="#2563EB"/>
      </svg>
    </div>
  );
}

// ─── 마크다운 렌더러 ────────────────────────────────────
function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} style={{ color: C.text1, fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} style={{ background: C.blueLt, color: C.blue, padding: "1px 6px", borderRadius: 4, fontSize: 12, fontFamily: "monospace" }}>{part.slice(1, -1)}</code>;
    return part;
  });
}

function parseMarkdown(text) {
  const lines = text.split("\n");
  const result = [];
  let key = 0;
  for (const line of lines) {
    if (line.startsWith("### "))
      result.push(<div key={key++} style={{ color: C.blue, fontWeight: 600, fontSize: 13, marginTop: 12, marginBottom: 4 }}>{line.slice(4)}</div>);
    else if (line.startsWith("## "))
      result.push(<div key={key++} style={{ color: C.text1, fontWeight: 600, fontSize: 14, marginTop: 14, marginBottom: 5, borderBottom: `1px solid ${C.border}`, paddingBottom: 4 }}>{line.slice(3)}</div>);
    else if (line.startsWith("# "))
      result.push(<div key={key++} style={{ color: C.text1, fontWeight: 700, fontSize: 15, marginTop: 14, marginBottom: 6 }}>{line.slice(2)}</div>);
    else if (line.match(/^(\d+)\.\s/)) {
      const num = line.match(/^(\d+)/)[1];
      const content = line.replace(/^\d+\.\s/, "");
      result.push(<div key={key++} style={{ display: "flex", gap: 8, marginBottom: 4 }}><span style={{ color: C.blue, fontWeight: 600, minWidth: 18, fontSize: 13, flexShrink: 0 }}>{num}.</span><span style={{ color: C.text2, fontSize: 13, lineHeight: 1.7 }}>{renderInline(content)}</span></div>);
    } else if (line.startsWith("- ") || line.startsWith("• "))
      result.push(<div key={key++} style={{ display: "flex", gap: 8, marginBottom: 3 }}><span style={{ color: C.blue, fontSize: 10, marginTop: 5, flexShrink: 0 }}>●</span><span style={{ color: C.text2, fontSize: 13, lineHeight: 1.7 }}>{renderInline(line.slice(2))}</span></div>);
    else if (line.trim() === "")
      result.push(<div key={key++} style={{ height: 7 }} />);
    else
      result.push(<div key={key++} style={{ color: C.text2, fontSize: 13, lineHeight: 1.8, marginBottom: 2 }}>{renderInline(line)}</div>);
  }
  return result;
}

// ─── 서브 컴포넌트 ──────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "12px 16px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "16px 16px 16px 4px", width: "fit-content", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.blue, opacity: 0.5, animation: "bounce 1.2s ease-in-out infinite", animationDelay: `${i*0.2}s` }} />)}
    </div>
  );
}

// ─── 서류 감지 헬퍼 ────────────────────────────────────
function parseDocContent(content) {
  const match = content.match(/\[DOCUMENT\]([\s\S]*?)\[\/DOCUMENT\]/);
  if (!match) return null;
  const before = content.slice(0, content.indexOf("[DOCUMENT]")).trim();
  const doc = match[1].trim();
  const after = content.slice(content.indexOf("[/DOCUMENT]") + 11).trim();
  return { before, doc, after };
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  const [copied, setCopied] = useState(false);
  const [docCopied, setDocCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(msg.content); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleDocCopy = (text) => { navigator.clipboard.writeText(text); setDocCopied(true); setTimeout(() => setDocCopied(false), 2000); };

  // 서류 감지
  const docParsed = !isUser ? parseDocContent(msg.content) : null;

  if (docParsed) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 20, animation: "fadeSlideIn 0.3s ease-out" }}>
        <div style={{ marginRight: 8, flexShrink: 0, marginTop: 2 }}><Logo size={30} borderRadius={8} /></div>
        <div style={{ maxWidth: "85%", width: "100%" }}>
          {/* 서류 전 설명 */}
          {docParsed.before && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "16px 16px 4px 16px", padding: "11px 15px", fontSize: 13.5, lineHeight: 1.7, color: C.text1, marginBottom: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div>{parseMarkdown(docParsed.before)}</div>
            </div>
          )}

          {/* 서류 본문 — 서류처럼 스타일 */}
          <div style={{ background: "#FAFBFF", border: `1.5px solid ${C.blueMd}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(37,99,235,0.08)" }}>
            {/* 서류 헤더 */}
            <div style={{ background: C.blueLt, borderBottom: `1px solid ${C.blueMd}`, padding: "9px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>📄</span>
              <span style={{ color: C.blue, fontSize: 12, fontWeight: 700 }}>서류 초안</span>
              <span style={{ color: C.text3, fontSize: 11, marginLeft: "auto" }}>복사 후 수정해서 사용하세요</span>
            </div>
            {/* 서류 내용 */}
            <pre style={{ padding: "16px", color: C.text1, fontSize: 12.5, lineHeight: 2, whiteSpace: "pre-wrap", fontFamily: "'Noto Sans KR', sans-serif", margin: 0, wordBreak: "break-word" }}>
              {docParsed.doc}
            </pre>
            {/* 복사 + PDF 버튼 */}
            <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center", background: C.surface }}>
              <button onClick={() => handleDocCopy(docParsed.doc)}
                style={{ flex: 1, padding: "9px", background: docCopied ? C.green : C.blue, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
                {docCopied ? "✓ 복사 완료!" : "📋 전체 복사"}
              </button>
              <button onClick={() => {
                const w = window.open("", "_blank");
                w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>서류</title><style>
                  body { font-family: 'Noto Sans KR', sans-serif; padding: 40px; font-size: 13px; line-height: 2; color: #0F172A; }
                  pre { white-space: pre-wrap; font-family: 'Noto Sans KR', sans-serif; font-size: 13px; line-height: 2; }
                  @media print { body { padding: 20px; } }
                </style></head><body><pre>${docParsed.doc.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>
                <script>window.onload=()=>{window.print();}</script></body></html>`);
                w.document.close();
              }}
                style={{ padding: "9px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: C.text2, whiteSpace: "nowrap" }}>
                🖨️ PDF 저장
              </button>
            </div>
          </div>

          {/* 서류 후 안내 */}
          {docParsed.after && (
            <div style={{ marginTop: 8, padding: "9px 13px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "4px 16px 16px 16px", fontSize: 12, color: C.text2, lineHeight: 1.7 }}>
              <div>{parseMarkdown(docParsed.after)}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 20, animation: "fadeSlideIn 0.3s ease-out" }}>
      {!isUser && <div style={{ marginRight: 8, flexShrink: 0, marginTop: 2 }}><Logo size={30} borderRadius={8} /></div>}
      <div style={{ maxWidth: "78%", position: "relative" }}>
        <div style={{
          background: isUser ? C.userBg : C.surface,
          color: isUser ? "#fff" : C.text1,
          padding: "11px 15px",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          fontSize: 13.5, lineHeight: 1.7,
          border: isUser ? "none" : `1px solid ${C.border}`,
          boxShadow: isUser ? "0 2px 8px rgba(30,64,175,0.2)" : "0 1px 4px rgba(0,0,0,0.06)",
          wordBreak: "break-word"
        }}>
          {isUser ? <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span> : <div>{parseMarkdown(msg.content)}</div>}
        </div>
        {!isUser && (
          <button onClick={handleCopy} style={{ marginTop: 3, background: "none", border: "none", color: copied ? C.green : C.text3, fontSize: 11, cursor: "pointer", padding: "2px 4px", fontFamily: "inherit" }}>
            {copied ? "✓ 복사됨" : "복사"}
          </button>
        )}
      </div>
    </div>
  );
}

function StreamingMessage({ text }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 20 }}>
      <div style={{ marginRight: 8, flexShrink: 0, marginTop: 2 }}><Logo size={30} borderRadius={8} /></div>
      <div style={{ maxWidth: "78%" }}>
        <div style={{ background: C.surface, color: C.text1, padding: "11px 15px", borderRadius: "16px 16px 16px 4px", fontSize: 13.5, lineHeight: 1.7, border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", wordBreak: "break-word" }}>
          <div>{parseMarkdown(text)}</div>
          <span style={{ display: "inline-block", width: 2, height: 13, background: C.blue, marginLeft: 2, animation: "blink 1s step-end infinite", verticalAlign: "middle" }} />
        </div>
      </div>
    </div>
  );
}

// ─── 긴급 연락처 모달 ──────────────────────────────────
function EmergencyModal({ onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: C.surface, borderRadius: 20, border: `1px solid ${C.border}`, width: "100%", maxWidth: 460, maxHeight: "88vh", overflowY: "auto", padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ color: C.red, fontWeight: 700, fontSize: 15 }}>긴급 법률 연락처</div>
            <div style={{ color: C.text3, fontSize: 12, marginTop: 2 }}>24시간 무료 상담 기관</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.text3, fontSize: 22, cursor: "pointer" }}>×</button>
        </div>
        <div style={{ background: C.redLt, border: `1px solid #FECACA`, borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
          <p style={{ color: C.red, fontSize: 12, lineHeight: 1.7, margin: 0 }}>중대 범죄 피해는 즉시 <strong>112</strong>로 신고하세요</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {EMERGENCY_CONTACTS.map((c, i) => (
            <div key={i} style={{ background: C.bg, border: `1px solid ${C.border}`, borderLeft: `3px solid ${c.color}`, borderRadius: "0 10px 10px 0", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ color: C.text1, fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                <div style={{ color: C.text3, fontSize: 11, marginTop: 1 }}>{c.desc}</div>
              </div>
              <a href={`tel:${c.number.replace(/-/g,"")}`} style={{ textDecoration: "none" }}>
                <div style={{ background: C.blueLt, border: `1px solid ${C.blueMd}`, borderRadius: 20, padding: "5px 12px", color: C.blue, fontWeight: 700, fontSize: 14, fontFamily: "monospace", cursor: "pointer" }}>
                  {c.number}
                </div>
              </a>
            </div>
          ))}
        </div>
        <p style={{ color: C.text3, fontSize: 11, textAlign: "center", marginTop: 14 }}>번호를 탭하면 바로 전화 연결됩니다</p>
      </div>
    </div>
  );
}

// ─── 서류 생성 모달 ─────────────────────────────────────
function DocModal({ onClose }) {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const doc = DOCS.find(d => d.id === selectedDoc);
  const handleGenerate = () => doc && setResult(doc.template(formData));
  const handleCopy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: C.surface, borderRadius: 20, border: `1px solid ${C.border}`, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto", padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ color: C.text1, fontWeight: 700, fontSize: 15 }}>서류 초안 생성</div>
            <div style={{ color: C.text3, fontSize: 12, marginTop: 2 }}>정보를 입력하면 참고용 초안을 만들어 드려요</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.text3, fontSize: 22, cursor: "pointer" }}>×</button>
        </div>

        {/* 서류 선택 */}
        {!selectedDoc ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {DOCS.map(d => (
              <button key={d.id} onClick={() => { setSelectedDoc(d.id); setFormData({}); setResult(""); }}
                style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 12px", cursor: "pointer", textAlign: "left", transition: "all 0.15s", fontFamily: "inherit" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.background = C.blueLt; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg; }}>
                <div style={{ color: C.text1, fontWeight: 600, fontSize: 12, whiteSpace: "pre-line" }}>{d.name}</div>
                <div style={{ marginTop: 4, fontSize: 10, color: d.type === "free" ? C.green : C.amber, fontWeight: 500 }}>
                  {d.type === "free" ? "직접 제출 가능" : "전문가 권고"}
                </div>
              </button>
            ))}
          </div>
        ) : !result ? (
          <div>
            <button onClick={() => setSelectedDoc(null)} style={{ background: "none", border: "none", color: C.blue, fontSize: 12, cursor: "pointer", marginBottom: 14, padding: 0, fontFamily: "inherit" }}>← 다른 서류 선택</button>
            <div style={{ color: C.text1, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>{doc.name.replace(/\n/g, " ")} 작성</div>

            {/* 작성 전 안내 — 타입별 */}
            {doc.type === "free" ? (
              <div style={{ background: C.greenLt, border: `1px solid #A7F3D0`, borderRadius: 10, padding: "9px 13px", marginBottom: 14 }}>
                <p style={{ color: "#065F46", fontSize: 11, lineHeight: 1.7, margin: 0 }}>
                  ✅ <strong>직접 작성·사용 가능한 서류입니다.</strong> 내용을 꼼꼼히 확인 후 사용하세요.
                </p>
              </div>
            ) : (
              <div style={{ background: C.amberLt, border: `1px solid #FDE68A`, borderRadius: 10, padding: "9px 13px", marginBottom: 14 }}>
                <p style={{ color: C.amber, fontSize: 11, lineHeight: 1.7, margin: 0 }}>
                  ⚠️ <strong>법적 효력이 있는 서류입니다.</strong> 실제 제출 전 법률 전문가의 검토를 권고드립니다.
                </p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              {doc.fields.map(field => (
                <div key={field}>
                  <div style={{ color: C.text2, fontSize: 12, marginBottom: 4, fontWeight: 500 }}>{field}</div>
                  {field.includes("내용") || field.includes("피해") || field.includes("합의 조건") ? (
                    <textarea value={formData[field]||""} onChange={e => setFormData(p => ({...p,[field]:e.target.value}))} rows={3}
                      style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 11px", color: C.text1, fontSize: 13, resize: "none", fontFamily: "inherit", outline: "none" }} placeholder={`${field}을 입력하세요`} />
                  ) : (
                    <input value={formData[field]||""} onChange={e => setFormData(p => ({...p,[field]:e.target.value}))}
                      style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 11px", color: C.text1, fontSize: 13, fontFamily: "inherit", outline: "none" }} placeholder={`${field}을 입력하세요`} />
                  )}
                </div>
              ))}
            </div>
            <button onClick={handleGenerate} style={{ width: "100%", padding: 13, background: C.blue, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>참고용 초안 생성하기 →</button>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ color: C.green, fontSize: 13, fontWeight: 600 }}>✓ 초안 생성 완료</div>
              <button onClick={() => setResult("")} style={{ background: "none", border: "none", color: C.blue, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>← 다시 작성</button>
            </div>
            {/* 완성 후 경고 — 타입별 */}
            {doc.type === "free" ? (
              <div style={{ background: C.greenLt, border: `1px solid #A7F3D0`, borderRadius: 10, padding: "11px 13px", marginBottom: 12 }}>
                <div style={{ color: "#065F46", fontWeight: 700, fontSize: 12, marginBottom: 4 }}>✅ 직접 사용 가능한 서류</div>
                <div style={{ color: "#047857", fontSize: 11, lineHeight: 1.8 }}>
                  · 내용증명·합의서는 직접 작성해서 보낼 수 있어요<br/>
                  · 내용을 꼼꼼히 확인 후 사용하세요<br/>
                  · 복잡한 상황이라면 전문가 검토도 고려해 보세요
                </div>
              </div>
            ) : (
              <div style={{ background: C.amberLt, border: `2px solid #FCD34D`, borderRadius: 10, padding: "11px 13px", marginBottom: 12 }}>
                <div style={{ color: C.amber, fontWeight: 700, fontSize: 12, marginBottom: 4 }}>⚠️ 제출 전 확인하세요</div>
                <div style={{ color: "#92400E", fontSize: 11, lineHeight: 1.8 }}>
                  · 법적 효력이 있는 서류입니다<br/>
                  · 내용의 정확성을 직접 검토하신 후 사용하세요<br/>
                  · <strong>가급적 법률 전문가의 검토를 권고드립니다</strong>
                </div>
              </div>
            )}
            <pre style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, color: C.text1, fontSize: 12, lineHeight: 1.9, overflowX: "auto", whiteSpace: "pre-wrap", fontFamily: "inherit", marginBottom: 12 }}>{result}</pre>
            <button onClick={handleCopy} style={{ width: "100%", padding: 12, background: copied ? C.green : C.blue, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.3s" }}>
              {copied ? "✓ 복사 완료!" : "전체 복사"}
            </button>
            <p style={{ color: C.text3, fontSize: 11, textAlign: "center", marginTop: 8 }}>
              {doc.type === "free"
                ? "복사 후 메모장·워드에 붙여넣어 내용을 확인하고 사용하세요"
                : "복사 후 메모장·워드에 붙여넣어 수정 후 전문가 검토를 받으세요"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 분야 선택 ──────────────────────────────────────────
function FieldSelect({ onSelect }) {
  return (
    <div style={{ animation: "fadeSlideIn 0.4s ease-out" }}>

      {/* 판례 검색 업데이트 예정 배너 */}
      <div style={{ background: C.blueLt, border: `1px solid ${C.blueMd}`, borderRadius: 12, padding: "11px 14px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.blue, marginBottom: 2 }}>🔍 곧 출시 예정</div>
          <div style={{ fontSize: 11, color: C.text2 }}>판례 검색 · 유사 사례 AI 요약 · 판례 비교 분석</div>
        </div>
        <span style={{ fontSize: 10, color: C.blue, fontWeight: 700, background: "#DBEAFE", padding: "3px 8px", borderRadius: 20, flexShrink: 0, marginLeft: 10 }}>업데이트</span>
      </div>

      <div style={{ padding: "0 0 16px" }}>
        <p style={{ color: C.text1, fontSize: 17, fontWeight: 700, margin: "0 0 4px" }}>어떤 법률 문제로 오셨나요!</p>
        <p style={{ color: C.text3, fontSize: 12, margin: 0 }}>분야를 선택하면 더 정확한 정보를 드릴 수 있어요</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        {FIELDS.map(f => (
          <button key={f.id} onClick={() => onSelect(f)}
            style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 13px", cursor: "pointer", textAlign: "left", transition: "all 0.15s", fontFamily: "inherit" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = f.color; e.currentTarget.style.background = C.blueLt; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface; }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: f.color, flexShrink: 0, display: "inline-block" }} />
              <span style={{ color: C.text1, fontWeight: 600, fontSize: 13 }}>{f.name}</span>
            </div>
            <div style={{ color: C.text3, fontSize: 11, lineHeight: 1.5, paddingLeft: 13 }}>{f.desc}</div>
          </button>
        ))}
      </div>

      <button onClick={() => onSelect(null)} style={{ width: "100%", padding: "11px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text2, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.background = C.bg}
        onMouseLeave={e => e.currentTarget.style.background = C.surface}>
        분야 구분 없이 바로 상담하기
      </button>

      {/* 하단 경고 */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "11px 14px", display: "flex", gap: 9, alignItems: "flex-start", marginTop: 12 }}>
        <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
        <p style={{ color: C.text3, fontSize: 11, lineHeight: 1.7, margin: 0 }}>
          본 서비스는 법률 <strong style={{ color: C.text2 }}>참고 정보</strong> 제공 목적입니다.
          중대 범죄 피해는 즉시 <strong style={{ color: C.blue }}>112</strong> 또는 법률구조공단 <strong style={{ color: C.blue }}>132</strong>로 신고하세요.
        </p>
      </div>

    </div>
  );
}

// ─── 히스토리 사이드바 ──────────────────────────────────
function HistorySidebar({ histories, onLoad, onDelete, onClose, currentId }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
      <div style={{ flex: 1, background: "rgba(0,0,0,0.3)" }} onClick={onClose} />
      <div style={{ width: 280, background: C.surface, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", animation: "slideInRight 0.25s ease-out", boxShadow: "-8px 0 30px rgba(0,0,0,0.08)" }}>
        <div style={{ padding: "18px 16px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: C.text1, fontWeight: 700, fontSize: 14 }}>상담 기록</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.text3, fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
          {histories.length === 0 ? (
            <div style={{ color: C.text3, fontSize: 12, textAlign: "center", marginTop: 40 }}>저장된 상담 기록이 없어요</div>
          ) : histories.map(h => (
            <div key={h.id} style={{ background: h.id === currentId ? C.blueLt : "none", border: `1px solid ${h.id === currentId ? C.blueMd : "transparent"}`, borderRadius: 10, padding: "10px 12px", marginBottom: 5, cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { if (h.id !== currentId) e.currentTarget.style.background = C.bg; }}
              onMouseLeave={e => { if (h.id !== currentId) e.currentTarget.style.background = "none"; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }} onClick={() => onLoad(h)}>
                <div style={{ flex: 1 }}>
                  {h.field && <div style={{ fontSize: 10, color: C.blue, marginBottom: 2, fontWeight: 600 }}>{h.field.name}</div>}
                  <div style={{ color: C.text1, fontSize: 12, lineHeight: 1.5, marginBottom: 3 }}>{(h.messages[0]?.content||"").slice(0,38)}...</div>
                  <div style={{ color: C.text3, fontSize: 10 }}>{h.date} · {h.messages.filter(m=>m.role==="user").length}회</div>
                </div>
                <button onClick={e => { e.stopPropagation(); onDelete(h.id); }} style={{ background: "none", border: "none", color: C.text3, fontSize: 13, cursor: "pointer", padding: "0 0 0 8px", flexShrink: 0 }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 이용약관 동의 화면 ─────────────────────────────────
function TermsScreen({ onAgree }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit", padding: 20 }}>
      <div style={{ background: C.surface, borderRadius: 20, padding: "36px 30px", maxWidth: 460, width: "100%", border: `1px solid ${C.border}`, boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <Logo size={48} borderRadius={14} />
          <div style={{ marginTop: 12, fontSize: 18, fontWeight: 700, color: C.text1 }}>{APP_NAME}</div>
          <div style={{ fontSize: 12, color: C.text3, marginTop: 4 }}>서비스 이용 전 꼭 확인하세요</div>
        </div>

        {/* 핵심 경고 */}
        <div style={{ background: C.redLt, border: `1px solid #FECACA`, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ color: C.red, fontWeight: 700, fontSize: 12, marginBottom: 8 }}>⚠️ 반드시 확인하세요</div>
          {[
            "본 서비스는 법률 정보 제공 서비스이며, 법률 전문가의 서비스를 대체하지 않습니다.",
            "AI가 제공하는 모든 정보는 참고용이며, 실제 법적 효력이 없습니다.",
            "일부 서류는 직접 제출 가능하나, 고소장·진정서 등 법적 효력이 있는 서류는 전문가 검토를 권고드립니다.",
            "서비스 이용으로 인한 법적 결과에 대해 운영자는 책임을 지지 않습니다.",
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 7, marginBottom: 6 }}>
              <span style={{ color: C.red, fontSize: 11, flexShrink: 0, marginTop: 2 }}>·</span>
              <p style={{ color: "#991B1B", fontSize: 11, lineHeight: 1.7, margin: 0 }}>{t}</p>
            </div>
          ))}
        </div>

        {/* 이용약관 */}
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 12, maxHeight: 150, overflowY: "auto" }}>
          <div style={{ color: C.blue, fontWeight: 600, fontSize: 12, marginBottom: 8 }}>이용약관 요약</div>
          {[
            ["서비스 목적", "법률 관련 정보 제공 및 서류 초안 작성 보조"],
            ["정보의 성격", "모든 정보는 참고용이며 법적 효력 없음"],
            ["개인정보 처리", "입력된 정보는 서버에 저장되지 않음"],
            ["책임 한계", "정보의 정확성 및 이용 결과에 대해 운영자 책임 없음"],
            ["서비스 변경", "서비스 내용은 사전 공지 없이 변경될 수 있음"],
            ["준거법", "본 약관은 대한민국 법률에 따라 해석됨"],
          ].map(([k,v], i) => (
            <div key={i} style={{ marginBottom: 5 }}>
              <span style={{ color: C.text2, fontSize: 11, fontWeight: 600 }}>{k}: </span>
              <span style={{ color: C.text2, fontSize: 11 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* 개인정보 */}
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 22 }}>
          <div style={{ color: C.blue, fontWeight: 600, fontSize: 12, marginBottom: 8 }}>개인정보처리방침</div>
          {[
            "수집 항목: 서비스 이용 중 입력한 법률 상담 내용, 서류 작성 정보",
            "수집 목적: AI 응답 생성 (서버 저장 없음, 세션 종료 시 자동 삭제)",
            "제3자 제공: Anthropic API를 통한 AI 응답 생성 목적으로만 전송되며, AI 모델 학습에는 사용되지 않습니다",
            "보유 기간: 세션 종료 즉시 삭제 (상담 기록은 사용자 기기에만 저장)",
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 7, marginBottom: 5 }}>
              <span style={{ color: C.blue, fontSize: 11, flexShrink: 0 }}>·</span>
              <p style={{ color: C.text2, fontSize: 11, lineHeight: 1.6, margin: 0 }}>{t}</p>
            </div>
          ))}
        </div>

        <button onClick={onAgree}
          style={{ width: "100%", padding: "13px", borderRadius: 12, background: C.blue, color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: 8 }}>
          위 내용을 모두 확인하였으며 동의합니다 →
        </button>
        <p style={{ color: C.text3, fontSize: 11, textAlign: "center", margin: 0 }}>동의하지 않으시면 서비스를 이용할 수 없습니다</p>
      </div>
    </div>
  );
}

// ─── API 키 입력 화면 ───────────────────────────────────
function ApiScreen({ onEnter }) {
  const [keyInput, setKeyInput] = useState("");
  const valid = keyInput.startsWith("sk-");
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit", padding: 20 }}>
      <div style={{ background: C.surface, borderRadius: 20, padding: "40px 32px", maxWidth: 420, width: "100%", border: `1px solid ${C.border}`, boxShadow: "0 8px 40px rgba(0,0,0,0.08)", textAlign: "center" }}>
        <Logo size={52} borderRadius={16} />
        <div style={{ marginTop: 14, marginBottom: 6, fontSize: 22, fontWeight: 700, color: C.text1 }}>{APP_NAME}</div>
        <div style={{ fontSize: 13, color: C.text3, marginBottom: 24 }}>전문가 상담 전, 먼저 알아보세요</div>

        {/* 8대 분야 그리드 */}
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {FIELDS.map(f => (
              <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: f.color, flexShrink: 0, display: "inline-block" }} />
                <span style={{ color: C.text2, fontSize: 11 }}>{f.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "left", marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: "block", marginBottom: 6 }}>Anthropic API 키</label>
          <input type="password" value={keyInput} onChange={e => setKeyInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && valid && onEnter(keyInput)}
            placeholder="sk-ant-..."
            style={{ width: "100%", padding: "11px 13px", background: C.bg, border: `1.5px solid ${valid ? C.blue : C.border}`, borderRadius: 10, color: C.text1, fontSize: 13, fontFamily: "monospace", outline: "none", transition: "border-color 0.2s" }} />
          <p style={{ color: C.text3, fontSize: 11, marginTop: 5, marginBottom: 0 }}>
            세션 동안만 유지 · 서버 미저장 · 학습에 사용되지 않음
          </p>
        </div>

        <button onClick={() => valid && onEnter(keyInput)} disabled={!valid}
          style={{ width: "100%", padding: "12px", borderRadius: 10, background: valid ? C.blue : C.border, color: valid ? "#fff" : C.text3, border: "none", fontSize: 14, fontWeight: 600, cursor: valid ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 0.2s", marginBottom: 10 }}>
          상담 시작하기 →
        </button>

        {/* 판례 검색 업데이트 예정 배너 */}
        <div style={{ background: C.blueLt, border: `1px solid ${C.blueMd}`, borderRadius: 10, padding: "11px 13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.blue }}>🔍 곧 출시 예정</div>
            <div style={{ fontSize: 11, color: C.text2, marginTop: 2 }}>판례 검색 · 유사 사례 AI 요약 · 판례 비교 분석</div>
          </div>
          <span style={{ fontSize: 10, color: C.blue, fontWeight: 700, background: "#DBEAFE", padding: "3px 8px", borderRadius: 20, flexShrink: 0, marginLeft: 10 }}>업데이트</span>
        </div>
      </div>
    </div>
  );
}

// ─── 플랜 배너 ───────────────────────────────────────────
function PlanBanner({ plan, trialDaysLeft, onUpgrade }) {
  const daysLeft = trialDaysLeft();
  if (plan.type === "paid") return null;
  if (plan.type === "trial" && daysLeft > 0) {
    return (
      <div style={{ background: C.blueLt, borderBottom: `1px solid ${C.blueMd}`, padding: "7px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: C.blue, fontSize: 12 }}>무료 체험 <strong>D-{daysLeft}</strong> · 모든 기능 이용 가능</span>
        <button onClick={onUpgrade} style={{ background: "none", border: `1px solid ${C.blue}`, borderRadius: 20, padding: "3px 10px", color: C.blue, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>구독 →</button>
      </div>
    );
  }
  return (
    <div style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, padding: "7px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: C.text3, fontSize: 12 }}>무료 플랜 · 하루 3회 상담 · 서류생성 제한</span>
      <button onClick={onUpgrade} style={{ background: C.blue, border: "none", borderRadius: 20, padding: "4px 12px", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>업그레이드</button>
    </div>
  );
}

// ─── 업그레이드 모달 ─────────────────────────────────────
function UpgradeModal({ plan, trialDaysLeft, onClose, onUpgrade }) {
  const daysLeft = trialDaysLeft();
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: C.surface, borderRadius: 20, border: `1.5px solid ${C.blue}`, width: "100%", maxWidth: 400, padding: 26, textAlign: "center", boxShadow: "0 20px 60px rgba(37,99,235,0.15)" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
        <div style={{ color: C.text1, fontWeight: 700, fontSize: 17, marginBottom: 8 }}>
          {plan.type === "trial" && daysLeft === 0 ? "3일 체험이 종료되었어요" : "오늘 무료 상담이 모두 사용됐어요"}
        </div>
        <p style={{ color: C.text2, fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
          {plan.type === "trial" && daysLeft === 0 ? "계속 이용하시려면 구독을 시작하세요." : "무료 플랜은 하루 3회 상담이 가능해요."}
        </p>
        <div style={{ background: C.bg, border: `2px solid ${C.blue}`, borderRadius: 14, padding: "16px 16px", marginBottom: 14, textAlign: "left", position: "relative" }}>
          <div style={{ position: "absolute", top: -10, right: 14, background: C.blue, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>추천</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ color: C.text1, fontWeight: 700, fontSize: 15 }}>스탠다드</div>
            <div style={{ color: C.blue, fontWeight: 800, fontSize: 18 }}>월 9,900원</div>
          </div>
          {["AI 법률 상담 무제한", "서류 자동생성 무제한", "상담 기록 무제한 저장", "8개 분야 전문 상담"].map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
              <span style={{ color: C.blue }}>✓</span>
              <span style={{ color: C.text2, fontSize: 13 }}>{f}</span>
            </div>
          ))}
        </div>
        <button onClick={onUpgrade} style={{ width: "100%", padding: "13px", background: C.blue, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: 8 }}>
          월 9,900원으로 시작하기 →
        </button>
        <button onClick={onClose} style={{ background: "none", border: "none", color: C.text3, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
          {plan.type === "trial" && daysLeft === 0 ? "무료로 하루 3회만 계속 이용" : "내일 다시 이용하기"}
        </button>
      </div>
    </div>
  );
}

// ─── 시스템 프롬프트 ─────────────────────────────────────
function buildSystemPrompt(field) {
  const base = `당신은 대한민국 법률 정보 전문 AI입니다. 법률 전문가 상담 전 기초 정보를 제공하는 서비스입니다.

## 중요 원칙:
1. 중대 범죄 피해는 반드시 공식 법률기관(경찰, 검찰, 국선변호인)을 즉시 안내하세요.
2. 구체적인 상황에 맞는 실질적인 정보를 제공하세요.
3. 필요한 서류 목록, 절차, 기간, 비용을 명확히 설명하세요.
4. 법률 조문이나 판례가 있다면 참고로 언급하세요.
5. 마지막에는 항상 "이 정보는 법률 참고용이며, 중요한 사안은 법률전문가와 직접 상담하세요"를 덧붙이세요. 단, 서류([DOCUMENT] 태그) 안에는 이 문구를 절대 넣지 마세요.
6. 친근하고 이해하기 쉬운 한국어로 답변하세요.
7. 마크다운 형식(**, ##, - 등)을 적극 활용하여 가독성 높게 작성하세요.

## 서류 작성 요청 시 규칙:
사용자가 고소장, 내용증명, 진정서, 합의서, 경고장 등 서류 작성을 요청하면:
1. 대화 내용에서 파악한 정보를 최대한 자동으로 채워 넣으세요.
2. 모르는 정보는 [이름], [날짜], [금액] 형식으로 표시하세요.
3. 반드시 아래 형식으로 서류를 출력하세요:

[DOCUMENT]
서류 전체 내용을 여기에 작성
[/DOCUMENT]

4. 서류 앞에 한 줄 설명을 추가하세요. 예: "대화 내용을 바탕으로 내용증명을 작성했어요. [이름] 부분만 채워서 사용하세요."
5. 서류 종류에 따라 뒤에 아래 문구를 추가하세요:
   - 내용증명, 합의서, 저작권 침해 경고장: "직접 작성·발송 가능한 서류입니다."
   - 고소장, 진정서, 명예훼손 고소장: "법적 효력이 있는 서류로, 전문가 검토를 권고드립니다."`;
  if (!field) return base;
  return base + `\n\n## 이번 상담 전문 분야: ${field.name}\n${field.desc}\n이 분야에 특화하여 더 상세하고 실질적인 정보를 제공하세요.`;
}

// ─── 메인 앱 ────────────────────────────────────────────
export default function ClearLaw() {
  const [step, setStep] = useState("terms");
  const apiKey = process.env.REACT_APP_ANTHROPIC_KEY || "";
  const [selectedField, setSelectedField] = useState(null);
  const [messages, setMessages] = useState([]);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [input, setInput] = useState("");
  const [showDoc, setShowDoc] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [histories, setHistories] = useState(() => { try { return JSON.parse(localStorage.getItem("clearlaw_histories")||"[]"); } catch { return []; } });
  const [currentHistoryId, setCurrentHistoryId] = useState(null);
  const [plan, setPlan] = useState(() => { try { return JSON.parse(localStorage.getItem("clearlaw_plan")||'{"type":"trial","startDate":'+Date.now()+',"chatCount":0,"lastChatDate":""}'); } catch { return { type:"trial", startDate:Date.now(), chatCount:0, lastChatDate:"" }; } });
  const bottomRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streamingText, isStreaming]);
  useEffect(() => {
    const agreed = localStorage.getItem("clearlaw_terms");
    if (agreed) setStep("field");
  }, []);

  const savePlan = (p) => { setPlan(p); localStorage.setItem("clearlaw_plan", JSON.stringify(p)); };
  const trialDaysLeft = () => { if (plan.type !== "trial") return 0; const d = Math.floor((Date.now()-plan.startDate)/(1000*60*60*24)); return Math.max(0,3-d); };
  const isTrialActive = () => trialDaysLeft() > 0;
  const isPaid = () => plan.type === "paid";
  const todayStr = new Date().toLocaleDateString();
  const todayChatCount = () => plan.lastChatDate !== todayStr ? 0 : plan.chatCount || 0;
  const canChat = () => isTrialActive() || isPaid() || todayChatCount() < 3;
  const canUseDoc = () => isTrialActive() || isPaid();

  const incrementChat = () => {
    if (isTrialActive() || isPaid()) return;
    const today = new Date().toLocaleDateString();
    const count = plan.lastChatDate === today ? (plan.chatCount||0)+1 : 1;
    savePlan({...plan, chatCount:count, lastChatDate:today});
  };

  const saveHistory = (msgs, field) => {
    if (!msgs.length) return;
    const id = currentHistoryId || Date.now().toString();
    const entry = { id, field, messages:msgs, date:new Date().toLocaleDateString("ko-KR",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}) };
    const updated = [entry,...histories.filter(h=>h.id!==id)].slice(0,20);
    setHistories(updated); setCurrentHistoryId(id);
    localStorage.setItem("clearlaw_histories", JSON.stringify(updated));
  };

  const handleAgreeTerms = () => { localStorage.setItem("clearlaw_terms","1"); setStep("field"); };
  const handleFieldSelect = (field) => { setSelectedField(field); setMessages([]); setCurrentHistoryId(null); setStep("chat"); };
  const handleNewChat = () => {
    if (messages.length > 0) saveHistory(messages, selectedField);
    setMessages([]); setCurrentHistoryId(null); setStep("field");
  };
  const handleLoadHistory = (h) => {
    if (messages.length > 0) saveHistory(messages, selectedField);
    setMessages(h.messages); setSelectedField(h.field); setCurrentHistoryId(h.id); setStep("chat"); setShowHistory(false);
  };
  const handleDeleteHistory = (id) => {
    const updated = histories.filter(h=>h.id!==id);
    setHistories(updated); localStorage.setItem("clearlaw_histories", JSON.stringify(updated));
    if (currentHistoryId===id) { setMessages([]); setCurrentHistoryId(null); }
  };
  const handleStop = () => { if (abortRef.current) { abortRef.current.abort(); abortRef.current=null; } };

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || isStreaming) return;
    if (!canChat()) { setShowUpgrade(true); return; }
    incrementChat();
    setInput("");
    const newMessages = [...messages, { role:"user", content:userText }];
    setMessages(newMessages); setIsStreaming(true); setStreamingText("");
    const controller = new AbortController(); abortRef.current = controller;
    try {
      const response = await fetch('/api/chat', {
        method:"POST", signal:controller.signal,
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:1500, stream:false, system:buildSystemPrompt(selectedField), messages:newMessages.map(m=>({role:m.role,content:m.content})) })
      });
      if (!response.ok) {
        const err = await response.json();
        const errMsg = err.error?.type==="authentication_error" ? "API 키가 올바르지 않습니다." : err.error?.type==="rate_limit_error" ? "잠시 후 다시 시도해 주세요." : `오류: ${err.error?.message}`;
        setMessages([...newMessages,{role:"assistant",content:errMsg}]); setIsStreaming(false); setStreamingText(""); return;
      }
      const data = await response.json();
      const fullText = data.content?.[0]?.text || "응답을 받지 못했습니다.";
      const final = [...newMessages,{role:"assistant",content:fullText}];
      setMessages(final); saveHistory(final, selectedField);
    } catch(e) {
      if (e.name!=="AbortError") setMessages([...newMessages,{role:"assistant",content:"네트워크 오류가 발생했습니다."}]);
      else if (streamingText) { const p=[...newMessages,{role:"assistant",content:streamingText+"\n\n*(응답이 중단되었습니다)*"}]; setMessages(p); saveHistory(p,selectedField); }
    } finally { setIsStreaming(false); setStreamingText(""); abortRef.current=null; }
  };

  // ── 이용약관 화면 ──
  if (step === "terms") return <TermsScreen onAgree={handleAgreeTerms} />;

  // ── 헤더 (헤더 텍스트 잘림 해결 — truncate + flex) ──
  const fieldLabel = selectedField && step==="chat"
    ? `${selectedField.name} 상담 중`
    : "법률 정보 서비스";

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", fontFamily:"'Noto Sans KR',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Noto+Serif+KR:wght@400;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideInRight { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:${C.border2};border-radius:2px}
        textarea:focus,input:focus{outline:none;border-color:${C.blue}!important}
        textarea{resize:none;}
      `}</style>

      {/* 헤더 */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"11px 16px", display:"flex", alignItems:"center", gap:10, position:"sticky", top:0, zIndex:10 }}>
        <Logo size={34} borderRadius={9} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ color:C.text1, fontWeight:700, fontSize:14, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{APP_NAME}</div>
          <div style={{ color:C.blue, fontSize:10, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            · {fieldLabel}
          </div>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
          <button onClick={() => setShowEmergency(true)}
            style={{ background:C.redLt, border:`1px solid #FECACA`, borderRadius:20, padding:"5px 10px", color:C.red, fontSize:11, cursor:"pointer", fontFamily:"inherit", fontWeight:600, whiteSpace:"nowrap" }}>
            긴급
          </button>
          {/* 분야 선택 화면에만 구독 버튼 */}
          {step==="field" && !isPaid() && (
            <button onClick={() => setShowUpgrade(true)}
              style={{ background:C.blue, border:"none", borderRadius:20, padding:"5px 10px", color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
              구독
            </button>
          )}
          <button onClick={() => setShowHistory(true)}
            style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:20, padding:"5px 10px", color:C.text2, fontSize:11, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
            기록
          </button>
          {step==="chat" && <>
            <button onClick={() => { if(!canUseDoc()){setShowUpgrade(true);return;} setShowDoc(true); }}
              style={{ background:"none", border:`1px solid ${canUseDoc()?C.border:"#FCD34D"}`, borderRadius:20, padding:"5px 10px", color:canUseDoc()?C.blue:C.amber, fontSize:11, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
              서류 양식{!canUseDoc()?" 🔒":""}
            </button>
            <button onClick={handleNewChat}
              style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:20, padding:"5px 10px", color:C.text2, fontSize:11, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
              처음으로
            </button>
          </>}
        </div>
      </div>

      {/* PlanBanner — 채팅 화면에만 표시 */}
      {step==="chat" && <PlanBanner plan={plan} trialDaysLeft={trialDaysLeft} onUpgrade={() => setShowUpgrade(true)} />}

      {showDoc && <DocModal onClose={() => setShowDoc(false)} />}
      {showHistory && <HistorySidebar histories={histories} onLoad={handleLoadHistory} onDelete={handleDeleteHistory} onClose={() => setShowHistory(false)} currentId={currentHistoryId} />}
      {showEmergency && <EmergencyModal onClose={() => setShowEmergency(false)} />}
      {showUpgrade && <UpgradeModal plan={plan} trialDaysLeft={trialDaysLeft} onClose={() => setShowUpgrade(false)} onUpgrade={() => { savePlan({...plan,type:"paid"}); setShowUpgrade(false); }} />}

      <div style={{ flex:1, overflowY:"auto", padding:"18px 16px", maxWidth:700, width:"100%", margin:"0 auto" }}>
        {step==="field" && <FieldSelect onSelect={handleFieldSelect} />}
        {step==="chat" && (
          <>
            {messages.length===0 && selectedField && (
              <div style={{ animation:"fadeSlideIn 0.4s ease-out" }}>
                <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderLeft:`3px solid ${selectedField.color}`, borderRadius:"0 12px 12px 0", padding:"14px 16px", marginBottom:16 }}>
                  <div style={{ color:C.text1, fontWeight:700, fontSize:14, marginBottom:3 }}>{selectedField.name} 상담!</div>
                  <div style={{ color:C.text3, fontSize:12 }}>{selectedField.desc}</div>
                </div>
                <div style={{ color:C.text3, fontSize:12, textAlign:"center", marginBottom:10 }}>자주 묻는 질문</div>
                <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:16 }}>
                  {[
                    `${selectedField.name} 관련 기본 절차와 필요한 서류를 알려주세요.`,
                    `${selectedField.name} 문제로 피해를 입었는데 어디에 신고해야 하나요?`,
                    `${selectedField.name} 관련 내용증명이나 고소장을 작성하고 싶어요.`
                  ].map((q,i) => (
                    <button key={i} onClick={() => sendMessage(q)}
                      style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"11px 14px", color:C.text2, fontSize:13, cursor:"pointer", textAlign:"left", fontFamily:"inherit", transition:"all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor=C.blue; e.currentTarget.style.background=C.blueLt; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background=C.surface; }}>
                      ! {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg,i) => <Message key={i} msg={msg} />)}
            {isStreaming && streamingText && <StreamingMessage text={streamingText} />}
            {isStreaming && !streamingText && (
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                <Logo size={30} borderRadius={8} />
                <TypingIndicator />
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {step==="chat" && (
        <div style={{ background:C.surface, borderTop:`1px solid ${C.border}`, padding:"11px 14px", position:"sticky", bottom:0 }}>
          <div style={{ maxWidth:700, margin:"0 auto", display:"flex", gap:8, alignItems:"flex-end" }}>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();} }}
              placeholder="법률 문제를 자세히 설명해 주세요..." rows={1} disabled={isStreaming}
              style={{ flex:1, background:C.bg, border:`1.5px solid ${C.border2}`, borderRadius:12, padding:"11px 14px", color:C.text1, fontSize:13.5, fontFamily:"'Noto Sans KR',sans-serif", lineHeight:1.6, maxHeight:120, overflowY:"auto", opacity:isStreaming?0.6:1, transition:"border-color 0.2s" }}
              onInput={e => { e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,120)+"px"; }} />
            {isStreaming ? (
              <button onClick={handleStop} style={{ width:40, height:40, borderRadius:10, border:"none", background:"#FEE2E2", color:C.red, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>■</button>
            ) : (
              <button onClick={() => sendMessage()} disabled={!input.trim()}
                style={{ width:40, height:40, borderRadius:10, border:"none", background:input.trim()?C.blue:C.border, color:input.trim()?"#fff":C.text3, fontSize:17, cursor:input.trim()?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s", flexShrink:0 }}>↑</button>
            )}
          </div>
          <p style={{ color:C.text3, fontSize:11, textAlign:"center", marginTop:7 }}>
            {isStreaming ? "응답 생성 중... ■ 버튼으로 중단" : `${isTrialActive()?`체험 D-${trialDaysLeft()} · `:isPaid()?"":`오늘 ${3-todayChatCount()}회 남음 · `}Enter 전송 · Shift+Enter 줄바꿈 · 법률구조공단 132`}
          </p>
        </div>
      )}
    </div>
  );
}
