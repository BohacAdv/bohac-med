"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <main style={{ background: "var(--cream)", fontFamily: "'Jost', sans-serif", color: "var(--dark)" }}>

      {/* ── NAV ── */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.5rem 3rem",
        borderBottom: "1px solid var(--line)",
        background: "var(--cream)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, letterSpacing: "0.08em" }}>
            BOHAC <span style={{ fontWeight: 300, color: "var(--gold)" }}>MED</span>
          </span>
          <span style={{ fontSize: 9, letterSpacing: "0.22em", fontWeight: 300, color: "var(--muted)", textTransform: "uppercase" }}>
            Advogados Associados
          </span>
        </div>
        <div style={{ display: "flex", gap: "2.5rem" }}>
          <a href="#como-funciona" style={{ fontSize: 12, letterSpacing: "0.18em", fontWeight: 400, color: "var(--muted)", textDecoration: "none", textTransform: "uppercase" }}>
            Como funciona
          </a>
          <a href="#sobre" style={{ fontSize: 12, letterSpacing: "0.18em", fontWeight: 400, color: "var(--muted)", textDecoration: "none", textTransform: "uppercase" }}>
            A tese
          </a>
        </div>
        <a
          href="https://wa.me/5518999999999"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline-gold"
        >
          Falar com advogado
        </a>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: "88vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        padding: "0 3rem",
        alignItems: "center",
        borderBottom: "1px solid var(--line)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* fundo direito */}
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: "45%",
          background: "var(--cream-dark)", zIndex: 0,
        }} />

        {/* coluna esquerda */}
        <div style={{ position: "relative", zIndex: 1, paddingRight: "4rem" }}>
          <div className="section-tag-el">Análise tributária gratuita</div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 52,
            fontWeight: 300,
            lineHeight: 1.12,
            marginBottom: "1.5rem",
          }}>
            Sua clínica pode estar<br />
            pagando imposto<br />
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>a mais</em>
          </h1>
          <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.9, color: "var(--muted)", maxWidth: 380, marginBottom: "3rem" }}>
            A tese de <strong style={{ fontWeight: 400, color: "var(--mid)" }}>equiparação hospitalar</strong> permite que médicos
            e clínicas reduzam drasticamente o IRPJ e a CSLL — de forma legal, reconhecida pelo STJ.
            Descubra agora se você tem esse direito.
          </p>

          {/* Formulário CNPJ */}
          <form onSubmit={handleAnalisar} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                CNPJ da sua empresa
              </label>
              <input
                type="text"
                value={cnpj}
                onChange={e => setCnpj(formatarCNPJ(e.target.value))}
                placeholder="00.000.000/0001-00"
                className="bohac-input"
                style={{ fontSize: 18, textAlign: "center", letterSpacing: "0.08em" }}
                inputMode="numeric"
                maxLength={18}
                disabled={carregando}
              />
            </div>
            {erro && <p style={{ fontSize: 12, color: "#b91c1c" }}>{erro}</p>}
            <button
              type="submit"
              disabled={carregando}
              className="btn-gold"
              style={{ width: "100%", textAlign: "center" }}
            >
              {carregando ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <svg style={{ animation: "spin 1s linear infinite", width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Consultando Receita Federal…
                </span>
              ) : (
                "Verificar agora — é grátis"
              )}
            </button>
            <p style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.06em" }}>
              🔒 Seus dados são usados apenas para a análise.
            </p>
          </form>

          <div style={{ marginTop: "2rem" }}>
            <a href="/analise" style={{
              fontSize: 11, letterSpacing: "0.18em", fontWeight: 400, textTransform: "uppercase",
              color: "var(--mid)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
            }}>
              Analisar pela descrição de serviços <span>→</span>
            </a>
          </div>
        </div>

        {/* coluna direita — stats */}
        <div style={{
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "5rem 2rem", gap: "2rem",
        }}>
          <div style={{
            position: "absolute", top: "3rem", right: "3rem",
            fontFamily: "'Cormorant Garamond', serif", fontSize: 180, fontWeight: 300,
            color: "rgba(184,151,90,0.08)", lineHeight: 1, pointerEvents: "none",
            letterSpacing: "-0.05em",
          }}>§</div>

          {[
            { num: "32→8%", label: "Redução da base de cálculo do IRPJ" },
            { num: "5 anos", label: "De impostos pagos a mais para recuperar" },
            { num: "STJ", label: "Jurisprudência consolidada — Tema 217" },
          ].map(({ num, label }, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: i < 2 ? 0 : 0 }}>
              {i > 0 && <div style={{ width: 1, height: 40, background: "var(--line)", margin: "0 auto" }} />}
              <div style={{
                background: "#fff", border: "1px solid var(--line)", padding: "1.5rem 2rem",
                width: 240, textAlign: "center",
              }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, color: "var(--gold)", lineHeight: 1 }}>
                  {num}
                </div>
                <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--muted)", textTransform: "uppercase", marginTop: 6 }}>
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── O QUE É A TESE ── */}
      <section id="sobre" style={{ padding: "6rem 3rem", borderBottom: "1px solid var(--line)" }}>
        <div className="section-tag-el">A tese tributária</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 300, marginBottom: "4rem" }}>
          O que é a <em style={{ fontStyle: "italic" }}>equiparação hospitalar</em>?
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5px", background: "var(--line)", border: "1px solid var(--line)" }}>
          {[
            {
              icon: "⚖️",
              titulo: "Base legal sólida",
              texto: "Prevista no art. 15, §1°, III, \"a\" da Lei 9.249/95 e reconhecida pelo STJ no Tema 217. Não é um artifício — é um direito seu que a maioria dos contadores desconhece.",
            },
            {
              icon: "📉",
              titulo: "Redução real de impostos",
              texto: "A base de cálculo do IRPJ cai de 32% para 8% sobre a receita bruta. Para uma clínica com R$500 mil de faturamento anual, isso pode representar mais de R$60 mil de economia.",
            },
            {
              icon: "🏥",
              titulo: "Para quem se aplica",
              texto: "Clínicas médicas, laboratórios, diagnóstico por imagem, fisioterapia, cirurgia ambulatorial, hemodiálise e outros serviços de natureza hospitalar.",
            },
          ].map(({ icon, titulo, texto }) => (
            <div key={titulo} style={{ background: "var(--cream)", padding: "2.5rem 2rem" }}>
              <div style={{
                width: 36, height: 36, border: "1px solid var(--gold)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "1.25rem", fontSize: 18,
              }}>{icon}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, marginBottom: "0.75rem" }}>
                {titulo}
              </div>
              <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.85, color: "var(--muted)" }}>{texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" style={{ padding: "6rem 3rem", background: "var(--dark)" }}>
        <div style={{ position: "relative" }}>
          <div style={{
            position: "absolute", right: -60, top: -60,
            fontFamily: "'Cormorant Garamond', serif", fontSize: 300, fontWeight: 300,
            color: "rgba(255,255,255,0.02)", lineHeight: 1, pointerEvents: "none",
          }}>B</div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            fontSize: 10, letterSpacing: "0.28em", fontWeight: 400,
            color: "var(--gold-light)", textTransform: "uppercase", marginBottom: "1rem",
          }}>
            <span style={{ display: "block", width: 24, height: 1, background: "var(--gold-light)" }} />
            Como funciona
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 300, color: "#F5F0E8", marginBottom: "4rem" }}>
            Análise em <em style={{ fontStyle: "italic", color: "var(--gold-light)" }}>menos de 10 segundos</em>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2rem" }}>
            {[
              { num: "01", titulo: "Informe o CNPJ", texto: "Digite o CNPJ da sua clínica ou empresa médica. Consultamos os dados diretamente na Receita Federal." },
              { num: "02", titulo: "Análise automática", texto: "Verificamos os CNAEs cadastrados e os comparamos com a lista de atividades elegíveis para a tese." },
              { num: "03", titulo: "Resultado imediato", texto: "Você recebe um diagnóstico claro: viabilidade alta, média, baixa ou não elegível — com a explicação em linguagem simples." },
              { num: "04", titulo: "Análise completa", texto: "Se houver viabilidade, nossa equipe calcula o valor exato de imposto recuperável e entra em contato." },
            ].map(({ num, titulo, texto }) => (
              <div key={num} style={{ borderTop: "1px solid rgba(184,151,90,0.4)", paddingTop: "2rem" }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, color: "rgba(184,151,90,0.35)", lineHeight: 1, marginBottom: "1rem" }}>{num}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 400, color: "#F5F0E8", marginBottom: "0.6rem" }}>{titulo}</div>
                <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.8, color: "rgba(245,240,232,0.5)" }}>{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <div style={{
        background: "var(--gold)", padding: "4rem 3rem",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem",
      }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 300, color: "#fff" }}>
          Verifique agora se sua clínica tem esse direito.<br />
          <em style={{ fontStyle: "italic" }}>A análise é gratuita e leva segundos.</em>
        </div>
        <a
          href="#"
          onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          style={{
            flexShrink: 0, padding: "14px 36px",
            border: "1px solid #fff", color: "#fff",
            fontFamily: "'Jost', sans-serif", fontSize: 11, letterSpacing: "0.2em", fontWeight: 500,
            textTransform: "uppercase", textDecoration: "none",
            transition: "all 0.25s",
          }}
          onMouseEnter={e => { (e.target as HTMLElement).style.background = "#fff"; (e.target as HTMLElement).style.color = "var(--gold)"; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.background = "transparent"; (e.target as HTMLElement).style.color = "#fff"; }}
        >
          Verificar meu CNPJ →
        </a>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        background: "var(--dark)", padding: "3rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, letterSpacing: "0.08em", color: "#F5F0E8" }}>
            BOHAC MED
          </div>
          <div style={{ fontSize: 9, letterSpacing: "0.22em", fontWeight: 300, color: "var(--gold-light)", textTransform: "uppercase", marginTop: 2 }}>
            Advogados Associados · Setor Médico
          </div>
        </div>
        <div style={{ display: "flex", gap: "2rem" }}>
          {["(18) 3222-6245", "contato@bohacadvocacia.com.br", "@bohac.advocacia"].map(item => (
            <span key={item} style={{ fontSize: 11, letterSpacing: "0.1em", color: "rgba(245,240,232,0.4)" }}>{item}</span>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "rgba(245,240,232,0.3)", letterSpacing: "0.06em" }}>
          © {new Date().getFullYear()} Bohac Advogados Associados
        </div>
      </footer>
    </main>
  );
}
