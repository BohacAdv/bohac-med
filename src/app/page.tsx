"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { whatsappHref } from "@/lib/verticais";

/* ── CNPJ mask ── */
function maskCNPJ(v: string) {
  return v.replace(/\D/g,"").slice(0,14)
    .replace(/^(\d{2})(\d)/,"$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/,"$1.$2.$3")
    .replace(/\.(\d{3})(\d)/,".$1/$2")
    .replace(/(\d{4})(\d)/,"$1-$2");
}
function validCNPJ(c: string) {
  const n = c.replace(/\D/g,"");
  if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false;
  const calc = (s: string, w: number[]) =>
    w.reduce((a,b,i)=>a+parseInt(s[i])*b,0);
  const w1=[5,4,3,2,9,8,7,6,5,4,3,2];
  const w2=[6,5,4,3,2,9,8,7,6,5,4,3,2];
  const d1=calc(n,w1)%11; const r1=d1<2?0:11-d1;
  const d2=calc(n,w2)%11; const r2=d2<2?0:11-d2;
  return r1===parseInt(n[12])&&r2===parseInt(n[13]);
}

type CheckerModo = "cnpj" | "cartao" | "notas";

function Spinner() {
  return (
    <svg style={{ animation: "spin 1s linear infinite", width: 14, height: 14 }} viewBox="0 0 24 24" fill="none">
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

export default function HomePage() {
  const router = useRouter();

  // Checker: CNPJ
  const [cnpj, setCnpj] = useState("");
  const [err,  setErr]  = useState(false);

  // Checker: modo
  const [checkerModo, setCheckerModo] = useState<CheckerModo>("cnpj");

  // Checker: Cartão CNPJ
  const [arquivoCartao, setArquivoCartao]       = useState<File | null>(null);
  const [erroCartao, setErroCartao]             = useState("");
  const [carregandoCartao, setCarregandoCartao] = useState(false);

  // Checker: Notas Fiscais
  const [arquivosNF, setArquivosNF] = useState<File[]>([]);

  async function handleCartao(e: React.FormEvent) {
    e.preventDefault();
    setErroCartao("");
    if (!arquivoCartao) { setErroCartao("Selecione o arquivo do Cartão CNPJ."); return; }
    setCarregandoCartao(true);
    try {
      const form = new FormData();
      form.append("cartao", arquivoCartao);
      const res  = await fetch("/api/analisar-cartao-cnpj", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro ?? "Erro na leitura do cartão.");
      router.push(`/analise?cnpj=${data.cnpjExtraido}`);
    } catch (err: unknown) {
      setErroCartao(err instanceof Error ? err.message : "Erro inesperado.");
      setCarregandoCartao(false);
    }
  }

  /* Form submit */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validCNPJ(cnpj)) { setErr(true); return; }
    setErr(false);
    router.push(`/analise?cnpj=${cnpj.replace(/\D/g,"")}`);
  }

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero hero--eq section-pad" id="topo">
        <video
          className="hero__video"
          src="/hero-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="wrap">
          <div className="hero__grid">
            {/* Coluna esquerda */}
            <div>
              <div className="hero__tagrow reveal">
                <span className="kicker on-navy">Equiparação Hospitalar</span>
              </div>
              <h1 className="reveal" data-d="1">
                Clínicas no Lucro Presumido podem estar recolhendo{" "}
                <em>IRPJ e CSLL</em>{" "}
                sobre uma base maior do que a devida
              </h1>
              <p className="hero__sub reveal" data-d="2">
                A equiparação hospitalar reduz a base de cálculo (percentual de presunção) do IRPJ de 32% para 8% e da CSLL de 32% para 12% sobre a receita bruta. A alíquota efetiva combinada de IRPJ + CSLL pode cair da faixa de 7,68%–10,88% para 2,28%–3,08%, conforme a incidência do adicional de 10%. Previsto no art. 15, §1º, III, "a" da Lei 9.249/1995, na redação da Lei 11.727/2008, que exige sociedade empresária e atendimento às normas da ANVISA.
              </p>
              <div className="hero__highlight reveal" data-d="2">
                <span className="hero__pill">
                  <b>IRPJ</b> <s>32%</s> → <b>8%</b>
                </span>
                <span className="hero__pill">
                  <b>CSLL</b> <s>32%</s> → <b>12%</b>
                </span>
                <p className="hero__pill-note">bases de cálculo (presunção) — alíquota efetiva IRPJ + CSLL: <s>7,68%–10,88%</s> → <b>2,28%–3,08%</b> da receita bruta</p>
              </div>
              <div className="hero__actions reveal" data-d="3">
                <a
                  href="/analise"
                  className="btn btn--gold btn-lg"
                >
                  Verificar elegibilidade da minha clínica
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
                <a href="#tese" className="btn btn--ghost-light btn-lg">
                  Entender a tese
                </a>
              </div>

              {/* Legal strip */}
              <div className="legal-strip reveal" data-d="4">
                <span className="li">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3h8l3 5-7 13L4 8z"/><path d="M8 3l4 5 4-5M4 8h16"/>
                  </svg>
                  <span><b>Lei 9.249/1995</b> art. 15, §1º, III, &quot;a&quot;</span>
                </span>
                <span className="li">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18"/><path d="M5 21V8h14v13"/><path d="M9 21v-5h6v5"/><path d="M5 8l7-5 7 5"/>
                  </svg>
                  <span><b>STJ</b> — REsp 1.116.399/BA (Tema 217)</span>
                </span>
                <span className="li">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2h9l3 3v17l-2-1-2 1-2-1-2 1-2-1-2 1V2z"/><path d="M9 7h6M9 11h6M9 15h4"/>
                  </svg>
                  <span><b>SC COSIT 100/2013</b> — Receita Federal</span>
                </span>
                <span className="li">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>
                  </svg>
                  <span><b>CNAEs</b> de saúde — Lucro Presumido</span>
                </span>
              </div>
            </div>

            {/* Coluna direita — Checker */}
            <div className="reveal" data-d="2">
              <div className="checker">
                {/* ── Cabeçalho ── */}
                <div className="checker__top">
                  <div className="checker__badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z"/>
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  </div>
                  <h3>Verificação preliminar de enquadramento</h3>
                </div>
                <p className="checker__sub">Escolha a forma mais prática. Grátis e sem compromisso.</p>

                {/* ── Tab switcher ── */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: "1.25rem" }}>
                  {([
                    {
                      id: "cnpj" as CheckerModo,
                      label: "CNPJ",
                      hint: "Digite e consulte",
                      icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="6" width="20" height="12" rx="0"/>
                          <path d="M6 12h1M9.5 12h1M13 12h1M16.5 12h1.5"/>
                          <path d="M6 15.5h12"/>
                        </svg>
                      ),
                    },
                    {
                      id: "cartao" as CheckerModo,
                      label: "Cartão CNPJ",
                      hint: "Envie o documento",
                      icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 15v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4"/>
                          <path d="M12 3v12"/>
                          <path d="m7.5 7.5 4.5-4.5 4.5 4.5"/>
                        </svg>
                      ),
                    },
                    {
                      id: "notas" as CheckerModo,
                      label: "Nota Fiscal",
                      hint: "Análise por serviço",
                      icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 3h14v18l-2.3-1.6L14.4 21l-2.4-1.6L9.6 21l-2.3-1.6L5 21z"/>
                          <path d="M9 8h6M9 12h6M9 16h3"/>
                        </svg>
                      ),
                    },
                  ]).map((opt) => {
                    const active = checkerModo === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => { setCheckerModo(opt.id); setErr(false); setErroCartao(""); }}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 5,
                          padding: "12px 6px 10px",
                          background: active ? "rgba(174,129,103,0.1)" : "rgba(12,36,56,0.03)",
                          border: `1px solid ${active ? "rgba(174,129,103,0.45)" : "rgba(12,36,56,0.1)"}`,
                          borderTop: `2.5px solid ${active ? "#ae8167" : "transparent"}`,
                          cursor: "pointer",
                          transition: "background 0.2s, border-color 0.2s, color 0.2s",
                          fontFamily: "var(--sans, 'Jost', sans-serif)",
                        }}
                      >
                        <span style={{
                          color: active ? "#ae8167" : "rgba(12,36,56,0.3)",
                          transition: "color 0.2s",
                          display: "flex",
                        }}>
                          {opt.icon}
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: active ? 700 : 400, letterSpacing: "0.08em",
                          color: active ? "#ae8167" : "rgba(12,36,56,0.45)",
                          transition: "color 0.2s, font-weight 0.2s", textTransform: "uppercase",
                          lineHeight: 1.2,
                        }}>
                          {opt.label}
                        </span>
                        <span style={{
                          fontSize: 9, letterSpacing: "0.04em",
                          color: active ? "rgba(174,129,103,0.75)" : "rgba(12,36,56,0.25)",
                          transition: "color 0.2s",
                          lineHeight: 1.2,
                        }}>
                          {opt.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* ── Conteúdo dos tabs com transição suave ── */}
                <div style={{ position: "relative", minHeight: 220 }}>
                  {/* Tab: Digitar CNPJ */}
                  <div style={{
                    position: "absolute", inset: 0,
                    opacity: checkerModo === "cnpj" ? 1 : 0,
                    pointerEvents: checkerModo === "cnpj" ? "auto" : "none",
                    transform: checkerModo === "cnpj" ? "translateY(0)" : "translateY(6px)",
                    transition: "opacity 0.22s ease, transform 0.22s ease",
                  }}>
                    <form className="checker__form" onSubmit={handleSubmit} style={{ paddingTop: 0 }}>
                      <div className={`checker__field${err ? " invalid" : ""}`}>
                        <label htmlFor="cnpj-input">CNPJ da sua empresa</label>
                        <div className="checker__input-row">
                          <input
                            id="cnpj-input"
                            className="checker__input"
                            type="text"
                            inputMode="numeric"
                            placeholder="00.000.000/0000-00"
                            value={cnpj}
                            onChange={e => { setCnpj(maskCNPJ(e.target.value)); setErr(false); }}
                            maxLength={18}
                            autoComplete="off"
                          />
                        </div>
                        <p className="checker__err">CNPJ inválido. Verifique e tente novamente.</p>
                      </div>
                      <button type="submit" className="btn btn--gold btn-lg checker__submit">
                        Verificar o enquadramento
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                      </button>
                    </form>
                  </div>

                  {/* Tab: Cartão CNPJ */}
                  <div style={{
                    position: "absolute", inset: 0,
                    opacity: checkerModo === "cartao" ? 1 : 0,
                    pointerEvents: checkerModo === "cartao" ? "auto" : "none",
                    transform: checkerModo === "cartao" ? "translateY(0)" : "translateY(6px)",
                    transition: "opacity 0.22s ease, transform 0.22s ease",
                  }}>
                    <form onSubmit={handleCartao} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <label
                        htmlFor="cartao-input-hero"
                        style={{
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                          gap: 8, padding: "1.5rem 1rem", border: "1.5px dashed rgba(174,129,103,0.4)",
                          cursor: "pointer", background: "rgba(174,129,103,0.05)", textAlign: "center",
                        }}
                      >
                        {arquivoCartao ? (
                          <>
                            <span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--gold)" }} aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/></svg></span>
                            <span style={{ fontSize: 12, color: "var(--ink)", fontWeight: 500 }}>{arquivoCartao.name}</span>
                            <span style={{ fontSize: 11, color: "var(--muted)" }}>Clique para trocar</span>
                          </>
                        ) : (
                          <>
                            <span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--gold)" }} aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="0"/><circle cx="8" cy="11" r="2"/><path d="M4.5 16.5c.7-1.4 2-2 3.5-2s2.8.6 3.5 2M14 10h5M14 14h3"/></svg></span>
                            <span style={{ fontSize: 12, color: "var(--mid, #4b5563)", fontWeight: 400 }}>
                              Clique para selecionar o Cartão CNPJ
                            </span>
                            <span style={{ fontSize: 11, color: "var(--muted)" }}>PDF, JPG ou PNG — máx. 8MB</span>
                          </>
                        )}
                        <input
                          id="cartao-input-hero"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={e => { setArquivoCartao(e.target.files?.[0] ?? null); setErroCartao(""); }}
                          disabled={carregandoCartao}
                          style={{ display: "none" }}
                        />
                      </label>
                      <p style={{ fontSize: 11, color: "var(--muted)", fontWeight: 300, margin: 0 }}>
                        Nossa IA extrai o CNPJ e os CNAEs automaticamente do documento.
                      </p>
                      {erroCartao && <p style={{ fontSize: 12, color: "#dc2626", margin: 0 }}>{erroCartao}</p>}
                      <button
                        type="submit"
                        disabled={carregandoCartao || !arquivoCartao}
                        className="btn btn--gold btn-lg checker__submit"
                      >
                        {carregandoCartao
                          ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Spinner /> Lendo cartão com IA…</span>
                          : <>Analisar Cartão CNPJ <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></>
                        }
                      </button>
                    </form>
                  </div>

                  {/* Tab: Notas Fiscais */}
                  <div style={{
                    position: "absolute", inset: 0,
                    opacity: checkerModo === "notas" ? 1 : 0,
                    pointerEvents: checkerModo === "notas" ? "auto" : "none",
                    transform: checkerModo === "notas" ? "translateY(0)" : "translateY(6px)",
                    transition: "opacity 0.22s ease, transform 0.22s ease",
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <label
                        htmlFor="nf-input-hero"
                        style={{
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                          gap: 8, padding: "1.5rem 1rem",
                          border: "1.5px dashed rgba(174,129,103,0.4)",
                          cursor: "pointer", background: "rgba(174,129,103,0.05)", textAlign: "center",
                        }}
                      >
                        {arquivosNF.length > 0 ? (
                          <>
                            <span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--gold)" }} aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/></svg></span>
                            <span style={{ fontSize: 12, color: "var(--ink)", fontWeight: 500 }}>
                              {arquivosNF.length} arquivo{arquivosNF.length > 1 ? "s" : ""} selecionado{arquivosNF.length > 1 ? "s" : ""}
                            </span>
                            <span style={{ fontSize: 11, color: "var(--muted)" }}>Clique para trocar</span>
                          </>
                        ) : (
                          <>
                            <span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--gold)" }} aria-hidden="true"><path d="M5 3h14v18l-2.3-1.6L14.4 21l-2.4-1.6L9.6 21l-2.3-1.6L5 21z"/><path d="M9 8h6M9 12h6M9 16h3"/></svg></span>
                            <span style={{ fontSize: 12, color: "var(--mid, #4b5563)", fontWeight: 400 }}>
                              Clique para selecionar suas notas fiscais
                            </span>
                            <span style={{ fontSize: 11, color: "var(--muted)" }}>PDF, JPG, PNG ou XML — até 5 arquivos</span>
                          </>
                        )}
                        <input
                          id="nf-input-hero"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.xml"
                          multiple
                          onChange={e => setArquivosNF(Array.from(e.target.files ?? []).slice(0, 5))}
                          style={{ display: "none" }}
                        />
                      </label>
                      <p style={{ fontSize: 11, color: "var(--muted)", fontWeight: 300, margin: 0 }}>
                        A leitura considera a descrição dos serviços, sem depender dos CNAEs cadastrados.{" "}
                        <b style={{ color: "var(--gold-600)" }}>Antes de enviar, oculte ou remova os dados do tomador</b>{" "}
                        (nome e CPF do paciente): são dados pessoais sensíveis, nos termos do art. 11 da LGPD, e não são necessários à análise.
                      </p>
                      <button
                        type="button"
                        onClick={() => router.push("/analise?tab=notas-fiscais")}
                        className="btn btn--gold btn-lg checker__submit"
                      >
                        {arquivosNF.length > 0 ? "Analisar notas fiscais" : "Ir para análise completa"}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Trust strip ── */}
                <div className="checker__trust" style={{ marginTop: "1.25rem" }}>
                  <span className="t">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z"/></svg>
                    Dados protegidos
                  </span>
                  <span className="t">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                    Retorno imediato
                  </span>
                  <span className="t">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>
                    Sem compromisso
                  </span>
                </div>
                <p className="checker__alt">
                  Prefere falar com um especialista?{" "}
                  <a
                    href={whatsappHref("Olá! Gostaria de falar com o escritório sobre a equiparação hospitalar.")}
                    target="_blank"
                    rel="noopener"
                  >
                    Clique aqui
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ESTATÍSTICAS ── */}
      <section className="stats section-pad">
        <div className="wrap">
          <div className="stats-grid reveal">
            <div className="stat-cell">
              <div className="big">
                <span className="from">32%</span>
                <span className="to">8%</span>
              </div>
              <p className="lab">Percentual de presunção — IRPJ</p>
              <p className="desc">Queda de 75% no percentual de presunção do IRPJ (Lucro Presumido), aplicável a partir do período de apuração seguinte, uma vez confirmado o enquadramento</p>
            </div>
            <div className="stat-cell">
              <div className="big">
                <span className="from">10,88%</span>
                <span className="to">3,08%</span>
              </div>
              <p className="lab">Alíquota efetiva IRPJ + CSLL</p>
              <p className="desc">A alíquota efetiva é o que de fato se recolhe sobre a receita bruta. Sem o adicional de 10%, vai de 7,68% para 2,28%; com o adicional integral, de 10,88% para 3,08%. Resultado da redução das bases: IRPJ de 32%→8% e CSLL de 32%→12%</p>
            </div>
            <div className="stat-cell">
              <div className="big">
                <span>5 anos</span>
              </div>
              <p className="lab">Prazo para pleitear a restituição</p>
              <p className="desc">O direito de pleitear a restituição de tributo pago a maior extingue-se em 5 anos contados do recolhimento (art. 168 do CTN). Confirmado o enquadramento, o período anterior pode ser objeto de restituição ou compensação</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONCEITOS TRIBUTÁRIOS ── */}
      <section className="conceitos">
        <div className="wrap">
          <div className="conceitos__head reveal">
            <span className="kicker">Entenda os números</span>
            <h2>Alíquota, base de cálculo e alíquota efetiva</h2>
          </div>
          <div className="conceitos__grid">
            <div className="conceito-card reveal" data-d="1">
              <div className="conceito-card__label">Alíquota nominal</div>
              <div className="conceito-card__body">
                O percentual previsto em lei sobre o qual o imposto incide. O IRPJ tem alíquota de <b>15%</b> (+ adicional de 10% quando o lucro trimestral supera R$ 60 mil); a CSLL, <b>9%</b>. Sozinha, a alíquota nominal não diz quanto você paga de verdade.
              </div>
            </div>
            <div className="conceito-card reveal" data-d="2">
              <div className="conceito-card__label">Base de cálculo (presunção)</div>
              <div className="conceito-card__body">
                No Lucro Presumido, o lucro tributável não é apurado contabilmente — ele é <em>presumido</em> como um percentual da receita bruta. Para serviços médicos sem equiparação: <b>32%</b>. Com equiparação hospitalar: <b>8%</b> (IRPJ) e <b>12%</b> (CSLL).
              </div>
            </div>
            <div className="conceito-card reveal" data-d="3">
              <div className="conceito-card__label">Alíquota efetiva</div>
              <div className="conceito-card__body">
                O percentual real pago sobre a receita bruta: <em>base de cálculo × alíquota nominal</em>. Sem equiparação, IRPJ + CSLL chegam a <b>~10,88%</b> da receita. Com equiparação: <b>~3,08%</b>. Essa diferença — não a alíquota nominal — é o que importa.
              </div>
            </div>
          </div>
          {/* Barra comparativa — a resposta à pergunta "dá para gerar imagem
              para explicar os números": não. Isto é 100% CSS, o texto continua
              indexável e legível por leitor de tela, pesa 0 KB, e um dígito
              nunca é alucinado. A largura faz o argumento em 200ms. */}
          <div className="barra reveal">
            <div className="barra__row">
              <span className="barra__lab">Sem equiparação</span>
              <div className="barra__track">
                <span className="barra__fill barra__fill--sem" style={{ ["--w" as string]: "100%" }}>
                  <b>10,88%</b>
                </span>
              </div>
            </div>
            <div className="barra__row">
              <span className="barra__lab">Com equiparação</span>
              <div className="barra__track">
                <span className="barra__fill barra__fill--com" style={{ ["--w" as string]: "28.3%" }}>
                  <b>3,08%</b>
                </span>
              </div>
            </div>
            <p className="barra__nota">
              Alíquota efetiva de IRPJ + CSLL sobre a mesma receita bruta, no cenário de
              incidência integral do adicional de 10%. Sem o adicional, a comparação é de
              7,68% para 2,28%. As larguras são proporcionais.
            </p>
          </div>

          <div className="conceitos__simples reveal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><circle cx="12" cy="16" r=".5" fill="currentColor"/></svg>
            <p><b>Comparação com o Simples Nacional — como fazer corretamente:</b> a alíquota do Anexo V começa em 15,5%, mas é uma cesta: embute IRPJ, CSLL, PIS, COFINS, contribuição previdenciária patronal e ISS. Confrontá-la diretamente com os 3,08% de IRPJ + CSLL compara grandezas diferentes. No Lucro Presumido é preciso somar PIS e COFINS (0,65% + 3%), o ISS do município (2% a 5%) e a contribuição patronal de 20% sobre a folha. Feita a soma, há faixas de faturamento e composições de custo em que o Lucro Presumido com equiparação resulta em carga total inferior — mas a conclusão depende do caso concreto.</p>
          </div>
        </div>
      </section>

      {/* ── VÍDEO EXPLICATIVO ── */}
      <section className="explainer section-pad-tight">
        <div className="wrap">
          <div className="explainer__inner reveal">
            <span className="kicker center">Em 40 segundos</span>
            <h2>A tese, resumida</h2>
            <div className="explainer__frame">
              <video
                controls
                preload="none"
                playsInline
                poster="/video-poster.jpg"
                src="/bohac-med-equiparacao.mp4"
              >
                Seu navegador não reproduz vídeo em HTML5.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* ── A TESE ── */}
      <section className="tese section-pad" id="tese">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">Fundamento jurídico</span>
            <h2>Por que sua clínica tem esse direito</h2>
            <p className="lede">
              A equiparação hospitalar não é planejamento tributário agressivo: é um regime expresso no art. 15, §1º, III, "a" da Lei 9.249/1995, na redação dada pela Lei 11.727/2008, e reconhecido pelo STJ no REsp 1.116.399/BA (Tema 217 dos recursos repetitivos). Depende de requisitos cumulativos — entre eles a organização sob a forma de sociedade empresária e o atendimento às normas da ANVISA — e não alcança as simples consultas médicas.
            </p>
          </div>
          <div className="tese-grid">
            <div className="tese-card reveal" data-d="1">
              <div className="ic">
                {/* Livro aberto com check — Lei confirmada */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
                  <path d="M9 10l2 2 4-4"/>
                </svg>
              </div>
              <h3>Direito garantido em lei</h3>
              <p>
                Previsto no <b>art. 15, §1º, III, &quot;a&quot;</b> (IRPJ) e no <b>art. 20</b> (CSLL) da <b>Lei 9.249/1995</b>, com a redação da <b>Lei 11.727/2008</b>. Não é brecha — é norma. O alcance foi fixado pelo STJ no <b>REsp 1.116.399/BA</b>, julgado sob o rito dos repetitivos (Tema 217), e disciplinado pela Receita Federal na IN RFB 1.700/2017.
              </p>
            </div>
            <div className="tese-card reveal" data-d="2">
              <div className="ic">
                {/* Cifrão em círculo — economia tributária imediata */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v1.5M12 16.5V18"/>
                  <path d="M8.5 9.5a3.5 1.8 0 017 0c0 1-1 1.8-3.5 2.5-2.5.7-3.5 1.5-3.5 2.5a3.5 1.8 0 007 0"/>
                </svg>
              </div>
              <h3>Economia real e imediata</h3>
              <p>
                As bases de cálculo caem: IRPJ de <b>32% para 8%</b> e CSLL de <b>32% para 12%</b> da receita bruta. A <b>alíquota efetiva</b> combinada de IRPJ + CSLL pode passar da faixa de <b>7,68%–10,88%</b> para <b>2,28%–3,08%</b>, conforme incida ou não o adicional de 10%. Confirmado o enquadramento, o efeito se dá a partir do período de apuração seguinte.
              </p>

            </div>
            <div className="tese-card reveal" data-d="3">
              <div className="ic">
                {/* Seta retroativa com relógio — restituição quinquenal */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                  <path d="M12 7v5l4 2"/>
                </svg>
              </div>
              <h3>Recuperação dos últimos 5 anos</h3>
              <p>
                Além da redução prospectiva, é possível <b>recuperar tributos recolhidos a maior nos últimos 5 anos</b> via pedido de restituição ou compensação administrativo (art. 168 do CTN), ou mediante ação de repetição de indébito na esfera judicial.
              </p>
            </div>
          </div>

          {/* ── Link para análise aprofundada ── */}
          <div className="reveal" data-d="4" style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <a
              href="/tese"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                fontWeight: 600,
                color: "var(--gold, #ae8167)",
                border: "1px solid rgba(174,129,103,0.4)",
                padding: "12px 24px",
                letterSpacing: "0.04em",
                textDecoration: "none",
                transition: "border-color 0.2s, background 0.2s",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
              </svg>
              Aprofundar o fundamento jurídico — critérios, cálculo, via administrativa e judicial
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </a>
          </div>

        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="how section-pad" id="como-funciona">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">Processo</span>
            <h2>Do diagnóstico ao enquadramento em 4 etapas</h2>
            <p className="lede">
              Assessoramos todo o processo jurídico-contábil — da verificação dos CNAEs à sustentação documental perante a Receita Federal.
            </p>
          </div>
          <div className="steps">
            <div className="step reveal" data-d="1">
              <div className="step__n">01</div>
              <div className="step__bar" />
              <h3>Verificação de elegibilidade tributária</h3>
              <p>Analisamos o CNAE principal e secundários frente aos critérios da SC COSIT n° 100/2013 para confirmar o enquadramento como serviços hospitalares no Lucro Presumido.</p>
            </div>
            <div className="step reveal" data-d="2">
              <div className="step__n">02</div>
              <div className="step__bar" />
              <h3>Levantamento do indébito tributário</h3>
              <p>Apuramos os recolhimentos de IRPJ e CSLL dos últimos 5 anos (prazo do art. 168 do CTN) e calculamos o montante passível de restituição ou compensação.</p>
            </div>
            <div className="step reveal" data-d="3">
              <div className="step__n">03</div>
              <div className="step__bar" />
              <h3>Sustentação técnico-jurídica</h3>
              <p>Elaboramos a documentação de suporte ao enquadramento — pareceres, memórias de cálculo e, quando aplicável, pedido de restituição (PER/DCOMP) junto à Receita Federal.</p>
            </div>
            <div className="step reveal" data-d="4">
              <div className="step__n">04</div>
              <div className="step__bar" />
              <h3>Aplicação e monitoramento contínuo</h3>
              <p>O percentual de presunção reduzido passa a ser aplicado já no próximo período de apuração. Monitoramos a regularidade do enquadramento para prevenir autuações.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── DECLARAÇÃO ── */}
      <section className="declaracao section-pad-tight">
        <div className="wrap">
          <div className="declaracao__inner reveal">
            <span className="declaracao__rule" aria-hidden="true" />
            <p className="declaracao__text">
              A equiparação hospitalar é direito expresso em lei federal.{" "}
              Não aplicá-la é recolher tributos acima do legalmente devido.
            </p>
            <div className="declaracao__label">Bohac Med</div>
          </div>
        </div>
      </section>

      {/* ── QUEM SE BENEFICIA ── */}
      <section className="benef section-pad" id="beneficiarios">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker on-navy">Elegibilidade</span>
            <h2>Quem pode se enquadrar na equiparação</h2>
            <p className="lede">
              O CNAE é apenas o primeiro dos requisitos. A lei exige também organização sob a forma de sociedade empresária e atendimento às normas da ANVISA — e as simples consultas médicas ficam de fora (STJ, Tema 217). As atividades abaixo são as que mais frequentemente comportam a discussão:
            </p>
          </div>
          <div className="benef-grid">
            {/* Clínicas médicas */}
            <div className="benef-item reveal" data-d="1">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3v6a4 4 0 008 0V3"/><path d="M6 3h0M14 3h0"/>
                  <path d="M10 17v2a3 3 0 006 0 3 3 0 013-3"/>
                  <circle cx="19" cy="11" r="2"/>
                </svg>
              </span>
              <span>Clínicas médicas</span>
            </div>
            {/* Laboratórios */}
            <div className="benef-item reveal" data-d="2">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 3h6"/><path d="M10 3v5l-5 9a3 3 0 003 4h8a3 3 0 003-4l-5-9V3"/>
                  <path d="M7 15h10"/>
                </svg>
              </span>
              <span>Laboratórios</span>
            </div>
            {/* Diagnóstico por imagem */}
            <div className="benef-item reveal" data-d="3">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2"/>
                  <circle cx="12" cy="12" r="3.5"/>
                  <path d="M7 5V3h10v2"/>
                </svg>
              </span>
              <span>Diagnóstico por imagem</span>
            </div>
            {/* Fisioterapia */}
            <div className="benef-item reveal" data-d="4">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h4l2 5 4-12 2 7h6"/>
                </svg>
              </span>
              <span>Fisioterapia</span>
            </div>
            {/* Cirurgia */}
            <div className="benef-item reveal" data-d="1">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 4l6 6"/>
                  <path d="M4 20l8.5-8.5 1.5 1.5L5.5 21.5z"/>
                  <path d="M14.5 6.5l3 3"/>
                  <path d="M17 3l4 4"/>
                </svg>
              </span>
              <span>Cirurgia ambulatorial</span>
            </div>
            {/* Hemodiálise */}
            <div className="benef-item reveal" data-d="2">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3c4 5 6 8 6 11a6 6 0 01-12 0c0-3 2-6 6-11z"/>
                </svg>
              </span>
              <span>Hemodiálise</span>
            </div>
            {/* Pronto atendimento */}
            <div className="benef-item reveal" data-d="3">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 0118 0"/>
                  <path d="M3 12l3 3 3-6 3 9 3-12 3 9 3-3"/>
                </svg>
              </span>
              <span>Pronto atendimento</span>
            </div>
            {/* Day clinics */}
            <div className="benef-item reveal" data-d="4">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 21V8l8-5 8 5v13"/><path d="M4 21h16"/>
                  <path d="M12 10v6M9 13h6"/>
                </svg>
              </span>
              <span>Day clinics</span>
            </div>
          </div>
          <p className="benef__note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><circle cx="12" cy="16" r=".5" fill="currentColor"/>
            </svg>
            A verificação por CNAE é preliminar e não conclui pelo enquadramento: este depende ainda da forma societária e da regularidade sanitária, verificáveis somente em análise documental.
          </p>
          <a
            href="/analise"
            className="benef__cta reveal"
          >
            Solicitar análise de elegibilidade
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>
      </section>

      {/* ── OMNIJURÍDICO ── */}
      <section className="omni section-pad" id="areas">
        <div className="wrap">
          <div className="omni__inner">
            <span className="kicker reveal">Bohac Sociedade de Advogados</span>
            <h2 className="reveal" data-d="1">Uma clínica raramente tem só um problema jurídico</h2>
            <p className="omni__lead reveal" data-d="2">
              A equiparação hospitalar é uma tese tributária. A clínica que a discute também
              contrata equipe, guarda prontuários, recebe fiscalização sanitária, credencia-se
              a operadoras e responde perante o Conselho — frentes que quase sempre chegam a
              escritórios diferentes, sem que ninguém enxergue o conjunto. Aqui elas são
              tratadas pela mesma banca: do alvará da vigilância ao contrato social, do
              prontuário à defesa no CRM.
            </p>
            <p className="omni__frentes reveal" data-d="3">
              Regulação sanitária e licenciamento do estabelecimento · Processos éticos no CRM
              e responsabilidade civil · Convênios, operadoras e glosas · LGPD, prontuário e
              publicidade médica · Societário, sucessório e trabalhista da clínica
            </p>
            <div className="omni__actions reveal" data-d="3">
              {/* Ghost, não gold: dourado é a cor da conversão. Gastá-lo num
                  link que tira o visitante da landing dilui a ação única. */}
              <a href="/areas" className="btn btn--ghost btn-lg">
                Ver as frentes de atuação na clínica
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="final section-pad">
        <div className="wrap">
          <div className="final__inner">
            <span className="kicker on-navy center reveal">Prazo do art. 168 do CTN</span>
            <h2 className="reveal" data-d="1">
              Tributos recolhidos a maior só são recuperáveis dentro do prazo legal
            </h2>
            <p className="reveal" data-d="2">
              O direito de pleitear a restituição ou a compensação de valores pagos indevidamente extingue-se em 5 anos contados do recolhimento (art. 168 do CTN). A análise prévia de enquadramento não é cobrada e não gera obrigação.
            </p>
            <div className="final__actions reveal" data-d="3">
              <a
                href="/analise"
                className="btn btn--gold btn-lg"
              >
                Solicitar a análise de enquadramento
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
              <a
                href={whatsappHref("Olá! Gostaria de falar com o escritório sobre a equiparação hospitalar.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--ghost-light btn-lg"
              >
                Falar com o escritório
              </a>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
