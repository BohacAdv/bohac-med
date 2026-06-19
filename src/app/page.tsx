"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BrandMark from "@/components/BrandMark";

const GOLD = "#BF9A57";
const GOLD_DARK = "#a9853f";
const GOLD_LIGHT = "#d8bc83";
const NAVY = "#0C2438";
const NAVY_700 = "#102d45";
const CREAM = "#F6F2EA";
const INK = "#12253a";
const MUTED_NAVY = "#aebccb";
const WA_NUMBER = "5518999999999";

export default function HomePage() {
  const router = useRouter();
  const [cnpj, setCnpj] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  function formatarCNPJ(valor: string) {
    const nums = valor.replace(/\D/g, "").slice(0, 14);
    return nums
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  async function handleAnalisar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const cnpjLimpo = cnpj.replace(/\D/g, "");
    if (cnpjLimpo.length !== 14) {
      setErro("Digite um CNPJ válido com 14 dígitos.");
      return;
    }
    setCarregando(true);
    try {
      const res = await fetch("/api/analisar-cnpj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cnpj: cnpjLimpo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro ?? "Erro ao analisar CNPJ.");
      sessionStorage.setItem("resultado", JSON.stringify(data.resultado));
      router.push("/resultado");
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main style={{ fontFamily: "'Jost', sans-serif", color: INK, background: CREAM }}>

      {/* ── NAV ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: NAVY, borderBottom: `1px solid rgba(191,154,87,0.18)`,
      }}>
        <div className="wrap nav-inner">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Bohac Med — início"
            style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "none", border: "none", cursor: "pointer", padding: 0,
            }}
          >
            <BrandMark size={40} tone="onDark" />
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 21, fontWeight: 600, letterSpacing: "0.1em",
              color: CREAM,
            }}>
              BOHAC <span style={{ color: GOLD, fontWeight: 400 }}>MED</span>
            </span>
          </button>

          <nav className="nav-links" aria-label="Navegação principal">
            {[
              { label: "A tese", href: "#tese" },
              { label: "Como funciona", href: "#como-funciona" },
              { label: "Quem se beneficia", href: "#beneficia" },
              { label: "Outras áreas", href: "#areas" },
            ].map(({ label, href }) => (
              <a key={href} href={href} style={{
                fontSize: 13, letterSpacing: "0.14em", fontWeight: 400,
                color: MUTED_NAVY, textDecoration: "none", textTransform: "uppercase",
                transition: "color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = GOLD_LIGHT)}
              onMouseLeave={e => (e.currentTarget.style.color = MUTED_NAVY)}
              >
                {label}
              </a>
            ))}
          </nav>

          <a href="#verificar" className="btn-nav-cta" style={{
            padding: "11px 28px",
            background: GOLD, color: "#fff",
            fontFamily: "'Jost', sans-serif",
            fontSize: 12, letterSpacing: "0.18em", fontWeight: 500,
            textDecoration: "none", textTransform: "uppercase",
            transition: "background 0.2s", whiteSpace: "nowrap",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = GOLD_DARK)}
          onMouseLeave={e => (e.currentTarget.style.background = GOLD)}
          >
            Verificar meu CNPJ
          </a>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{
        background: NAVY,
        padding: "5rem 0 0",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* fundo decorativo */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(ellipse 70% 60% at 70% 40%, rgba(191,154,87,0.06) 0%, transparent 70%)`,
        }} />

        <div className="wrap hero-grid">
          {/* ── Coluna esquerda: copy ── */}
          <div className="hero-copy">
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              fontSize: 11, letterSpacing: "0.28em", fontWeight: 600,
              color: GOLD, textTransform: "uppercase", marginBottom: "1.5rem",
            }}>
              <span style={{ width: 24, height: 1, background: GOLD, display: "block" }} />
              Análise tributária gratuita
            </div>

            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(38px, 5.5vw, 66px)",
              fontWeight: 600, lineHeight: 1.05,
              color: CREAM, marginBottom: "1.5rem", letterSpacing: "-0.01em",
            }}>
              Sua clínica pode<br />
              estar pagando<br />
              imposto{" "}
              <em style={{ fontStyle: "italic", color: GOLD }}>a mais.</em>
            </h1>

            <p style={{
              fontSize: 16, fontWeight: 300, lineHeight: 1.8,
              color: MUTED_NAVY, maxWidth: 500, marginBottom: "2rem",
            }}>
              A tese da{" "}
              <strong style={{ color: CREAM, fontWeight: 500 }}>equiparação hospitalar</strong>{" "}
              permite que médicos e clínicas reduzam a base de cálculo do IRPJ e da CSLL
              sobre a receita bruta — de forma legal e reconhecida pelo STJ.
            </p>

            {/* Pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "2rem" }}>
              {[
                <>Base IRPJ <s style={{ color: MUTED_NAVY }}>32%</s> <b style={{ color: GOLD }}>8%</b></>,
                <>Base CSLL <s style={{ color: MUTED_NAVY }}>32%</s> <b style={{ color: GOLD }}>12%</b></>,
                <><b style={{ color: GOLD }}>5 anos</b> retroativos</>,
              ].map((content, i) => (
                <span key={i} style={{
                  padding: "6px 14px",
                  border: `1px solid rgba(191,154,87,0.35)`,
                  color: CREAM, fontSize: 13, letterSpacing: "0.04em",
                  background: "rgba(191,154,87,0.08)",
                }}>
                  {content}
                </span>
              ))}
            </div>

            {/* Legal strip */}
            <div className="legal-strip">
              {[
                { icon: "⚖️", label: <><b>Arts. 15 e 20</b> · Lei 9.249/95</> },
                { icon: "🏛️", label: <><b>STJ</b> · Repetitivo Tema 217</> },
                { icon: "📄", label: <><b>Receita Federal</b> · IN RFB 1.700/2017</> },
                { icon: "📋", label: <><b>38 CNAEs</b> elegíveis →</>, href: "/cnaes-elegiveis" },
              ].map(({ icon, label, href }, i) => {
                const style: React.CSSProperties = {
                  display: "flex", alignItems: "center", gap: 8,
                  fontSize: 12, color: MUTED_NAVY, letterSpacing: "0.04em",
                  textDecoration: "none",
                  cursor: href ? "pointer" : "default",
                  transition: "color 0.2s",
                };
                const content = <><span>{icon}</span><span>{label}</span></>;
                return href ? (
                  <a key={i} href={href} style={style}
                    onMouseEnter={e => (e.currentTarget.style.color = GOLD_LIGHT)}
                    onMouseLeave={e => (e.currentTarget.style.color = MUTED_NAVY)}
                  >{content}</a>
                ) : (
                  <span key={i} style={style}>{content}</span>
                );
              })}
            </div>
          </div>

          {/* ── Coluna direita: checker card ── */}
          <div className="hero-checker" id="verificar">
            <div style={{
              background: "#fff",
              padding: "2.25rem",
              borderRadius: 4,
              boxShadow: "0 24px 80px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2)",
              maxWidth: 420,
              width: "100%",
            }}>
              {/* card header */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "0.75rem" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: `rgba(191,154,87,0.12)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.7" style={{ width: 20, height: 20 }}>
                    <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
                  </svg>
                </div>
                <div>
                  <h3 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 21, fontWeight: 600, color: INK, margin: 0, lineHeight: 1.2,
                  }}>
                    Verifique gratuitamente
                  </h3>
                </div>
              </div>

              <p style={{ fontSize: 14, color: "#5a6776", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Informe o CNPJ da sua clínica e descubra em segundos se você tem direito à redução.
              </p>

              <form onSubmit={handleAnalisar}>
                <label style={{
                  display: "block", fontSize: 11, letterSpacing: "0.2em",
                  fontWeight: 600, textTransform: "uppercase",
                  color: "#5a6776", marginBottom: 6,
                }}>
                  CNPJ da empresa
                </label>
                <input
                  type="text"
                  value={cnpj}
                  onChange={e => setCnpj(formatarCNPJ(e.target.value))}
                  placeholder="00.000.000/0000-00"
                  inputMode="numeric"
                  maxLength={18}
                  disabled={carregando}
                  style={{
                    display: "block", width: "100%",
                    padding: "13px 16px",
                    border: `1px solid ${erro ? "#b91c1c" : "rgba(12,36,56,0.18)"}`,
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 18, fontWeight: 400, textAlign: "center",
                    letterSpacing: "0.08em", color: INK,
                    outline: "none", transition: "border-color 0.2s",
                    borderRadius: 2, marginBottom: 4,
                  }}
                  onFocus={e => { if (!erro) e.target.style.borderColor = GOLD; }}
                  onBlur={e => { if (!erro) e.target.style.borderColor = "rgba(12,36,56,0.18)"; }}
                />
                {erro && <p style={{ fontSize: 12, color: "#b91c1c", marginBottom: 8, marginTop: 2 }}>{erro}</p>}

                <button
                  type="submit"
                  disabled={carregando}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 8, width: "100%",
                    padding: "14px 24px",
                    background: carregando ? GOLD_DARK : GOLD,
                    color: "#fff", border: "none", cursor: carregando ? "not-allowed" : "pointer",
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 13, letterSpacing: "0.18em", fontWeight: 600,
                    textTransform: "uppercase",
                    borderRadius: 2, marginTop: 4, transition: "background 0.2s",
                  }}
                  onMouseEnter={e => { if (!carregando) (e.currentTarget as HTMLElement).style.background = GOLD_DARK; }}
                  onMouseLeave={e => { if (!carregando) (e.currentTarget as HTMLElement).style.background = GOLD; }}
                >
                  {carregando ? (
                    <>
                      <svg style={{ animation: "spin 1s linear infinite", width: 16, height: 16, flexShrink: 0 }} viewBox="0 0 24 24" fill="none">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Consultando Receita Federal…
                    </>
                  ) : (
                    <>Verificar agora — é grátis →</>
                  )}
                </button>

                {/* Trust bar */}
                <div style={{
                  display: "flex", gap: "1rem", marginTop: "1rem",
                  paddingTop: "1rem", borderTop: "1px solid rgba(12,36,56,0.1)",
                  flexWrap: "wrap", justifyContent: "center",
                }}>
                  {[
                    { icon: "🔒", text: "Dados protegidos" },
                    { icon: "⚡", text: "Resultado em segundos" },
                    { icon: "✓", text: "100% gratuito" },
                  ].map(({ icon, text }) => (
                    <span key={text} style={{
                      fontSize: 11, color: "#5a6776", letterSpacing: "0.06em",
                      display: "flex", alignItems: "center", gap: 5,
                    }}>
                      {icon} {text}
                    </span>
                  ))}
                </div>

                <p style={{ textAlign: "center", marginTop: "0.75rem" }}>
                  <a href="/analise" style={{
                    fontSize: 12, color: "#5a6776", letterSpacing: "0.1em",
                    textDecoration: "none", borderBottom: "1px solid rgba(12,36,56,0.15)",
                    paddingBottom: 1, transition: "color 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                  onMouseLeave={e => (e.currentTarget.style.color = "#5a6776")}
                  >
                    Analisar pela descrição de serviços →
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* bottom wave separator */}
        <div style={{ height: 48, background: CREAM, clipPath: "ellipse(55% 100% at 50% 100%)", marginTop: -1 }} />
      </section>

      {/* ── STATS ── */}
      <section style={{ background: CREAM, padding: "4rem 0", borderBottom: `1px solid rgba(12,36,56,0.08)` }}>
        <div className="wrap stats-grid">
          {[
            {
              big: <><span style={{ fontSize: "0.55em", color: "#aaa" }}>32%</span> <span style={{ color: GOLD }}>8%</span></>,
              label: "Redução da base do IRPJ",
              desc: "A CSLL cai de 32% para 12% — sobre a receita bruta, não o lucro.",
            },
            {
              big: <><span style={{ color: NAVY }}>5</span> <span style={{ fontSize: "0.45em", color: GOLD, alignSelf: "center" }}>anos</span></>,
              label: "Recuperação retroativa",
              desc: "Prazo para reaver, na Justiça, os impostos pagos a mais no passado.",
            },
            {
              big: <><span style={{ fontSize: "0.55em", color: "#aaa" }}>Tema</span> <span style={{ color: GOLD }}>217</span></>,
              label: "Jurisprudência do STJ",
              desc: "Tese consolidada em recurso repetitivo pelo Superior Tribunal de Justiça.",
            },
          ].map(({ big, label, desc }, i) => (
            <div key={i} className="stat-cell" style={{
              textAlign: "center", padding: "2rem 1.5rem",
              borderLeft: i > 0 ? `1px solid rgba(12,36,56,0.1)` : "none",
            }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(44px, 6vw, 72px)", fontWeight: 700,
                lineHeight: 1, marginBottom: "0.75rem",
                display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6,
              }}>
                {big}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", color: INK, marginBottom: "0.5rem" }}>
                {label}
              </div>
              <p style={{ fontSize: 13, color: "#5a6776", lineHeight: 1.65, maxWidth: 260, margin: "0 auto" }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── A TESE ── */}
      <section id="tese" style={{ background: NAVY_700, padding: "6rem 0" }}>
        <div className="wrap">
          <div style={{ marginBottom: "3rem" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              fontSize: 11, letterSpacing: "0.28em", fontWeight: 600,
              color: GOLD, textTransform: "uppercase", marginBottom: "1rem",
            }}>
              <span style={{ width: 24, height: 1, background: GOLD, display: "block" }} />
              A tese tributária
            </div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 600,
              color: CREAM, maxWidth: 560, lineHeight: 1.1,
            }}>
              O que é a <em style={{ fontStyle: "italic" }}>equiparação hospitalar</em>?
            </h2>
            <p style={{ fontSize: 16, color: MUTED_NAVY, marginTop: "1rem", maxWidth: 600, lineHeight: 1.7 }}>
              Um direito previsto em lei e reconhecido pelos tribunais — que a maioria dos contadores ainda desconhece.
            </p>
          </div>

          <div className="tese-grid-3">
            {[
              {
                titulo: "Base legal sólida",
                texto: <>Prevista no art. 15, §1º, III, "a" da <b>Lei 9.249/95</b> e reconhecida pelo STJ no Tema 217. Não é artifício — é um direito seu.</>,
                icon: "⚖️",
              },
              {
                titulo: "Redução real de impostos",
                texto: <>A base do IRPJ cai de 32% para 8% e a da CSLL de 32% para 12%. Para uma clínica com <b>R$ 500 mil/ano</b>, isso pode significar mais de <b>R$ 60 mil</b> de economia.</>,
                icon: "📉",
              },
              {
                titulo: "Para quem se aplica",
                texto: "Clínicas médicas, laboratórios, diagnóstico por imagem, fisioterapia, cirurgia ambulatorial, hemodiálise e outros serviços de natureza hospitalar.",
                icon: "🏥",
              },
            ].map(({ titulo, texto, icon }) => (
              <div key={titulo} style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid rgba(191,154,87,0.2)`,
                padding: "2.25rem 2rem",
                borderRadius: 4,
                transition: "background 0.2s",
              }}>
                <div style={{
                  width: 52, height: 52,
                  border: `1px solid rgba(191,154,87,0.4)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, marginBottom: "1.25rem",
                }}>
                  {icon}
                </div>
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 21, fontWeight: 600, color: CREAM,
                  marginBottom: "0.75rem",
                }}>
                  {titulo}
                </h3>
                <p style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.8, color: MUTED_NAVY }}>
                  {texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" style={{ background: CREAM, padding: "6rem 0" }}>
        <div className="wrap">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              fontSize: 11, letterSpacing: "0.28em", fontWeight: 600,
              color: GOLD, textTransform: "uppercase", marginBottom: "1rem",
            }}>
              <span style={{ width: 24, height: 1, background: GOLD, display: "block" }} />
              Como funciona
              <span style={{ width: 24, height: 1, background: GOLD, display: "block" }} />
            </div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 600, color: INK,
            }}>
              Análise em <em style={{ fontStyle: "italic", color: GOLD }}>menos de 10 segundos.</em>
            </h2>
            <p style={{ fontSize: 16, color: "#5a6776", marginTop: "1rem", maxWidth: 540, margin: "1rem auto 0" }}>
              Um diagnóstico inicial automático, gratuito e sem compromisso — antes mesmo de falar com a gente.
            </p>
          </div>

          <div className="steps-grid">
            {[
              { num: "01", titulo: "Informe o CNPJ", texto: "Digite o CNPJ da sua clínica ou empresa médica. Consultamos os dados diretamente na Receita Federal." },
              { num: "02", titulo: "Análise automática", texto: "Verificamos os CNAEs cadastrados e os comparamos com a lista de atividades elegíveis para a tese." },
              { num: "03", titulo: "Resultado imediato", texto: "Você recebe um diagnóstico claro: viabilidade alta, média, baixa ou não elegível, em linguagem simples." },
              { num: "04", titulo: "Análise completa", texto: "Havendo viabilidade, nossa equipe calcula o valor exato recuperável e entra em contato para análise documental." },
            ].map(({ num, titulo, texto }) => (
              <div key={num} style={{ paddingTop: "2rem", borderTop: `2px solid ${GOLD}` }}>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 44, fontWeight: 700, color: `rgba(191,154,87,0.25)`,
                  lineHeight: 1, marginBottom: "1rem",
                }}>
                  {num}
                </div>
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 20, fontWeight: 600, color: INK, marginBottom: "0.6rem",
                }}>
                  {titulo}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: "#5a6776" }}>{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUEM SE BENEFICIA ── */}
      <section id="beneficia" style={{ background: NAVY, padding: "6rem 0" }}>
        <div className="wrap">
          <div style={{ marginBottom: "3rem" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              fontSize: 11, letterSpacing: "0.28em", fontWeight: 600,
              color: GOLD, textTransform: "uppercase", marginBottom: "1rem",
            }}>
              <span style={{ width: 24, height: 1, background: GOLD, display: "block" }} />
              Atividades elegíveis
            </div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 600, color: CREAM, maxWidth: 560,
            }}>
              Quem pode se beneficiar da tese.
            </h2>
            <p style={{ fontSize: 16, color: MUTED_NAVY, marginTop: "1rem", maxWidth: 580, lineHeight: 1.7 }}>
              Serviços de natureza hospitalar enquadrados na Divisão 86 do IBGE — são 38 CNAEs potencialmente elegíveis.
            </p>
            <a href="/cnaes-elegiveis" style={{
              display: "inline-block", marginTop: "1rem",
              fontSize: 13, letterSpacing: "0.12em", color: GOLD_LIGHT,
              textDecoration: "none", borderBottom: `1px solid rgba(191,154,87,0.4)`,
              paddingBottom: 2, transition: "color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = CREAM)}
            onMouseLeave={e => (e.currentTarget.style.color = GOLD_LIGHT)}
            >
              Ver a lista completa de CNAEs elegíveis →
            </a>
          </div>

          <div className="benef-grid">
            {[
              { icon: "🏥", label: "Clínicas médicas" },
              { icon: "🧪", label: "Laboratórios" },
              { icon: "📷", label: "Diagnóstico por imagem" },
              { icon: "🦴", label: "Fisioterapia" },
              { icon: "🔬", label: "Cirurgia ambulatorial" },
              { icon: "💧", label: "Hemodiálise" },
              { icon: "🚑", label: "Pronto atendimento" },
              { icon: "🏨", label: "Day clinics & hospitais" },
            ].map(({ icon, label }) => (
              <div key={label} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "1.25rem 1.5rem",
                border: `1px solid rgba(191,154,87,0.18)`,
                background: "rgba(255,255,255,0.03)",
                borderRadius: 4,
                transition: "background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(191,154,87,0.1)";
                (e.currentTarget as HTMLElement).style.borderColor = `rgba(191,154,87,0.4)`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                (e.currentTarget as HTMLElement).style.borderColor = `rgba(191,154,87,0.18)`;
              }}
              >
                <span style={{ fontSize: 22 }}>{icon}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: CREAM, letterSpacing: "0.04em" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <p style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            fontSize: 13, color: MUTED_NAVY, lineHeight: 1.65,
            marginTop: "2rem", maxWidth: 680,
          }}>
            <span style={{ flexShrink: 0 }}>ℹ️</span>
            Não tem certeza se sua atividade se enquadra? O verificador analisa seu CNPJ específico em segundos.
          </p>
        </div>
      </section>

      {/* ── OUTRAS ÁREAS ── */}
      <section id="areas" style={{ background: CREAM, padding: "6rem 0" }}>
        <div className="wrap">
          <div style={{ marginBottom: "3rem" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              fontSize: 11, letterSpacing: "0.28em", fontWeight: 600,
              color: GOLD, textTransform: "uppercase", marginBottom: "1rem",
            }}>
              <span style={{ width: 24, height: 1, background: GOLD, display: "block" }} />
              Além da tese tributária
            </div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 600, color: INK, maxWidth: 560,
            }}>
              A Bohac Med cuida de todo o jurídico do médico.
            </h2>
            <p style={{ fontSize: 16, color: "#5a6776", marginTop: "1rem", maxWidth: 560, lineHeight: 1.7 }}>
              A equiparação hospitalar é só o começo. Somos um escritório dedicado ao setor da saúde, do consultório à gestão.
            </p>
          </div>

          <div className="areas-grid">
            {[
              {
                icon: "🛡️",
                titulo: "Direito Médico",
                texto: "Defesa em conselhos (CRM) e em ações por suposto erro médico.",
              },
              {
                icon: "🏢",
                titulo: "Direito Empresarial",
                texto: "Estruturação de clínicas, contratos e a operação jurídica do dia a dia.",
              },
              {
                icon: "📝",
                titulo: "Contratos & Societário",
                texto: "Sociedades, holding, sucessão e acordos entre sócios.",
              },
              {
                icon: "🔏",
                titulo: "Compliance & LGPD",
                texto: "Governança de dados de pacientes e conformidade regulatória.",
              },
            ].map(({ icon, titulo, texto }) => (
              <div key={titulo} style={{
                padding: "2rem",
                borderTop: `3px solid ${GOLD}`,
                background: "#fff",
                borderRadius: "0 0 4px 4px",
                boxShadow: "0 2px 12px rgba(12,36,56,0.06)",
                transition: "box-shadow 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(12,36,56,0.12)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(12,36,56,0.06)"}
              >
                <div style={{ fontSize: 32, marginBottom: "1rem" }}>{icon}</div>
                <h4 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 20, fontWeight: 600, color: INK, marginBottom: "0.6rem",
                }}>
                  {titulo}
                </h4>
                <p style={{ fontSize: 14, color: "#5a6776", lineHeight: 1.7 }}>{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ background: NAVY, padding: "6rem 0" }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            fontSize: 11, letterSpacing: "0.28em", fontWeight: 600,
            color: GOLD, textTransform: "uppercase", marginBottom: "1.5rem",
          }}>
            <span style={{ width: 24, height: 1, background: GOLD, display: "block" }} />
            Comece agora
            <span style={{ width: 24, height: 1, background: GOLD, display: "block" }} />
          </div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 600, color: CREAM,
            maxWidth: 620, margin: "0 auto 1rem",
          }}>
            Verifique se sua clínica tem esse direito.
          </h2>
          <p style={{ fontSize: 16, color: MUTED_NAVY, marginBottom: "2.5rem", lineHeight: 1.7 }}>
            A análise é gratuita e leva menos de 10 segundos. Sem compromisso.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#verificar" style={{
              padding: "15px 40px",
              background: GOLD, color: "#fff",
              fontFamily: "'Jost', sans-serif",
              fontSize: 13, letterSpacing: "0.18em", fontWeight: 600,
              textDecoration: "none", textTransform: "uppercase",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = GOLD_DARK)}
            onMouseLeave={e => (e.currentTarget.style.background = GOLD)}
            >
              Verificar meu CNPJ →
            </a>
            <a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                padding: "15px 40px",
                border: `1px solid rgba(191,154,87,0.5)`,
                color: GOLD_LIGHT, background: "transparent",
                fontFamily: "'Jost', sans-serif",
                fontSize: 13, letterSpacing: "0.18em", fontWeight: 500,
                textDecoration: "none", textTransform: "uppercase",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget.style.background = "rgba(191,154,87,0.15)"); }}
              onMouseLeave={e => { (e.currentTarget.style.background = "transparent"); }}
            >
              Falar com um advogado
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0a1d2e", padding: "3.5rem 0 2rem", borderTop: `1px solid rgba(191,154,87,0.15)` }}>
        <div className="wrap">
          <div className="footer-top">
            {/* brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
                <BrandMark size={36} tone="onDark" />
                <span style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 18, fontWeight: 600, letterSpacing: "0.1em", color: CREAM,
                }}>
                  BOHAC <span style={{ color: GOLD, fontWeight: 400 }}>MED</span>
                </span>
              </div>
              <p style={{
                fontSize: 13, color: MUTED_NAVY, lineHeight: 1.65, maxWidth: 320,
              }}>
                Advogados associados · Setor médico. Bohac Med é um serviço da Bohac Sociedade de Advogados dedicado à advocacia para médicos, clínicas e empresas da saúde.
              </p>
            </div>

            {/* nav */}
            <div>
              <h4 style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: "1rem", fontWeight: 600 }}>
                Navegação
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {[
                  { label: "A tese tributária", href: "#tese" },
                  { label: "Como funciona", href: "#como-funciona" },
                  { label: "Quem se beneficia", href: "#beneficia" },
                  { label: "Outras áreas", href: "#areas" },
                  { label: "Verificar CNPJ", href: "#verificar" },
                ].map(({ label, href }) => (
                  <a key={href} href={href} style={{
                    fontSize: 13, color: MUTED_NAVY, textDecoration: "none", transition: "color 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = CREAM)}
                  onMouseLeave={e => (e.currentTarget.style.color = MUTED_NAVY)}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {/* contact */}
            <div>
              <h4 style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: "1rem", fontWeight: 600 }}>
                Contato
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {[
                  { label: "(18) 3222-6245", href: "tel:+551832226245" },
                  { label: "contato@bohacadvocacia.com.br", href: "mailto:contato@bohacadvocacia.com.br" },
                  { label: "@bohac.advocacia", href: "https://www.instagram.com/bohac.advocacia/", external: true },
                  { label: "WhatsApp", href: `https://wa.me/${WA_NUMBER}`, external: true },
                ].map(({ label, href, external }) => (
                  <a key={href} href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    style={{ fontSize: 13, color: MUTED_NAVY, textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = CREAM)}
                    onMouseLeave={e => (e.currentTarget.style.color = MUTED_NAVY)}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            borderTop: `1px solid rgba(191,154,87,0.12)`,
            paddingTop: "1.5rem", marginTop: "2.5rem",
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            flexWrap: "wrap", gap: "1rem",
          }}>
            <div>
              <p style={{ fontSize: 11, color: "rgba(174,188,203,0.5)", lineHeight: 1.7, maxWidth: 700 }}>
                © {new Date().getFullYear()} Bohac Sociedade de Advogados — CNPJ 39.293.156/0001-43 · OAB/SP. Bohac Med é um serviço de triagem automatizada com fins informativos e não constitui parecer jurídico.
              </p>
              <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.75rem" }}>
                <a href="/privacidade" style={{ fontSize: 11, color: "rgba(174,188,203,0.45)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = MUTED_NAVY)}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(174,188,203,0.45)")}
                >
                  Política de Privacidade
                </a>
                <a href="/termos" style={{ fontSize: 11, color: "rgba(174,188,203,0.45)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = MUTED_NAVY)}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(174,188,203,0.45)")}
                >
                  Termos de Uso
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ── FLOATING WHATSAPP ── */}
      <a
        href={`https://wa.me/${WA_NUMBER}`}
        target="_blank" rel="noopener noreferrer"
        aria-label="Fale no WhatsApp"
        style={{
          position: "fixed", bottom: "1.75rem", right: "1.75rem",
          width: 54, height: 54, borderRadius: "50%",
          background: "#25D366",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(37,211,102,0.45)",
          zIndex: 100, transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 28px rgba(37,211,102,0.6)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(37,211,102,0.45)";
        }}
      >
        <svg viewBox="0 0 24 24" fill="white" style={{ width: 28, height: 28 }}>
          <path d="M12 2a10 10 0 00-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1112 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.6 6.6 0 01-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.1 0-.3 0-.4l-.7-1.7c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.7.7-.9 1.6-.6 2.6.6 2 2 3.4 3.9 4.4.6.3 1.6.6 2.3.5.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.1-.4-.2z"/>
        </svg>
      </a>

      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .wrap {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
          padding-bottom: 1rem;
        }

        .nav-links {
          display: flex;
          gap: 2.5rem;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 4rem;
          padding-top: 4rem;
          padding-bottom: 4rem;
        }

        .hero-checker {
          display: flex;
          justify-content: flex-end;
        }

        .legal-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem 2rem;
          padding-top: 1.75rem;
          margin-top: 1.75rem;
          border-top: 1px solid rgba(191,154,87,0.2);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }

        .tese-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }

        .benef-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .areas-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .footer-top {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 2rem;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .benef-grid { grid-template-columns: repeat(2, 1fr); }
          .areas-grid { grid-template-columns: repeat(2, 1fr); }
          .steps-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 860px) {
          .nav-links { display: none; }
          .btn-nav-cta { display: none; }

          .hero-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
            padding-top: 3rem;
            padding-bottom: 2rem;
          }
          .hero-checker { justify-content: stretch; }
          .hero-checker > div { max-width: 100% !important; }

          .tese-grid-3 { grid-template-columns: 1fr; }
          .footer-top { grid-template-columns: 1fr; gap: 2rem; }
          .stat-cell { border-left: none !important; border-top: 1px solid rgba(12,36,56,0.1); }
          .stat-cell:first-child { border-top: none; }
          .stats-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 600px) {
          .benef-grid { grid-template-columns: 1fr 1fr; }
          .areas-grid { grid-template-columns: 1fr; }
          .steps-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
