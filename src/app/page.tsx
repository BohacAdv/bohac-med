"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
  const headerRef = useRef<HTMLElement>(null);
  const waRef     = useRef<HTMLAnchorElement>(null);

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
      router.push(`/resultado?cnpj=${data.cnpjExtraido}`);
    } catch (err: unknown) {
      setErroCartao(err instanceof Error ? err.message : "Erro inesperado.");
      setCarregandoCartao(false);
    }
  }

  /* Header scroll + WA float + reveal */
  useEffect(() => {
    const hdr = headerRef.current;
    const wa  = waRef.current;
    const body = document.body;

    if (!window.matchMedia("(prefers-reduced-motion:reduce)").matches) {
      body.classList.add("motion-ok");
    }
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => e.target.classList.toggle("in", e.isIntersecting)),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));

    function onScroll() {
      const y = window.scrollY;
      hdr?.classList.toggle("scrolled", y > 60);
      wa?.classList.toggle("show", y > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); obs.disconnect(); };
  }, []);

  /* Form submit */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validCNPJ(cnpj)) { setErr(true); return; }
    setErr(false);
    router.push(`/resultado?cnpj=${cnpj.replace(/\D/g,"")}`);
  }

  return (
    <>
      {/* ── HEADER ── */}
      <header className="site-header" ref={headerRef}>

        {/* ── Top Bar ── */}
        <div className="topbar">
          <div className="wrap topbar__wrap">
            {/* Link para o site principal */}
            <a
              className="topbar__main-link"
              href="https://www.bohac.com.br"
              target="_blank"
              rel="noopener"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              </svg>
              <span>bohac.com.br</span>
              {" "}— Site Principal
            </a>

            <div className="topbar__right">
              {/* Dropdown Outras Verticais */}
              <div className="topbar__dd">
                <button className="topbar__dd-trigger" type="button">
                  Outras Verticais
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
                <div className="topbar__dd-menu">
                  <a href="/" aria-current="page">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 21V8l8-5 8 5v13"/><path d="M12 10v6M9 13h6"/></svg>
                    Bohac Med
                    <span className="dd-tag">atual</span>
                  </a>
                  <a href="https://www.bohac.com.br/direito-medico" target="_blank" rel="noopener">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z"/></svg>
                    Direito Médico
                  </a>
                  <a href="https://www.bohac.com.br/empresarial" target="_blank" rel="noopener">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V8l7-4 7 4v13"/><path d="M9 21v-6h6v6"/></svg>
                    Direito Empresarial
                  </a>
                  <a href="https://www.bohac.com.br/trabalhista" target="_blank" rel="noopener">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                    Trabalhista
                  </a>
                  <a href="https://www.bohac.com.br/previdenciario" target="_blank" rel="noopener">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><path d="M5 7h14v12a2 2 0 01-2 2H7a2 2 0 01-2-2z"/><path d="M9 3h6v4H9z"/></svg>
                    Previdenciário
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="wrap">
          <nav className="nav">
            <a className="nav__logo" href="#topo">
              <img src="/logo-inverted.png" alt="Bohac Med" />
            </a>
            <div className="nav__links">
              <a href="#tese">A Tese</a>
              <a href="#como-funciona">Como Funciona</a>
              <a href="#beneficiarios">Quem se Beneficia</a>
              <a href="#areas">Outras Áreas</a>
            </div>
            <div className="nav__cta">
              <a
                href="https://wa.me/5518996205555?text=Olá,%20gostaria%20de%20verificar%20minha%20elegibilidade%20para%20equiparação%20hospitalar"
                target="_blank"
                rel="noopener"
                className="btn btn--gold"
              >
                Fale com especialista
              </a>
            </div>
          </nav>
        </div>
      </header>

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
                Sua clínica pode estar pagando{" "}
                <em>até 60% a mais</em>{" "}
                em tributos do que o devido
              </h1>
              <p className="hero__sub reveal" data-d="2">
                A equiparação hospitalar reduz a base de cálculo (percentual de presunção) do IRPJ de 32% para 8% e da CSLL de 32% para 12% sobre a receita bruta. Isso faz a alíquota efetiva combinada de IRPJ + CSLL cair de ~10,88% para ~3,08%. Direito previsto no art. 15, §1°, III, "a" da Lei 9.249/1995 e reconhecido na SC COSIT n° 100/2013.
              </p>
              <div className="hero__highlight reveal" data-d="2">
                <span className="hero__pill">
                  <b>IRPJ</b> <s>32%</s> → <b>8%</b>
                </span>
                <span className="hero__pill">
                  <b>CSLL</b> <s>32%</s> → <b>12%</b>
                </span>
                <p className="hero__pill-note">bases de cálculo (presunção) — alíquota efetiva IRPJ + CSLL: <s>~10,88%</s> → <b>~3,08%</b> da receita</p>
              </div>
              <div className="hero__actions reveal" data-d="3">
                <a
                  href="https://wa.me/5518996205555?text=Quero%20verificar%20minha%20elegibilidade"
                  target="_blank"
                  rel="noopener"
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
                  <span><b>Lei 9.249/1995</b> art. 15 · Decreto 9.580/2018 (RIR)</span>
                </span>
                <span className="li">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18"/><path d="M5 21V8h14v13"/><path d="M9 21v-5h6v5"/><path d="M5 8l7-5 7 5"/>
                  </svg>
                  <span><b>STJ</b> — jurisprudência pacificada</span>
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
                  <h3>Verificação de Elegibilidade</h3>
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
                          <rect x="3" y="5" width="18" height="14" rx="2"/>
                          <path d="M7 10h2M7 14h2M13 10h4M13 14h2"/>
                        </svg>
                      ),
                    },
                    {
                      id: "cartao" as CheckerModo,
                      label: "Cartão CNPJ",
                      hint: "Envie o documento",
                      icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="5" width="20" height="14" rx="2"/>
                          <circle cx="8" cy="12" r="2.5"/>
                          <path d="M13 10h5M13 14h3"/>
                        </svg>
                      ),
                    },
                    {
                      id: "notas" as CheckerModo,
                      label: "Nota Fiscal",
                      hint: "Análise por serviço",
                      icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                          <path d="M14 2v6h6M8 13h8M8 17h5"/>
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
                        Verificar agora — é grátis
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
                            <span style={{ fontSize: 22 }}>📄</span>
                            <span style={{ fontSize: 12, color: "var(--ink)", fontWeight: 500 }}>{arquivoCartao.name}</span>
                            <span style={{ fontSize: 11, color: "var(--muted)" }}>Clique para trocar</span>
                          </>
                        ) : (
                          <>
                            <span style={{ fontSize: 22 }}>🪪</span>
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
                            <span style={{ fontSize: 22 }}>📄</span>
                            <span style={{ fontSize: 12, color: "var(--ink)", fontWeight: 500 }}>
                              {arquivosNF.length} arquivo{arquivosNF.length > 1 ? "s" : ""} selecionado{arquivosNF.length > 1 ? "s" : ""}
                            </span>
                            <span style={{ fontSize: 11, color: "var(--muted)" }}>Clique para trocar</span>
                          </>
                        ) : (
                          <>
                            <span style={{ fontSize: 22 }}>🧾</span>
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
                        Nossa IA analisa a descrição dos serviços — sem depender dos CNAEs cadastrados.
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
                    100% seguro
                  </span>
                  <span className="t">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                    Resultado em segundos
                  </span>
                  <span className="t">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>
                    Sem custo
                  </span>
                </div>
                <p className="checker__alt">
                  Prefere falar com um especialista?{" "}
                  <a
                    href="https://wa.me/5518996205555?text=Quero%20verificar%20elegibilidade%20para%20equiparação%20hospitalar"
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
              <p className="desc">Queda de 75% no percentual de presunção do IRPJ (Lucro Presumido), com reflexo já no próximo período de apuração trimestral</p>
            </div>
            <div className="stat-cell">
              <div className="big">
                <span className="from">~10,88%</span>
                <span className="to">~3,08%</span>
              </div>
              <p className="lab">Alíquota efetiva IRPJ + CSLL</p>
              <p className="desc">A alíquota efetiva combinada (o que se paga de verdade sobre a receita bruta) cai de ~10,88% para ~3,08%, resultado da redução das bases: IRPJ de 32%→8% e CSLL de 32%→12%</p>
            </div>
            <div className="stat-cell">
              <div className="big">
                <span>+60%</span>
              </div>
              <p className="lab">Redução média na carga tributária</p>
              <p className="desc">Estimativa baseada em apurações comparativas IRPJ + CSLL. A recuperação de tributos pagos a maior é possível em até 5 anos retroativos (art. 168 do CTN)</p>
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
          <div className="conceitos__simples reveal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><circle cx="12" cy="16" r=".5" fill="currentColor"/></svg>
            <p><b>Comparação com o Simples Nacional:</b> para clínicas enquadradas no Anexo V (fator R desfavorável), a alíquota do Simples começa em 15,5% e pode ultrapassar 20% — valor superior à alíquota efetiva de IRPJ + CSLL com equiparação (3,08%). Em determinados cenários de faturamento, o Lucro Presumido com equiparação hospitalar é mais vantajoso que o próprio Simples Nacional.</p>
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
              A equiparação hospitalar não é planejamento tributário agressivo. É um benefício expresso no art. 15, §1°, III, "a" da Lei 9.249/1995, regulamentado pelo Decreto 9.580/2018 (RIR), com critérios definidos pela Receita Federal na Solução de Consulta COSIT n° 100/2013 e jurisprudência pacificada no STJ. Não aplicá-lo implica recolhimento de tributos acima do legalmente devido.
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
                Previsto no <b>art. 15, §1°, III, "a" da Lei 9.249/1995</b> e regulamentado pelos arts. 15 e 20 do Decreto 9.580/2018 (RIR — Regulamento do Imposto de Renda). Não é brecha — é norma. A Receita Federal definiu os critérios de enquadramento na <b>Solução de Consulta COSIT n° 100/2013</b>.
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
                As bases de cálculo caem: IRPJ de <b>32% para 8%</b> e CSLL de <b>32% para 12%</b> da receita bruta. Isso reduz a <b>alíquota efetiva</b> combinada de IRPJ + CSLL de ~10,88% para ~3,08% — impacto imediato já no <b>primeiro período de apuração trimestral</b>. Em muitos casos, a carga é inferior à do próprio Simples Nacional.
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
              <p>Apuramos os recolhimentos de IRPJ e CSLL dos últimos 5 anos (prazo prescricional do art. 168 do CTN) e calculamos o montante passível de restituição ou compensação.</p>
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
              O enquadramento depende da análise do CNAE principal frente aos critérios da SC COSIT n° 100/2013. Em geral, prestadores de serviços de saúde no Lucro Presumido com atividades análogas às hospitalares têm alta possibilidade de elegibilidade:
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
            O enquadramento é restrito a empresas no regime de Lucro Presumido com CNAEs de serviços de saúde compatíveis com os critérios da SC COSIT n° 100/2013. A análise de elegibilidade é gratuita e sem compromisso.
          </p>
          <a
            href="https://wa.me/5518996205555?text=Quero%20verificar%20se%20minha%20empresa%20é%20elegível"
            target="_blank"
            rel="noopener"
            className="benef__cta reveal"
          >
            Solicitar análise de elegibilidade
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>
      </section>

      {/* ── OUTRAS ÁREAS ── */}
      <section className="areas section-pad" id="areas">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">Bohac Advogados</span>
            <h2>Outras áreas de atuação</h2>
            <p className="lede">
              Além da equiparação hospitalar, o escritório Bohac Advogados oferece assessoria jurídica completa para empresas e profissionais de saúde.
            </p>
          </div>
          <div className="areas-grid">
            <div className="area-item reveal" data-d="1">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z"/>
                </svg>
              </span>
              <h4>Direito Médico</h4>
              <p>Defesa de profissionais e instituições de saúde em processos administrativos e judiciais.</p>
            </div>
            <div className="area-item reveal" data-d="2">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18"/><path d="M5 21V8l7-4 7 4v13"/><path d="M9 21v-6h6v6"/>
                </svg>
              </span>
              <h4>Direito Empresarial</h4>
              <p>Constituição, reestruturação societária e planejamento jurídico para empresas do setor de saúde.</p>
            </div>
            <div className="area-item reveal" data-d="3">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4"/><path d="M5 7h14v12a2 2 0 01-2 2H7a2 2 0 01-2-2z"/><path d="M9 3h6v4H9z"/>
                </svg>
              </span>
              <h4>Contratos</h4>
              <p>Elaboração e revisão de contratos de prestação de serviços, convênios e parcerias no setor de saúde.</p>
            </div>
            <div className="area-item reveal" data-d="4">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </span>
              <h4>Compliance</h4>
              <p>Implementação de programas de conformidade regulatória para clínicas e hospitais.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="final section-pad">
        <div className="wrap">
          <div className="final__inner">
            <span className="kicker on-navy center reveal">Prescrição quinquenal</span>
            <h2 className="reveal" data-d="1">
              Tributos recolhidos a maior só são recuperáveis dentro do prazo legal
            </h2>
            <p className="reveal" data-d="2">
              O direito à restituição ou compensação dos valores pagos indevidamente extingue-se em 5 anos contados do recolhimento (art. 168 do CTN). A verificação de elegibilidade é gratuita e não gera qualquer obrigação.
            </p>
            <div className="final__actions reveal" data-d="3">
              <a
                href="https://wa.me/5518996205555?text=Quero%20verificar%20minha%20elegibilidade%20para%20equiparação%20hospitalar"
                target="_blank"
                rel="noopener"
                className="btn btn--gold btn-lg"
              >
                Solicitar diagnóstico tributário gratuito
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
              <a href="#topo" className="btn btn--ghost-light btn-lg">
                Verificar meu CNPJ
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer__top">
            <div className="footer__brand">
              <img src="/logo-inverted.png" alt="Bohac Med" />
              <p>
                Assessoria jurídico-tributária para o setor de saúde. Atuamos no enquadramento de prestadores de serviços médicos ao regime de equiparação hospitalar (Lei 9.249/1995, art. 15) com segurança técnica e jurídica.
              </p>
            </div>
            <div className="footer__col">
              <h4>Serviços</h4>
              <a href="#tese">Equiparação Hospitalar</a>
              <a href="#como-funciona">Como Funciona</a>
              <a href="#beneficiarios">Quem se Beneficia</a>
              <a href="#areas">Outras Áreas</a>
            </div>
            <div className="footer__col">
              <h4>Contato</h4>
              <a
                href="https://wa.me/5518996205555"
                target="_blank"
                rel="noopener"
              >
                (18) 99620-5555
              </a>
              <p>Álvares Machado — SP</p>
              <a href="mailto:contato@bohacadvogados.com.br">
                contato@bohacadvogados.com.br
              </a>
            </div>
          </div>
          <div className="footer__bottom">
            <span className="oab">
              © {new Date().getFullYear()} Bohac Advogados Associados · OAB/SP
            </span>
            <div className="footer__social">
              {/* Instagram */}
              <a
                href="https://instagram.com/bohacadvogados"
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="https://linkedin.com/company/bohacadvogados"
                target="_blank"
                rel="noopener"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── WhatsApp Float ── */}
      <a
        href="https://wa.me/5518996205555?text=Olá,%20gostaria%20de%20informações%20sobre%20equiparação%20hospitalar"
        target="_blank"
        rel="noopener"
        className="wa-float"
        ref={waRef}
        aria-label="Fale no WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </>
  );
}
