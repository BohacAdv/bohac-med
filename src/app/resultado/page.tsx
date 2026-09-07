"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ResultadoAnalise, NivelViabilidade } from "@/types";
import BrandMark from "@/components/BrandMark";

const WA_URL = "https://wa.me/5518996205555?text=Quero%20a%20an%C3%A1lise%20completa%20do%20meu%20CNPJ";
const WA_TEL = "(18) 99620-5555";

const CONFIG_NIVEL: Record<NivelViabilidade, {
  badge: string; bgCard: string; borderCard: string;
  color: string; emoji: string; titulo: string; printBorder: string;
}> = {
  ALTA:       { badge: "#16a34a", bgCard: "#f0fdf4", borderCard: "rgba(22,163,74,0.3)",  color: "#15803d", emoji: "✅", titulo: "Alta viabilidade",  printBorder: "#16a34a" },
  MEDIA:      { badge: "#d97706", bgCard: "#fffbeb", borderCard: "rgba(217,119,6,0.3)",  color: "#b45309", emoji: "⚠️", titulo: "Média viabilidade", printBorder: "#d97706" },
  BAIXA:      { badge: "#ea580c", bgCard: "#fff7ed", borderCard: "rgba(234,88,12,0.3)",  color: "#c2410c", emoji: "🔍", titulo: "Baixa viabilidade", printBorder: "#ea580c" },
  INELEGIVEL: { badge: "#dc2626", bgCard: "#fef2f2", borderCard: "rgba(220,38,38,0.3)",  color: "#b91c1c", emoji: "❌", titulo: "Não elegível",      printBorder: "#dc2626" },
};

function formatCNPJ(cnpj: string) {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}
function dataHoje() {
  return new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function ResultadoPage() {
  const router = useRouter();
  const [resultado, setResultado] = useState<ResultadoAnalise | null>(null);
  const [lead, setLead] = useState({ nome: "", email: "", telefone: "" });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erroLead, setErroLead] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("resultado");
    if (!raw) { router.replace("/"); return; }
    setResultado(JSON.parse(raw));
  }, [router]);

  if (!resultado) return null;

  const cfg = CONFIG_NIVEL[resultado.nivelViabilidade];
  const cnpjFormatado = formatCNPJ(resultado.cnpj);
  const hoje = dataHoje();

  async function enviarLead(e: React.FormEvent) {
    e.preventDefault();
    setErroLead("");
    if (!lead.nome || !lead.email || !lead.telefone) { setErroLead("Preencha todos os campos."); return; }
    setEnviando(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, cnpj: resultado?.cnpj, origem: "site", resultadoAnalise: resultado }),
      });
      if (!res.ok) throw new Error();
      setEnviado(true);
    } catch { setErroLead("Erro ao enviar. Tente novamente."); }
    finally { setEnviando(false); }
  }

  return (
    <main style={{ background: "var(--cream)", minHeight: "100vh", fontFamily: "'Jost', sans-serif", color: "var(--dark)" }}>

      {/* ══════════════════════════════════════════════════════
          CABEÇALHO PDF (visível apenas no print)
      ══════════════════════════════════════════════════════ */}
      <div className="pdf-header print-only" style={{ display: "none" }}>
        <div>
          <div className="pdf-header__brand">
            BOHAC <em>MED</em>
          </div>
          <div className="pdf-header__sub">Advogados Associados</div>
        </div>
        <div className="pdf-header__doc">
          Parecer de Elegibilidade<br />
          CNPJ: {cnpjFormatado}<br />
          <span className="pdf-header__date">{hoje}</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          NAV (oculto no print)
      ══════════════════════════════════════════════════════ */}
      <nav className="print-hide" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.5rem 3rem", borderBottom: "1px solid var(--line)", background: "var(--cream)",
      }}>
        <button
          onClick={() => router.push("/")}
          aria-label="Voltar para a página inicial"
          style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit" }}
        >
          <BrandMark size={30} />
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, letterSpacing: "0.08em" }}>
              BOHAC <span style={{ color: "var(--gold)" }}>MED</span>
            </span>
            <span style={{ fontSize: 9, letterSpacing: "0.22em", fontWeight: 300, color: "var(--muted)", textTransform: "uppercase" }}>Advogados Associados</span>
          </div>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button
            onClick={() => window.print()}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "9px 18px",
              background: "var(--dark)", color: "#F5F0E8",
              border: "none", cursor: "pointer",
              fontFamily: "'Jost', sans-serif",
              fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
              transition: "opacity .2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = ".8")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
            </svg>
            Salvar como PDF
          </button>
          <button onClick={() => router.push("/")} style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--muted)", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase" }}>
            ← Nova análise
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════
          CONTEÚDO DO PARECER
      ══════════════════════════════════════════════════════ */}
      <div className="print-content" style={{ maxWidth: 760, margin: "0 auto", padding: "4rem 2rem" }}>

        {/* Identificação */}
        <div className="print-no-break" style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "block", width: 20, height: 1, background: "var(--gold)" }} />
            Equiparação Hospitalar — Análise de Elegibilidade
          </div>
          <div style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>
            CNPJ analisado: <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, letterSpacing: "0.06em", color: "var(--mid)", textTransform: "none" }}>{cnpjFormatado}</span>
          </div>
          <div className="print-only" style={{ display: "none", fontSize: 10, color: "#9ca3af", marginTop: 4 }}>
            Data de emissão: {hoje} · Bohac Med — bohacmed.com.br
          </div>
        </div>

        {/* ── Resultado principal ── */}
        <div className="resultado-card print-no-break" style={{
          background: cfg.bgCard,
          border: `1px solid ${cfg.borderCard}`,
          borderTop: `4px solid ${cfg.badge}`,
          padding: "2.5rem",
          marginBottom: "2rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
            <span style={{ fontSize: 28 }}>{cfg.emoji}</span>
            <div>
              <span style={{ fontSize: 10, letterSpacing: "0.2em", fontWeight: 600, textTransform: "uppercase", background: cfg.badge, color: "#fff", padding: "3px 12px" }}>
                {cfg.titulo}
              </span>
              <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 12, letterSpacing: "0.1em" }}>
                {resultado.pontuacao}/100 pontos
              </span>
            </div>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, color: "var(--dark)", marginBottom: "1rem", lineHeight: 1.2 }}>
            {resultado.razaoSocial}
          </h1>
          <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.85, color: "var(--mid)", margin: 0 }}>
            {resultado.justificativa}
          </p>
        </div>

        {/* ── CNAEs Elegíveis ── */}
        {resultado.cnaesElegiveis.length > 0 && (
          <div className="print-section print-no-break" style={{ marginBottom: "1.5rem" }}>
            <div style={{ padding: "12px 20px", background: "rgba(22,163,74,0.06)", borderLeft: "3px solid #16a34a", marginBottom: 0 }}>
              <span style={{ fontSize: 10, letterSpacing: "0.2em", color: "#15803d", textTransform: "uppercase", fontWeight: 600 }}>
                Atividades compatíveis ({resultado.cnaesElegiveis.length})
              </span>
            </div>
            <table className="cnae-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, letterSpacing: "0.16em", color: "var(--muted)", textTransform: "uppercase", fontWeight: 500, background: "#fff" }}>Código CNAE</th>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, letterSpacing: "0.16em", color: "var(--muted)", textTransform: "uppercase", fontWeight: 500, background: "#fff" }}>Descrição da atividade</th>
                  <th style={{ padding: "10px 16px", textAlign: "center", fontSize: 10, letterSpacing: "0.1em", color: "var(--muted)", textTransform: "uppercase", fontWeight: 500, background: "#fff" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {resultado.cnaesElegiveis.map((c, i) => (
                  <tr key={c.codigo} className="cnae-row" style={{ background: i % 2 === 0 ? "#fff" : "rgba(240,253,244,0.5)", borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "10px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--gold)", fontWeight: 600 }}>{c.codigo}</td>
                    <td style={{ padding: "10px 16px", fontSize: 13, color: "var(--mid)", fontWeight: 300 }}>{c.descricao}</td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}>
                      <span style={{ fontSize: 11, color: "#15803d", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>✓ Elegível</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── CNAEs Não Elegíveis ── */}
        {resultado.cnaesNaoElegiveis.length > 0 && (
          <div className="print-section print-no-break" style={{ marginBottom: "2rem" }}>
            <div style={{ padding: "12px 20px", background: "rgba(12,36,56,0.03)", borderLeft: "3px solid var(--line)", marginBottom: 0 }}>
              <span style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--muted)", textTransform: "uppercase", fontWeight: 600 }}>
                Atividades não enquadradas ({resultado.cnaesNaoElegiveis.length})
              </span>
            </div>
            <table className="cnae-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {resultado.cnaesNaoElegiveis.map((c, i) => (
                  <tr key={c.codigo} className="cnae-row" style={{ background: i % 2 === 0 ? "#fff" : "rgba(12,36,56,0.02)", borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "9px 16px", fontFamily: "monospace", fontSize: 11, color: "var(--muted)", width: 120 }}>{c.codigo}</td>
                    <td style={{ padding: "9px 16px", fontSize: 12, color: "var(--muted)", fontWeight: 300 }}>{c.descricao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Próximos passos ── */}
        <div className="print-no-break" style={{ borderLeft: "3px solid var(--gold)", paddingLeft: "1.5rem", marginBottom: "3rem" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 600 }}>
            Próximos passos recomendados
          </div>
          <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.85, color: "var(--mid)", margin: 0 }}>
            {resultado.proximosPasosRecomendados}
          </p>
        </div>

        {/* ── CTA — visível na tela ── */}
        {resultado.nivelViabilidade !== "INELEGIVEL" && (
          <div className="print-hide" style={{ background: "var(--dark)", padding: "3rem", marginBottom: "2rem" }}>
            {!enviado ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "var(--gold-light)", textTransform: "uppercase", marginBottom: "1rem" }}>Próximo passo</div>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 300, color: "#F5F0E8", marginBottom: "1.25rem", lineHeight: 1.15 }}>
                    Quanto você pode <em style={{ fontStyle: "italic", color: "var(--gold-light)" }}>recuperar</em>?
                  </h2>
                  <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.85, color: "rgba(245,240,232,0.55)", marginBottom: "2rem" }}>
                    Nossa equipe faz a análise completa das suas notas fiscais e calcula o valor exato de impostos recuperáveis dos últimos 5 anos — sem custo antecipado.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {["Cálculo do valor exato a recuperar", "Análise das NF-e dos últimos 5 anos", "Sem honorários antecipados"].map(item => (
                      <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ color: "var(--gold-light)", fontSize: 14 }}>✓</span>
                        <span style={{ fontSize: 12, color: "rgba(245,240,232,0.6)", letterSpacing: "0.06em" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "0.14em", color: "rgba(245,240,232,0.4)", marginBottom: "1.25rem", textTransform: "uppercase" }}>
                    Solicitar análise completa
                  </div>
                  <form onSubmit={enviarLead} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[
                      { key: "nome", placeholder: "Dr. João da Silva", label: "Nome completo", type: "text" },
                      { key: "email", placeholder: "contato@clinica.com.br", label: "E-mail", type: "email" },
                      { key: "telefone", placeholder: "(18) 99999-9999", label: "WhatsApp", type: "tel" },
                    ].map(({ key, placeholder, label, type }) => (
                      <div key={key}>
                        <label style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", color: "rgba(245,240,232,0.4)", textTransform: "uppercase", marginBottom: 6 }}>{label}</label>
                        <input
                          type={type} placeholder={placeholder}
                          value={lead[key as keyof typeof lead]}
                          onChange={e => setLead(p => ({ ...p, [key]: e.target.value }))}
                          style={{ width: "100%", padding: "13px 16px", border: "1px solid rgba(184,151,90,0.35)", background: "rgba(255,255,255,0.04)", fontFamily: "'Jost', sans-serif", fontSize: 14, fontWeight: 300, color: "#F5F0E8", outline: "none", transition: "border-color 0.2s" }}
                          onFocus={e => { (e.target as HTMLElement).style.borderColor = "rgba(184,151,90,0.7)"; }}
                          onBlur={e => { (e.target as HTMLElement).style.borderColor = "rgba(184,151,90,0.35)"; }}
                        />
                      </div>
                    ))}
                    {erroLead && <p style={{ fontSize: 12, color: "#fca5a5" }}>{erroLead}</p>}
                    <button type="submit" disabled={enviando} className="btn-gold" style={{ marginTop: 4, padding: "15px 24px" }}>
                      {enviando ? "Enviando…" : "Quero minha análise completa →"}
                    </button>
                    <p style={{ fontSize: 10, color: "rgba(245,240,232,0.3)", letterSpacing: "0.06em" }}>
                      🔒 Seus dados são usados apenas para entrarmos em contato.
                    </p>
                  </form>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "3rem 0" }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 56, color: "var(--gold)", marginBottom: "1rem", lineHeight: 1 }}>✓</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color: "#F5F0E8", marginBottom: "0.75rem" }}>Solicitação recebida</h3>
                <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.85, color: "rgba(245,240,232,0.55)", maxWidth: 400, margin: "0 auto" }}>
                  Nossa equipe entrará em contato em até 1 dia útil pelo WhatsApp informado.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── CTA WhatsApp — visível APENAS no PDF ── */}
        <div className="print-only print-no-break" style={{ display: "none", background: "#f2e8e0", border: "1.5px solid #ae8167", padding: "20pt 24pt", marginBottom: "16pt" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#ae8167", fontWeight: 600, marginBottom: 6 }}>
            Próximo passo — Análise completa gratuita
          </div>
          <p style={{ fontSize: 11, fontWeight: 300, lineHeight: 1.7, color: "#374151", margin: "0 0 10pt" }}>
            Esta análise é baseada nos CNAEs cadastrados na Receita Federal. Para calcular o valor exato de impostos recuperáveis dos últimos 5 anos, nossa equipe realiza a análise completa das suas notas fiscais — sem honorários antecipados.
          </p>
          <div style={{ fontSize: 11, fontWeight: 600 }}>
            Entre em contato pelo WhatsApp:{" "}
            <a href={WA_URL} style={{ color: "#ae8167" }}>
              {WA_TEL}
            </a>
            {" "}ou acesse{" "}
            <a href="https://bohacmed.com.br" style={{ color: "#ae8167" }}>
              bohacmed.com.br
            </a>
          </div>
        </div>

        {/* ── Disclaimer ── */}
        <p className="print-disclaimer" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.04em", lineHeight: 1.7, marginTop: "2rem", textAlign: "center" }}>
          Esta análise tem caráter informativo e é baseada nos CNAEs cadastrados na Receita Federal. O enquadramento definitivo requer análise jurídica e documental completa. Bohac Med — um serviço da Bohac Advogados Associados.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════
          RODAPÉ PDF (visível apenas no print, posição fixa)
      ══════════════════════════════════════════════════════ */}
      <div className="pdf-footer print-only" style={{ display: "none" }}>
        <span>Bohac Med · bohacmed.com.br · {hoje}</span>
        <span>
          Fale conosco:{" "}
          <a href={WA_URL}>{WA_TEL} (WhatsApp)</a>
        </span>
      </div>

    </main>
  );
}
