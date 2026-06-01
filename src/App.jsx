import { useState, useRef, useEffect } from "react";

// ─── 상수 ───────────────────────────────────────────────
const FIELDS = [
  { id: "labor",     icon: "👷", name: "노동·고용",    desc: "임금체불, 부당해고, 직장 내 괴롭힘, 산재, 퇴직금",  color: "#1a4fa0" },
  { id: "estate",    icon: "🏠", name: "부동산·임대차",desc: "전세사기, 보증금 반환, 층간소음, 계약 해지",        color: "#0f766e" },
  { id: "family",    icon: "👨‍👩‍👧", name: "가사·상속",   desc: "이혼, 양육권, 상속 분쟁, 유언장",                  color: "#7c3aed" },
  { id: "consumer",  icon: "🛍️", name: "소비자·계약",  desc: "환불 거부, 계약 불이행, 사기, 소액사건",           color: "#b45309" },
  { id: "copyright", icon: "©️", name: "저작권·지재",  desc: "저작권 침해, 상표 등록, 콘텐츠 무단 도용",         color: "#0369a1" },
  { id: "cyber",     icon: "📱", name: "사이버·디지털", desc: "명예훼손, 딥페이크 피해, 개인정보 유출, 스토킹",   color: "#6d28d9" },
  { id: "finance",   icon: "💰", name: "금융·투자",     desc: "보이스피싱, 금융사기, 불법 대출, 코인 사기",       color: "#065f46" },
  { id: "criminal",  icon: "⚖️", name: "형사·피해자",  desc: "고소·고발 절차, 고소장 작성, 피해 구제",           color: "#9f1239" },
];

const EMERGENCY_CONTACTS = [
  { icon: "🚔", name: "경찰", number: "112", desc: "범죄 피해·긴급신고", color: "#1a4fa0" },
  { icon: "🏛️", name: "법률구조공단", number: "132", desc: "무료 법률 상담", color: "#0f766e" },
  { icon: "👷", name: "고용노동부", number: "1350", desc: "임금체불·노동 상담", color: "#b45309" },
  { icon: "🏠", name: "주택도시보증공사", number: "1566-9009", desc: "전세 피해 상담", color: "#065f46" },
  { icon: "💰", name: "금융감독원", number: "1332", desc: "금융 사기 신고", color: "#7c3aed" },
  { icon: "📱", name: "사이버범죄신고", number: "182", desc: "온라인 범죄 신고", color: "#6d28d9" },
  { icon: "⚖️", name: "대한법률구조공단", number: "132", desc: "소송 법률 지원", color: "#9f1239" },
  { icon: "🛡️", name: "여성긴급전화", number: "1366", desc: "가정폭력·성폭력", color: "#be185d" },
];

const DOCS = [
  {
    id: "complaint", icon: "📋", name: "고소장",
    fields: ["고소인 이름", "피고소인 이름", "피고소인 연락처(알면)", "범죄 발생 일시", "범죄 발생 장소", "피해 내용 (구체적으로)", "증거 (있으면)"],
    template: (d) => `고 소 장\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n고 소 인: ${d["고소인 이름"]||"___"}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n피고소인: ${d["피고소인 이름"]||"___"}  연락처: ${d["피고소인 연락처(알면)"]||"불상"}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n■ 고소 취지\n\n고소인은 피고소인을 아래와 같이 고소하오니 철저히 수사하여 엄중히 처벌하여 주시기 바랍니다.\n\n■ 범죄 사실\n\n1. 발생 일시: ${d["범죄 발생 일시"]||"___"}\n2. 발생 장소: ${d["범죄 발생 장소"]||"___"}\n\n3. 피해 내용:\n${d["피해 내용 (구체적으로)"]||"___"}\n\n■ 증거 자료\n\n${d["증거 (있으면)"]||"추후 제출 예정"}\n\n■ 결론\n\n위와 같은 사실로 피고소인을 고소하오니 수사하여 주시기 바랍니다.\n\n${new Date().getFullYear()}년 ${new Date().getMonth()+1}월 ${new Date().getDate()}일\n\n고소인: ${d["고소인 이름"]||"___"}  (인)\n\n○○경찰서장 귀중`
  },
  {
    id: "cert_mail", icon: "📝", name: "내용증명",
    fields: ["발신인 이름", "발신인 주소", "수신인 이름", "수신인 주소", "제목", "요구 사항 (구체적으로)", "이행 기한"],
    template: (d) => `내 용 증 명\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n발 신 인: ${d["발신인 이름"]||"___"}\n주    소: ${d["발신인 주소"]||"___"}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n수 신 인: ${d["수신인 이름"]||"___"}\n주    소: ${d["수신인 주소"]||"___"}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n제 목: ${d["제목"]||"___"}\n\n수신인에게 아래와 같이 통보합니다.\n\n■ 요구 사항\n\n${d["요구 사항 (구체적으로)"]||"___"}\n\n■ 이행 기한\n\n본 내용증명 수령일로부터 ${d["이행 기한"]||"___"} 이내에 이행하여 주시기 바랍니다.\n\n만약 위 기한 내에 이행하지 않을 경우, 법적 조치를 취할 것임을 알려드립니다.\n\n${new Date().getFullYear()}년 ${new Date().getMonth()+1}월 ${new Date().getDate()}일\n\n발신인: ${d["발신인 이름"]||"___"}  (인)`
  },
  {
    id: "wage_claim", icon: "💼", name: "임금체불 진정서",
    fields: ["진정인 이름", "진정인 연락처", "회사명", "회사 주소", "사업주 이름", "재직 기간", "체불 기간", "체불 금액", "체불 내용"],
    template: (d) => `진 정 서\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n진 정 인: ${d["진정인 이름"]||"___"}  (연락처: ${d["진정인 연락처"]||"___"})\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n피진정인: ${d["사업주 이름"]||"___"} (${d["회사명"]||"___"} 대표)\n주    소: ${d["회사 주소"]||"___"}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n■ 진정 취지\n\n진정인은 피진정인으로부터 임금을 지급받지 못하여 근로기준법 위반 사실을 진정하오니 조사하여 주시기 바랍니다.\n\n■ 진정 내용\n\n1. 재직 기간: ${d["재직 기간"]||"___"}\n2. 체불 기간: ${d["체불 기간"]||"___"}\n3. 체불 금액: ${d["체불 금액"]||"___"}원\n\n4. 체불 내용:\n${d["체불 내용"]||"___"}\n\n■ 요청 사항\n\n위 체불 임금의 즉각적인 지급을 요청합니다.\n\n${new Date().getFullYear()}년 ${new Date().getMonth()+1}월 ${new Date().getDate()}일\n\n진정인: ${d["진정인 이름"]||"___"}  (인)\n\n고용노동부 ○○지청장 귀중`
  },
  {
    id: "agreement", icon: "🤝", name: "합의서",
    fields: ["갑 이름", "갑 생년월일", "을 이름", "을 생년월일", "사건 내용", "합의 금액", "지급 방법 및 일정", "추가 합의 조건"],
    template: (d) => `합 의 서\n\n본 합의서는 아래 당사자 간에 다음과 같이 합의함.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n갑: ${d["갑 이름"]||"___"}  (생년월일: ${d["갑 생년월일"]||"___"})\n을: ${d["을 이름"]||"___"}  (생년월일: ${d["을 생년월일"]||"___"})\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n■ 사건 내용\n\n${d["사건 내용"]||"___"}\n\n■ 합의 내용\n\n1. 을은 갑에게 합의금 ${d["합의 금액"]||"___"}원을 지급하기로 한다.\n2. 지급 방법: ${d["지급 방법 및 일정"]||"___"}\n3. ${d["추가 합의 조건"]||"갑은 위 합의금 수령 후 을에 대한 민·형사상 모든 법적 절차를 취하지 않기로 한다."}\n\n■ 특약 사항\n\n본 합의서 작성 이후 상호 간에 어떠한 이의를 제기하지 않기로 한다.\n\n${new Date().getFullYear()}년 ${new Date().getMonth()+1}월 ${new Date().getDate()}일\n\n갑: ${d["갑 이름"]||"___"}  (서명/인)\n을: ${d["을 이름"]||"___"}  (서명/인)`
  },
];

// ─── 마크다운 렌더러 ────────────────────────────────────
function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} style={{ color: "#e8edf5", fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} style={{ background: "#0a1018", color: "#4a9eff", padding: "1px 6px", borderRadius: 4, fontSize: 12, fontFamily: "monospace" }}>{part.slice(1, -1)}</code>;
    return part;
  });
}

function parseMarkdown(text) {
  const lines = text.split("\n");
  const result = [];
  let key = 0;
  for (const line of lines) {
    if (line.startsWith("### "))
      result.push(<div key={key++} style={{ color: "#93c5fd", fontWeight: 700, fontSize: 13, marginTop: 14, marginBottom: 4 }}>{line.slice(4)}</div>);
    else if (line.startsWith("## "))
      result.push(<div key={key++} style={{ color: "#4a9eff", fontWeight: 700, fontSize: 14, marginTop: 16, marginBottom: 6, borderBottom: "1px solid #1e3a5f", paddingBottom: 4 }}>{line.slice(3)}</div>);
    else if (line.startsWith("# "))
      result.push(<div key={key++} style={{ color: "#e8edf5", fontWeight: 700, fontSize: 16, marginTop: 16, marginBottom: 8 }}>{line.slice(2)}</div>);
    else if (line.match(/^(\d+)\.\s/)) {
      const num = line.match(/^(\d+)/)[1];
      const content = line.replace(/^\d+\.\s/, "");
      result.push(<div key={key++} style={{ display: "flex", gap: 8, marginBottom: 4 }}><span style={{ color: "#4a9eff", fontWeight: 700, minWidth: 18, fontSize: 13, flexShrink: 0 }}>{num}.</span><span style={{ color: "#c5d0e0", fontSize: 13, lineHeight: 1.7 }}>{renderInline(content)}</span></div>);
    } else if (line.startsWith("- ") || line.startsWith("• "))
      result.push(<div key={key++} style={{ display: "flex", gap: 8, marginBottom: 3 }}><span style={{ color: "#4a9eff", fontSize: 12, marginTop: 3, flexShrink: 0 }}>▸</span><span style={{ color: "#c5d0e0", fontSize: 13, lineHeight: 1.7 }}>{renderInline(line.slice(2))}</span></div>);
    else if (line.trim() === "")
      result.push(<div key={key++} style={{ height: 8 }} />);
    else
      result.push(<div key={key++} style={{ color: "#c5d0e0", fontSize: 13, lineHeight: 1.8, marginBottom: 2 }}>{renderInline(line)}</div>);
  }
  return result;
}

// ─── 서브 컴포넌트 ──────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "14px 18px", background: "#1a2332", borderRadius: 16, borderBottomLeftRadius: 4, width: "fit-content" }}>
      {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#4a9eff", animation: "bounce 1.2s ease-in-out infinite", animationDelay: `${i*0.2}s` }} />)}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(msg.content); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 24, animation: "fadeSlideIn 0.3s ease-out" }}>
      {!isUser && <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #1a4fa0, #4a9eff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginRight: 10, flexShrink: 0, marginTop: 2 }}>⚖️</div>}
      <div style={{ maxWidth: "78%", position: "relative" }}>
        <div style={{ background: isUser ? "linear-gradient(135deg, #1a4fa0, #2563eb)" : "#1a2332", color: "#e8edf5", padding: "13px 17px", borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px", fontSize: 14, lineHeight: 1.7, boxShadow: isUser ? "0 2px 12px rgba(37,99,235,0.3)" : "0 2px 8px rgba(0,0,0,0.2)", wordBreak: "break-word" }}>
          {isUser ? <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span> : <div>{parseMarkdown(msg.content)}</div>}
        </div>
        {!isUser && (
          <button onClick={handleCopy} style={{ marginTop: 4, background: "none", border: "none", color: copied ? "#34d399" : "#4a7299", fontSize: 11, cursor: "pointer", padding: "2px 4px" }}>
            {copied ? "✓ 복사됨" : "복사"}
          </button>
        )}
      </div>
    </div>
  );
}

// 스트리밍 메시지 (실시간 타이핑 효과)
function StreamingMessage({ text }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 24, animation: "fadeSlideIn 0.3s ease-out" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #1a4fa0, #4a9eff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginRight: 10, flexShrink: 0, marginTop: 2 }}>⚖️</div>
      <div style={{ maxWidth: "78%" }}>
        <div style={{ background: "#1a2332", color: "#e8edf5", padding: "13px 17px", borderRadius: "18px 18px 18px 4px", fontSize: 14, lineHeight: 1.7, boxShadow: "0 2px 8px rgba(0,0,0,0.2)", wordBreak: "break-word" }}>
          <div>{parseMarkdown(text)}</div>
          <span style={{ display: "inline-block", width: 2, height: 14, background: "#4a9eff", marginLeft: 2, animation: "blink 1s step-end infinite", verticalAlign: "middle" }} />
        </div>
      </div>
    </div>
  );
}

// ─── 긴급 연락처 모달 ──────────────────────────────────
function EmergencyModal({ onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#111827", borderRadius: 20, border: "1px solid #3b1515", width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ color: "#f87171", fontWeight: 700, fontSize: 16 }}>🚨 긴급 법률 연락처</div>
            <div style={{ color: "#4a7299", fontSize: 12, marginTop: 2 }}>24시간 무료 상담 기관</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#4a7299", fontSize: 22, cursor: "pointer" }}>×</button>
        </div>
        <div style={{ background: "#1a0a0a", border: "1px solid #3b1515", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 10 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
          <p style={{ color: "#f87171", fontSize: 12, lineHeight: 1.7 }}>생명 위협·즉각적 범죄 피해는 반드시 <strong>112</strong>로 먼저 신고하세요</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {EMERGENCY_CONTACTS.map((c, i) => (
            <div key={i} style={{ background: "#0d1520", border: `1px solid ${c.color}30`, borderLeft: `3px solid ${c.color}`, borderRadius: "0 12px 12px 0", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 22 }}>{c.icon}</span>
                <div>
                  <div style={{ color: "#e8edf5", fontWeight: 700, fontSize: 13 }}>{c.name}</div>
                  <div style={{ color: "#4a7299", fontSize: 11, marginTop: 2 }}>{c.desc}</div>
                </div>
              </div>
              <a href={`tel:${c.number.replace(/-/g,"")}`} style={{ textDecoration: "none" }}>
                <div style={{ background: `${c.color}20`, border: `1px solid ${c.color}50`, borderRadius: 20, padding: "6px 14px", color: "#4a9eff", fontWeight: 700, fontSize: 15, fontFamily: "monospace", cursor: "pointer" }}>
                  {c.number}
                </div>
              </a>
            </div>
          ))}
        </div>
        <p style={{ color: "#2d4a6b", fontSize: 11, textAlign: "center", marginTop: 16 }}>번호를 탭하면 바로 전화 연결됩니다</p>
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#111827", borderRadius: 20, border: "1px solid #1e3a5f", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ color: "#e8edf5", fontWeight: 700, fontSize: 16 }}>📄 서류 자동 생성</div>
            <div style={{ color: "#4a7299", fontSize: 12, marginTop: 2 }}>정보를 입력하면 서류 초안을 만들어 드려요</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#4a7299", fontSize: 22, cursor: "pointer" }}>×</button>
        </div>
        {/* 항상 표시되는 참고용 경고 배너 */}
        <div style={{ background: "#1c1207", border: "1px solid #92400e", borderRadius: 12, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
          <p style={{ color: "#fbbf24", fontSize: 11, lineHeight: 1.7 }}>
            <strong>본 서류는 참고용 초안입니다.</strong> 실제 제출 전 반드시 법률 전문가의 검토를 받으시기 바랍니다. 서류 내용의 정확성에 대해 서비스는 책임을 지지 않습니다.
          </p>
        </div>

        {!selectedDoc ? (
          <div>
            <div style={{ color: "#6b7fa3", fontSize: 12, marginBottom: 12 }}>서류 종류를 선택하세요</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {DOCS.map(d => (
                <button key={d.id} onClick={() => { setSelectedDoc(d.id); setFormData({}); setResult(""); }}
                  style={{ background: "#0d1520", border: "1px solid #1e3a5f", borderRadius: 14, padding: 16, cursor: "pointer", textAlign: "left", transition: "all 0.2s", fontFamily: "'Noto Sans KR', sans-serif" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.background = "#1a2332"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e3a5f"; e.currentTarget.style.background = "#0d1520"; }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{d.icon}</div>
                  <div style={{ color: "#e8edf5", fontWeight: 600, fontSize: 13 }}>{d.name}</div>
                </button>
              ))}
            </div>
          </div>
        ) : !result ? (
          <div>
            <button onClick={() => setSelectedDoc(null)} style={{ background: "none", border: "none", color: "#4a9eff", fontSize: 12, cursor: "pointer", marginBottom: 12, padding: 0 }}>← 다른 서류 선택</button>
            <div style={{ color: "#e8edf5", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>{doc.icon} {doc.name} 작성</div>

            {/* 작성 전 경고 */}
            <div style={{ background: "#0d1a2e", border: "1px solid #1e3a5f", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 8 }}>
              <span style={{ fontSize: 13, flexShrink: 0 }}>💡</span>
              <p style={{ color: "#6b7fa3", fontSize: 11, lineHeight: 1.7 }}>
                입력하신 정보를 바탕으로 <strong style={{ color: "#4a9eff" }}>참고용 초안</strong>을 생성합니다. 실제 제출 전 내용을 직접 확인하고 필요 시 법률 전문가에게 검토를 요청하세요.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {doc.fields.map(field => (
                <div key={field}>
                  <div style={{ color: "#6b7fa3", fontSize: 12, marginBottom: 4 }}>{field}</div>
                  {field.includes("내용") || field.includes("피해") || field.includes("합의 조건") ? (
                    <textarea value={formData[field]||""} onChange={e => setFormData(p => ({...p,[field]:e.target.value}))} rows={3}
                      style={{ width: "100%", background: "#0d1520", border: "1px solid #1e3a5f", borderRadius: 10, padding: "10px 12px", color: "#e8edf5", fontSize: 13, resize: "none", fontFamily: "'Noto Sans KR', sans-serif", outline: "none" }} placeholder={`${field}을 입력하세요`} />
                  ) : (
                    <input value={formData[field]||""} onChange={e => setFormData(p => ({...p,[field]:e.target.value}))}
                      style={{ width: "100%", background: "#0d1520", border: "1px solid #1e3a5f", borderRadius: 10, padding: "10px 12px", color: "#e8edf5", fontSize: 13, fontFamily: "'Noto Sans KR', sans-serif", outline: "none" }} placeholder={`${field}을 입력하세요`} />
                  )}
                </div>
              ))}
            </div>
            <button onClick={handleGenerate} style={{ width: "100%", padding: 14, background: "linear-gradient(135deg, #1a4fa0, #2563eb)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>참고용 초안 생성하기 →</button>
            <p style={{ color: "#2d4a6b", fontSize: 11, textAlign: "center", marginTop: 8 }}>빈 칸은 ___으로 표시됩니다</p>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ color: "#34d399", fontSize: 13, fontWeight: 600 }}>✓ 초안 생성 완료</div>
              <button onClick={() => setResult("")} style={{ background: "none", border: "none", color: "#4a9eff", fontSize: 12, cursor: "pointer" }}>← 다시 작성</button>
            </div>

            {/* 완성 후 강조 경고 */}
            <div style={{ background: "#1c1207", border: "2px solid #92400e", borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
              <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: 12, marginBottom: 6 }}>⚠️ 사용 전 반드시 확인하세요</div>
              <div style={{ color: "#fcd34d", fontSize: 11, lineHeight: 1.8 }}>
                · 이 서류는 <strong>참고용 초안</strong>이며 법적 효력이 보장되지 않습니다<br/>
                · 내용의 정확성을 직접 검토하신 후 사용하세요<br/>
                · 중요한 법적 절차에는 <strong>반드시 법률 전문가의 검토</strong>를 받으세요
              </div>
            </div>

            <pre style={{ background: "#0d1520", border: "1px solid #1e3a5f", borderRadius: 14, padding: 16, color: "#c5d0e0", fontSize: 12, lineHeight: 1.9, overflowX: "auto", whiteSpace: "pre-wrap", fontFamily: "'Noto Sans KR', sans-serif", marginBottom: 14 }}>{result}</pre>
            <button onClick={handleCopy} style={{ width: "100%", padding: 13, background: copied ? "#065f46" : "linear-gradient(135deg, #1a4fa0, #2563eb)", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", transition: "all 0.3s" }}>
              {copied ? "✓ 복사 완료!" : "📋 전체 복사"}
            </button>
            <p style={{ color: "#4a7299", fontSize: 11, textAlign: "center", marginTop: 8 }}>복사 후 메모장·워드에 붙여넣어 수정 후 전문가 검토를 받으세요</p>
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
      <div style={{ textAlign: "center", padding: "24px 0 20px" }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>⚖️</div>
        <p style={{ color: "#e8edf5", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>어떤 법률 문제로 오셨나요?</p>
        <p style={{ color: "#4a7299", fontSize: 12 }}>분야를 선택하면 더 정확한 상담을 받을 수 있어요</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        {FIELDS.map(f => (
          <button key={f.id} onClick={() => onSelect(f)}
            style={{ background: "#111827", border: "1px solid #1e3a5f", borderRadius: 14, padding: "16px 14px", cursor: "pointer", textAlign: "left", transition: "all 0.2s", fontFamily: "'Noto Sans KR', sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1a2332"; e.currentTarget.style.borderColor = f.color; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#111827"; e.currentTarget.style.borderColor = "#1e3a5f"; }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>{f.icon}</span>
              <span style={{ color: "#e8edf5", fontWeight: 700, fontSize: 13 }}>{f.name}</span>
            </div>
            <div style={{ color: "#4a7299", fontSize: 11, lineHeight: 1.5 }}>{f.desc}</div>
          </button>
        ))}
      </div>
      <button onClick={() => onSelect(null)} style={{ width: "100%", padding: 12, background: "#0d1520", border: "1px solid #1e3a5f", borderRadius: 12, color: "#6b7fa3", fontSize: 13, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
        분야 구분 없이 바로 상담하기
      </button>
      <div style={{ background: "#0d1520", border: "1px solid #1a2d4a", borderRadius: 14, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start", marginTop: 12 }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
        <p style={{ color: "#4a7299", fontSize: 11, lineHeight: 1.7 }}>본 서비스는 법률 <b style={{ color: "#6b8ab0" }}>참고 정보</b> 제공 목적입니다. 살인·강간 등 중대 범죄는 즉시 <b style={{ color: "#6b8ab0" }}>112</b> 또는 법률구조공단 <b style={{ color: "#6b8ab0" }}>132</b>로 연락하세요.</p>
      </div>
    </div>
  );
}

// ─── 히스토리 사이드바 ──────────────────────────────────
function HistorySidebar({ histories, onLoad, onDelete, onClose, currentId }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
      <div style={{ flex: 1, background: "rgba(0,0,0,0.5)" }} onClick={onClose} />
      <div style={{ width: 280, background: "#0d1520", borderLeft: "1px solid #1e3a5f", display: "flex", flexDirection: "column", animation: "slideInRight 0.25s ease-out" }}>
        <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid #1a2d4a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#e8edf5", fontWeight: 700, fontSize: 15 }}>📂 상담 기록</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#4a7299", fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
          {histories.length === 0 ? (
            <div style={{ color: "#4a7299", fontSize: 12, textAlign: "center", marginTop: 40 }}>저장된 상담 기록이 없어요</div>
          ) : histories.map(h => (
            <div key={h.id} style={{ background: h.id === currentId ? "#1a2332" : "none", border: h.id === currentId ? "1px solid #2563eb" : "1px solid transparent", borderRadius: 12, padding: "10px 12px", marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }} onClick={() => onLoad(h)}>
                <div style={{ flex: 1 }}>
                  {h.field && <div style={{ fontSize: 10, color: "#4a9eff", marginBottom: 3 }}>{h.field.icon} {h.field.name}</div>}
                  <div style={{ color: "#c5d0e0", fontSize: 12, lineHeight: 1.5, marginBottom: 4 }}>{h.messages[0]?.content.slice(0, 40)}...</div>
                  <div style={{ color: "#2d4a6b", fontSize: 10 }}>{h.date} · {h.messages.filter(m => m.role==="user").length}회</div>
                </div>
                <button onClick={e => { e.stopPropagation(); onDelete(h.id); }} style={{ background: "none", border: "none", color: "#4a7299", fontSize: 14, cursor: "pointer", padding: "0 0 0 8px", flexShrink: 0 }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 업그레이드 모달 ─────────────────────────────────────
function UpgradeModal({ plan, trialDaysLeft, onClose, onUpgrade }) {
  const isTrial = plan.type === "trial";
  const daysLeft = trialDaysLeft();
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#111827", borderRadius: 24, border: "1px solid #2563eb", width: "100%", maxWidth: 420, padding: 28, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>⚡</div>
        <div style={{ color: "#e8edf5", fontFamily: "'Noto Serif KR', serif", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
          {isTrial && daysLeft === 0 ? "3일 체험이 종료되었어요" : "오늘 무료 상담이 모두 사용됐어요"}
        </div>
        <p style={{ color: "#6b7fa3", fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
          {isTrial && daysLeft === 0
            ? "체험 기간이 끝났어요. 계속 이용하시려면 구독을 시작하세요."
            : "무료 플랜은 하루 3회 상담이 가능해요. 내일 다시 이용하거나 구독하세요."}
        </p>

        {/* 플랜 카드 */}
        <div style={{ background: "#0d1520", border: "2px solid #2563eb", borderRadius: 16, padding: "20px 18px", marginBottom: 16, textAlign: "left", position: "relative" }}>
          <div style={{ position: "absolute", top: -10, right: 14, background: "#2563eb", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>추천</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ color: "#e8edf5", fontWeight: 700, fontSize: 16 }}>스탠다드</div>
            <div style={{ color: "#4a9eff", fontWeight: 800, fontSize: 20 }}>월 9,900원</div>
          </div>
          {["AI 법률 상담 무제한", "서류 자동생성 무제한 (고소장·내용증명 등)", "상담 기록 무제한 저장", "8개 분야 전문 상담"].map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <span style={{ color: "#4a9eff" }}>✓</span>
              <span style={{ color: "#c5d0e0", fontSize: 13 }}>{f}</span>
            </div>
          ))}
        </div>

        <button onClick={onUpgrade}
          style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #1a4fa0, #2563eb)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", marginBottom: 10 }}>
          월 9,900원으로 시작하기 →
        </button>
        <button onClick={onClose}
          style={{ background: "none", border: "none", color: "#4a7299", fontSize: 13, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
          {isTrial && daysLeft === 0 ? "무료로 하루 3회만 계속 이용" : "내일 다시 이용하기"}
        </button>
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
      <div style={{ background: "linear-gradient(135deg, #1a3a6b20, #2563eb20)", border: "1px solid #2563eb40", padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#93c5fd", fontSize: 12 }}>🎁 무료 체험 <strong style={{ color: "#4a9eff" }}>D-{daysLeft}</strong> · 모든 기능 이용 가능</span>
        <button onClick={onUpgrade} style={{ background: "none", border: "1px solid #2563eb", borderRadius: 20, padding: "3px 10px", color: "#4a9eff", fontSize: 11, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>구독 →</button>
      </div>
    );
  }
  return (
    <div style={{ background: "#0d1520", border: "1px solid #1e3a5f", padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "#4a7299", fontSize: 12 }}>무료 플랜 · 하루 3회 상담 · 서류생성 제한</span>
      <button onClick={onUpgrade} style={{ background: "linear-gradient(135deg, #1a4fa0, #2563eb)", border: "none", borderRadius: 20, padding: "4px 12px", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>업그레이드</button>
    </div>
  );
}

// ─── 시스템 프롬프트 빌더 ────────────────────────────────
function buildSystemPrompt(field) {
  const base = `당신은 대한민국 법률 전문 AI 상담사입니다. 법률 관련 정보와 서류 초안 작성을 도와드립니다. 법률 전문가 상담 전 기초 정보를 제공하는 서비스입니다.\n\n## 중요 원칙:\n1. 살인, 강간 등 중대 범죄는 반드시 공식 법률기관을 안내하세요.\n2. 구체적인 상황에 맞는 실질적인 정보를 제공하세요.\n3. 필요한 서류 목록, 절차, 기간, 비용을 명확히 설명하세요.\n4. 법률 조문이나 판례가 있다면 참고로 언급하세요.\n5. 마지막에는 항상 "이 정보는 법률 참고용이며, 중요한 사안은 법률전문가와 직접 상담하세요"를 덧붙이세요.\n6. 친근하고 이해하기 쉬운 한국어로 답변하세요.\n7. 마크다운 형식(**, ##, - 등)을 적극 활용하여 가독성 높게 작성하세요.`;
  if (!field) return base;
  return base + `\n\n## 이번 상담 전문 분야: ${field.name}\n${field.desc}\n이 분야에 특화하여 더 상세하고 실질적인 정보를 제공하세요.`;
}

// ─── 메인 앱 ────────────────────────────────────────────
export default function LegalAI() {
  const [step, setStep] = useState("terms");
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem("legal_ai_key") || "");
  const [keyInput, setKeyInput] = useState("");
  const [selectedField, setSelectedField] = useState(null);
  const [messages, setMessages] = useState([]);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [input, setInput] = useState("");
  const [showDoc, setShowDoc] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [histories, setHistories] = useState(() => { try { return JSON.parse(localStorage.getItem("legal_ai_histories")||"[]"); } catch { return []; } });
  const [currentHistoryId, setCurrentHistoryId] = useState(null);
  const bottomRef = useRef(null);
  const abortRef = useRef(null);

  // ── 무료/유료 플랜 관리 ──
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [plan, setPlan] = useState(() => {
    const saved = localStorage.getItem("legal_plan");
    if (saved) return JSON.parse(saved);
    return { type: "trial", startDate: Date.now(), chatCount: 0, lastChatDate: "" };
  });

  const savePlan = (updated) => {
    setPlan(updated);
    localStorage.setItem("legal_plan", JSON.stringify(updated));
  };

  // 3일 체험 기간 계산
  const trialDaysLeft = () => {
    if (plan.type !== "trial") return 0;
    const diff = Date.now() - plan.startDate;
    const daysUsed = Math.floor(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, 3 - daysUsed);
  };

  const isTrialActive = () => trialDaysLeft() > 0;
  const isPaid = () => plan.type === "paid";
  const isFree = () => !isTrialActive() && !isPaid();

  // 오늘 채팅 횟수 확인 (무료 플랜: 하루 3회)
  const todayStr = new Date().toLocaleDateString();
  const todayChatCount = () => {
    if (plan.lastChatDate !== todayStr) return 0;
    return plan.chatCount || 0;
  };

  const canChat = () => {
    if (isTrialActive() || isPaid()) return true;
    return todayChatCount() < 3; // 무료: 하루 3회
  };

  const canUseDoc = () => isTrialActive() || isPaid();
  const canUsePrecedent = () => isPaid();

  const incrementChatCount = () => {
    if (isTrialActive() || isPaid()) return;
    const today = new Date().toLocaleDateString();
    const count = plan.lastChatDate === today ? (plan.chatCount || 0) + 1 : 1;
    savePlan({ ...plan, chatCount: count, lastChatDate: today });
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streamingText, isStreaming]);
  useEffect(() => { if (sessionStorage.getItem("legal_ai_key") && localStorage.getItem("terms_agreed")) setStep("field"); else if (sessionStorage.getItem("legal_ai_key")) setStep("terms"); }, []);

  const saveHistory = (msgs, field) => {
    if (!msgs.length) return;
    const id = currentHistoryId || Date.now().toString();
    const entry = { id, field, messages: msgs, date: new Date().toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) };
    const updated = [entry, ...histories.filter(h => h.id !== id)].slice(0, 20);
    setHistories(updated);
    setCurrentHistoryId(id);
    localStorage.setItem("legal_ai_histories", JSON.stringify(updated));
  };

  const handleEnterKey = () => {
    if (keyInput.startsWith("sk-")) { sessionStorage.setItem("legal_ai_key", keyInput); setApiKey(keyInput); setStep("field"); }
  };

  const handleAgreeTerms = () => {
    localStorage.setItem("terms_agreed", "1");
    setStep("api");
  };

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
    const updated = histories.filter(h => h.id !== id);
    setHistories(updated); localStorage.setItem("legal_ai_histories", JSON.stringify(updated));
    if (currentHistoryId === id) { setMessages([]); setCurrentHistoryId(null); }
  };

  const handleStop = () => { if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; } };

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || isStreaming) return;
    if (!canChat()) { setShowUpgrade(true); return; }
    incrementChatCount();
    setInput("");
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setIsStreaming(true);
    setStreamingText("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          stream: true,
          system: buildSystemPrompt(selectedField),
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        const err = await response.json();
        const errMsg = err.error?.type === "authentication_error" ? "API 키가 올바르지 않습니다." : err.error?.type === "rate_limit_error" ? "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." : `오류: ${err.error?.message || response.statusText}`;
        setMessages([...newMessages, { role: "assistant", content: errMsg }]);
        setIsStreaming(false); setStreamingText(""); return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
                fullText += parsed.delta.text;
                setStreamingText(fullText);
              }
            } catch {}
          }
        }
      }

      const final = [...newMessages, { role: "assistant", content: fullText || "죄송합니다. 응답을 받지 못했습니다." }];
      setMessages(final);
      saveHistory(final, selectedField);
    } catch (e) {
      if (e.name !== "AbortError") {
        setMessages([...newMessages, { role: "assistant", content: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요." }]);
      } else if (streamingText) {
        const partial = [...newMessages, { role: "assistant", content: streamingText + "\n\n*(응답이 중단되었습니다)*" }];
        setMessages(partial);
        saveHistory(partial, selectedField);
      }
    } finally {
      setIsStreaming(false); setStreamingText(""); abortRef.current = null;
    }
  };

  // ── 이용약관 동의 화면 ──
  if (step === "terms") {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0f1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Sans KR', sans-serif", padding: 20 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Noto+Serif+KR:wght@400;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        <div style={{ background: "#111827", borderRadius: 24, padding: "36px 32px", maxWidth: 480, width: "100%", border: "1px solid #1e3a5f", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", animation: "fadeIn 0.5s ease-out" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <h1 style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 20, color: "#e8edf5", fontWeight: 700, marginBottom: 6 }}>서비스 이용 전 꼭 확인하세요</h1>
            <p style={{ color: "#4a7299", fontSize: 12 }}>아래 내용을 읽고 동의하셔야 서비스를 이용할 수 있습니다</p>
          </div>

          {/* 핵심 고지 박스 */}
          <div style={{ background: "#1a0a0a", border: "1px solid #7f1d1d", borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ color: "#f87171", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>⚠️ 반드시 확인하세요</div>
            {[
              "본 서비스는 법률 정보를 제공하는 서비스이며, 변호사 등 법률 전문가의 법률 서비스를 대체하지 않습니다.",
              "AI가 제공하는 모든 정보는 참고용이며, 실제 법적 효력이 없습니다.",
              "서류 초안은 참고용으로만 사용하시고, 실제 제출 전 반드시 법률 전문가의 검토를 받으시기 바랍니다.",
              "본 서비스 이용으로 인한 법적 결과에 대해 서비스 운영자는 책임을 지지 않습니다.",
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                <span style={{ color: "#f87171", fontSize: 11, flexShrink: 0, marginTop: 2 }}>✗</span>
                <p style={{ color: "#fca5a5", fontSize: 12, lineHeight: 1.7 }}>{t}</p>
              </div>
            ))}
          </div>

          {/* 이용약관 요약 */}
          <div style={{ background: "#0d1520", border: "1px solid #1e3a5f", borderRadius: 14, padding: "16px 18px", marginBottom: 16, maxHeight: 180, overflowY: "auto" }}>
            <div style={{ color: "#4a9eff", fontWeight: 700, fontSize: 12, marginBottom: 10 }}>📄 이용약관 요약</div>
            {[
              ["서비스 목적", "법률 관련 정보 제공 및 서류 초안 작성 보조"],
              ["정보의 성격", "모든 정보는 참고용이며 법적 효력 없음"],
              ["개인정보 처리", "입력된 정보는 서버에 저장되지 않으며 AI 응답 생성에만 사용"],
              ["책임 한계", "정보의 정확성 및 이용 결과에 대해 운영자 책임 없음"],
              ["서비스 변경", "서비스 내용은 사전 공지 없이 변경될 수 있음"],
              ["준거법", "본 약관은 대한민국 법률에 따라 해석됨"],
            ].map(([title, desc], i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <span style={{ color: "#6b7fa3", fontSize: 11, fontWeight: 600 }}>{title}: </span>
                <span style={{ color: "#c5d0e0", fontSize: 11 }}>{desc}</span>
              </div>
            ))}
          </div>

          {/* 개인정보처리방침 요약 */}
          <div style={{ background: "#0d1520", border: "1px solid #1e3a5f", borderRadius: 14, padding: "16px 18px", marginBottom: 24 }}>
            <div style={{ color: "#4a9eff", fontWeight: 700, fontSize: 12, marginBottom: 10 }}>🔒 개인정보처리방침</div>
            {[
              "수집 항목: 서비스 이용 중 입력한 법률 상담 내용, 서류 작성 정보",
              "수집 목적: AI 응답 생성 (서버 저장 없음, 세션 종료 시 자동 삭제)",
              "제3자 제공: Anthropic API를 통한 AI 응답 생성 목적으로만 전송되며, AI 모델 학습에는 사용되지 않습니다",
              "보유 기간: 세션 종료 즉시 삭제 (상담 기록은 사용자 기기에만 저장)",
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <span style={{ color: "#4a9eff", fontSize: 11, flexShrink: 0 }}>·</span>
                <p style={{ color: "#c5d0e0", fontSize: 11, lineHeight: 1.6 }}>{t}</p>
              </div>
            ))}
          </div>

          <button onClick={handleAgreeTerms}
            style={{ width: "100%", padding: "14px", borderRadius: 12, background: "linear-gradient(135deg, #1a4fa0, #2563eb)", color: "#fff", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", marginBottom: 10 }}>
            위 내용을 모두 확인하였으며 동의합니다 →
          </button>
          <p style={{ color: "#2d4a6b", fontSize: 11, textAlign: "center" }}>동의하지 않으시면 서비스를 이용할 수 없습니다</p>
        </div>
      </div>
    );
  }

  // ── API 키 입력 화면 ──
  if (step === "api") {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0f1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Sans KR', sans-serif", padding: 20 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Noto+Serif+KR:wght@400;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        <div style={{ background: "#111827", borderRadius: 24, padding: "48px 40px", maxWidth: 440, width: "100%", textAlign: "center", border: "1px solid #1e3a5f", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", animation: "fadeIn 0.5s ease-out" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>⚖️</div>
          <h1 style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 26, color: "#e8edf5", marginBottom: 8, fontWeight: 700 }}>법률 길잡이</h1>
          <p style={{ color: "#6b7fa3", fontSize: 14, marginBottom: 8, lineHeight: 1.6 }}>전문가 상담 전, 먼저 알아보세요</p>
          <div style={{ background: "#0d1520", borderRadius: 12, padding: "12px 16px", marginBottom: 28, border: "1px solid #1e3a5f" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {FIELDS.map(f => <div key={f.id} style={{ color: "#4a9eff", fontSize: 11, textAlign: "left" }}>{f.icon} {f.name}</div>)}
            </div>
          </div>
          <p style={{ color: "#4a7299", fontSize: 12, marginBottom: 16 }}>Anthropic API 키를 입력하세요</p>
          <input type="password" value={keyInput} onChange={e => setKeyInput(e.target.value)} onKeyDown={e => e.key==="Enter" && handleEnterKey()} placeholder="sk-ant-..."
            style={{ width: "100%", padding: "13px 16px", background: "#0d1520", border: "1px solid #1e3a5f", borderRadius: 12, color: "#e8edf5", fontSize: 14, marginBottom: 12, outline: "none", fontFamily: "monospace" }} />
          <button onClick={handleEnterKey} disabled={!keyInput.startsWith("sk-")}
            style={{ width: "100%", padding: "13px", borderRadius: 12, background: keyInput.startsWith("sk-") ? "linear-gradient(135deg, #1a4fa0, #2563eb)" : "#1a2332", color: keyInput.startsWith("sk-") ? "#fff" : "#4a5568", border: "none", fontSize: 15, fontWeight: 600, cursor: keyInput.startsWith("sk-") ? "pointer" : "not-allowed", fontFamily: "'Noto Sans KR', sans-serif", transition: "all 0.2s" }}>
            상담 시작하기 →
          </button>
          <p style={{ color: "#2d4a6b", fontSize: 11, marginTop: 14 }}>API 키는 세션 동안만 유지되며 서버에 저장되지 않습니다</p>
        </div>
      </div>
    );
  }

  const Header = () => (
    <>
      <div style={{ background: "#0d1520", borderBottom: "1px solid #1a2d4a", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, position: "sticky", top: 0, zIndex: 10, flexWrap: "wrap" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #1a4fa0, #4a9eff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>⚖️</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "#e8edf5", fontFamily: "'Noto Serif KR', serif", fontWeight: 700, fontSize: 15 }}>법률 길잡이</div>
          <div style={{ color: "#4a9eff", fontSize: 10 }}>{selectedField && step==="chat" ? `${selectedField.icon} ${selectedField.name} 상담 중` : "● 24시간 상담 가능"}</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => setShowEmergency(true)}
            style={{ background: "#1a0a0a", border: "1px solid #3b1515", borderRadius: 20, padding: "5px 11px", color: "#f87171", fontSize: 11, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 600 }}>
            🚨 긴급연락처
          </button>
          <button onClick={() => setShowHistory(true)}
            style={{ background: "none", border: "1px solid #1e3a5f", borderRadius: 20, padding: "5px 11px", color: "#4a7299", fontSize: 11, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
            📂 기록
          </button>
          {step === "chat" && <>
            <button
              onClick={() => { if (!canUseDoc()) { setShowUpgrade(true); return; } setShowDoc(true); }}
              style={{ background: "none", border: `1px solid ${canUseDoc() ? "#1e3a5f" : "#92400e"}`, borderRadius: 20, padding: "5px 11px", color: canUseDoc() ? "#4a9eff" : "#fbbf24", fontSize: 11, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
              📄 서류생성{!canUseDoc() ? " 🔒" : ""}
            </button>
            <button onClick={handleNewChat}
              style={{ background: "none", border: "1px solid #1e3a5f", borderRadius: 20, padding: "5px 11px", color: "#4a7299", fontSize: 11, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
              + 새상담
            </button>
          </>}
        </div>
      </div>
      <PlanBanner plan={plan} trialDaysLeft={trialDaysLeft} onUpgrade={() => setShowUpgrade(true)} />
    </>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1a", display: "flex", flexDirection: "column", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Noto+Serif+KR:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }
        textarea:focus, input:focus { outline: none; border-color: #2563eb !important; }
        textarea { resize: none; }
      `}</style>

      <Header />
      {showDoc && <DocModal onClose={() => setShowDoc(false)} />}
      {showHistory && <HistorySidebar histories={histories} onLoad={handleLoadHistory} onDelete={handleDeleteHistory} onClose={() => setShowHistory(false)} currentId={currentHistoryId} />}
      {showEmergency && <EmergencyModal onClose={() => setShowEmergency(false)} />}
      {showUpgrade && <UpgradeModal plan={plan} trialDaysLeft={trialDaysLeft} onClose={() => setShowUpgrade(false)} onUpgrade={() => { savePlan({ ...plan, type: "paid" }); setShowUpgrade(false); }} />}

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", maxWidth: 720, width: "100%", margin: "0 auto" }}>
        {step === "field" && <FieldSelect onSelect={handleFieldSelect} />}
        {step === "chat" && (
          <>
            {messages.length === 0 && selectedField && (
              <div style={{ animation: "fadeSlideIn 0.4s ease-out" }}>
                <div style={{ background: `${selectedField.color}15`, border: `1px solid ${selectedField.color}40`, borderRadius: 16, padding: "18px 20px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 28 }}>{selectedField.icon}</span>
                  <div>
                    <div style={{ color: "#e8edf5", fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{selectedField.name} 전문 상담</div>
                    <div style={{ color: "#6b7fa3", fontSize: 12 }}>{selectedField.desc}</div>
                  </div>
                </div>
                <div style={{ color: "#4a7299", fontSize: 12, textAlign: "center", marginBottom: 10 }}>자주 묻는 질문</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {[`${selectedField.name} 관련 기본 절차와 필요한 서류를 알려주세요.`, `${selectedField.name} 문제로 피해를 입었는데 어디에 신고해야 하나요?`, `${selectedField.name} 관련 내용증명이나 고소장을 작성하고 싶어요.`].map((q, i) => (
                    <button key={i} onClick={() => sendMessage(q)}
                      style={{ background: "#111827", border: "1px solid #1e3a5f", borderRadius: 12, padding: "12px 16px", color: "#c5d0e0", fontSize: 13, cursor: "pointer", textAlign: "left", fontFamily: "'Noto Sans KR', sans-serif", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#1a2332"; e.currentTarget.style.borderColor = "#2563eb"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#111827"; e.currentTarget.style.borderColor = "#1e3a5f"; }}>
                      ❓ {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            {isStreaming && streamingText && <StreamingMessage text={streamingText} />}
            {isStreaming && !streamingText && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #1a4fa0, #4a9eff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>⚖️</div>
                <TypingIndicator />
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {step === "chat" && (
        <div style={{ background: "#0d1520", borderTop: "1px solid #1a2d4a", padding: "12px 16px", position: "sticky", bottom: 0 }}>
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="법률 문제를 자세히 설명해 주세요..." rows={1} disabled={isStreaming}
              style={{ flex: 1, background: "#111827", border: "1px solid #1e3a5f", borderRadius: 14, padding: "12px 16px", color: "#e8edf5", fontSize: 14, fontFamily: "'Noto Sans KR', sans-serif", lineHeight: 1.6, maxHeight: 120, overflowY: "auto", opacity: isStreaming ? 0.6 : 1 }}
              onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }} />
            {isStreaming ? (
              <button onClick={handleStop}
                style={{ width: 44, height: 44, borderRadius: 12, border: "none", background: "#7f1d1d", color: "#fca5a5", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, animation: "pulse 1.5s ease-in-out infinite" }}>
                ■
              </button>
            ) : (
              <button onClick={() => sendMessage()} disabled={!input.trim()}
                style={{ width: 44, height: 44, borderRadius: 12, border: "none", background: input.trim() ? "linear-gradient(135deg, #1a4fa0, #2563eb)" : "#1a2332", color: input.trim() ? "#fff" : "#2d4a6b", fontSize: 18, cursor: input.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}>↑</button>
            )}
          </div>
          <p style={{ color: "#2d4a6b", fontSize: 11, textAlign: "center", marginTop: 8 }}>
            {isStreaming ? "응답 생성 중... ■ 버튼으로 중단 가능"
              : isTrialActive() ? `🎁 체험 D-${trialDaysLeft()} · Enter로 전송 · Shift+Enter 줄바꿈`
              : isPaid() ? "Enter로 전송 · Shift+Enter 줄바꿈 · 법률구조공단 132"
              : `무료 오늘 ${3 - todayChatCount()}회 남음 · Enter로 전송 · 법률구조공단 132`}
          </p>
        </div>
      )}
    </div>
  );
}
