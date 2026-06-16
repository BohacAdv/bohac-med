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
        padding: "1.25rem 3rem",
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
        minHeight: "calc(100vh - 68px)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        position: "relative",
        overflow: "hidden",
        borderBottom: "1px solid var(--line)",
      }}>
        {/* fundo direito */}
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: "42%",
          background: "var(--cream-dark)", zIndex: 0,
        }} />

        {/* marca d'água */}
        <div style={{
          position: "absolute", right: "6%", top: "50%",
          transform: "translateY(-50%)",
          fontFamily: "'Cormorant Garamond', serif", fontSize: 260, fontWeight: 300,
          color: "rgba(184,151,90,0.07)", lineHeight: 1, pointerEvents: "none",
          letterSpacing: "-0.05em", userSelect: "none",
        }}>§</div>

        {/* coluna esquerda */}
        <div style={{
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "5rem 3.5rem 5rem 3rem",
        }}>
          <div className="section-tag-el" style={{ marginBottom: "1.25rem" }}>Análise tributária gratuita</div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 56,
            fontWeight: 300,
            lineHeight: 1.1,
            marginBottom: "1.25rem",
            letterSpacing: "-0.01em",
          }}>
            Sua clínica pode<br />
            estar pagando<br />
            imposto <em style={{ fontStyle: "italic", color: "var(--gold)" }}>a mais</em>
          </h1>
          <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.9, color: "var(--muted)", maxWidth: 420, marginBottom: "2.5rem" }}>
            A tese de <strong style={{ fontWeight: 500, color: "var(--mid)" }}>equiparação hospitalar</strong> permite que médicos
            e clínicas reduzam o IRPJ de 32% para 8% sobre a receita bruta — de forma legal, reconhecida pelo STJ.
          </p>

          {/* Formulário CNPJ */}
          <form onSubmit={handleAnalisar} style={{ maxWidth: 460 }}>
            <label style={{
              display: "block", fontSize: 10, letterSpacing: "0.22em",
              color: "var(--muted)", textTransform: "uppercase", marginBottom: 8,
            }}>
              CNPJ da sua empresa
            </label>
            <input
              type="text"
              value={cnpj}
              onChange={e => setCnpj(formatarCNPJ(e.target.value))}
              placeholder="00.000.000/0001-00"
              className="bohac-input"
              style={{ fontSize: 20, textAlign: "center", letterSpacing: "0.1em", padding: "16px 20px" }}
              inputMode="numeric"
              maxLength={18}
              disabled={carregando}
            />
            {erro && <p style={{ fontSize: 12, color: "#b91c1c", marginTop: 8 }}>{erro}</p>}
            <button
              type="submit"
              disabled={carregando}
              className="btn-gold"
              style={{ width: "100%", textAlign: "center", marginTop: 10, padding: "16px 32px", fontSize: 12 }}
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

            {/* Trust bar */}
            <div style={{
              display: "flex", gap: "1.5rem", marginTop: "1rem",
              paddingTop: "1rem", borderTop: "1px solid var(--line)",
            }}>
              {[
                { icon: "🔒", texto: "Dados protegidos" },
                { icon: "⚡", texto: "Resultado em segundos" },
                { icon: "✓", texto: "100% gratuito" },
              ].map(({ icon, texto }) => (
                <span key={texto} style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 5 }}>
                  {icon} {texto}
                </span>
              ))}
            </div>
          </form>

          <div style={{ marginTop: "1.75rem" }}>
            <a href="/analise" style={{
              fontSize: 11, letterSpacing: "0.18em", fontWeight: 400, textTransform: "uppercase",
              color: "var(--mid)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
              borderBottom: "1px solid var(--line)", paddingBottom: 2,
            }}>
              Analisar pela descrição de serviços <span>→</span>
            </a>
          </div>
        </div>

        {/* coluna direita — stats */}
        <div style={{
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "5rem 3rem 5rem 4rem",
        }}>
          {[
            {
              num: "32→8%",
              detalhe: "de redução",
              label: "Base de cálculo do IRPJ",
              sub: "Da receita bruta, não do lucro",
            },
            {
              num: "5 anos",
              detalhe: "retroativos",
              label: "Impostos pagos a mais",
              sub: "Prazo para recuperação judicial",
            },
            {
              num: "Tema 217",
              detalhe: "STJ",
              label: "Jurisprudência consolidada",
              sub: "Superior Tribunal de Justiça",
            },
          ].map(({ num, detalhe, label, sub }, i) => (
            <div key={i}>
              {i > 0 && <div style={{ height: 1, background: "var(--line)", margin: "2rem 0" }} />}
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
                <span style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 44, fontWeight: 600,
                  color: "var(--gold)", lineHeight: 1,
                }}>
                  {num}
                </span>
                <span style={{
                  fontSize: 11, letterSpacing: "0.14em",
                  color: "var(--gold-dark)", textTransform: "uppercase", fontWeight: 500,
                }}>
                  {detalhe}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--dark)", letterSpacing: "0.04em", marginBottom: 3 }}>
                {label}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.06em" }}>
                {sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LEGAL BAR ── */}
      <div style={{
        background: "var(--dark)",
        padding: "1.25rem 3rem",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "3rem",
        flexWrap: "wrap",
      }}>
        {[
          "⚖️  Art. 15, §1°, III, \"a\" — Lei 9.249/95",
          "🏛️  STJ — Recurso Repetitivo Tema 217",
          "🏥  38 CNAEs elegíveis — Divisão 86 IBGE",
        ].map(item => (
          <span key={item} style={{ fontSize: 11, letterSpacing: "0.12em", color: "rgba(245,240,232,0.45)", fontWeight: 300 }}>
            {item}
          </span>
        ))}
      </div>

      {/* ── O QUE É A TESE ── */}
      <section id="sobre" style={{ padding: "6rem 3rem", borderBottom: "1px solid var(--line)" }}>
        <div className="section-tag-el">A tese tributária</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, marginBottom: "4rem", maxWidth: 560 }}>
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
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, color: "#F5F0E8", marginBottom: "4rem" }}>
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
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, color: "#fff", marginBottom: "0.5rem" }}>
            Verifique agora se sua clínica tem esse direito.
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: "rgba(255,255,255,0.75)", fontStyle: "italic" }}>
            A análise é gratuita e leva menos de 10 segundos.
          </div>
        </div>
        <a
          href="#"
          onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          style={{
            flexShrink: 0, padding: "16px 40px",
            border: "1px solid #fff", color: "#fff",
            fontFamily: "'Jost', sans-serif", fontSize: 11, letterSpacing: "0.2em", fontWeight: 500,
            textTransform: "uppercase", textDecoration: "none",
            transition: "all 0.25s", whiteSpace: "nowrap",
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
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, letterSpacing: "0.08em", color: "#F5F0E8" }}>
              BOHAC MED
            </div>
            <div style={{ fontSize: 9, letterSpacing: "0.22em", fontWeight: 300, color: "var(--gold-light)", textTransform: "uppercase", marginTop: 2 }}>
              Advogados Associados · Setor Médico
            </div>
            <div style={{ fontSize: 10, letterSpacing: "0.1em", color: "rgba(245,240,232,0.35)", marginTop: 8 }}>
              CNPJ: 39.293.156/0001-43 — Bohac Sociedade de Advogados
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
            {[
              { label: "Tel.", valor: "(18) 3222-6245" },
              { label: "Email", valor: "contato@bohacadvocacia.com.br" },
              { label: "Instagram", valor: "@bohac.advocacia" },
            ].map(({ label, valor }) => (
              <span key={valor} style={{ fontSize: 11, letterSpacing: "0.08em", color: "rgba(245,240,232,0.4)" }}>
                <span style={{ color: "rgba(245,240,232,0.25)", marginRight: 6 }}>{label}</span>{valor}
              </span>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(184,151,90,0.15)", paddingTop: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <p style={{ fontSize: 10, color: "rgba(245,240,232,0.25)", letterSpacing: "0.06em", lineHeight: 1.7 }}>
            © {new Date().getFullYear()} Bohac Sociedade de Advogados — CNPJ 39.293.156/0001-43. Bohac Med é um serviço de triagem automatizada com fins informativos. Não constitui parecer jurídico. OAB/SP. Todos os direitos reservados.
          </p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <a href="/privacidade" style={{ fontSize: 10, color: "rgba(245,240,232,0.35)", letterSpacing: "0.08em", textDecoration: "none" }}>
              Política de Privacidade
            </a>
            <a href="/termos" style={{ fontSize: 10, color: "rgba(245,240,232,0.35)", letterSpacing: "0.08em", textDecoration: "none" }}>
              Termos de Uso
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
