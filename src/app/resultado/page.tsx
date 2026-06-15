"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ResultadoAnalise, NivelViabilidade } from "@/types";

const CONFIG_NIVEL: Record<NivelViabilidade, {
  badge: string; bgCard: string; borderCard: string;
  emoji: string; titulo: string;
}> = {
  ALTA:       { badge: "#16a34a", bgCard: "#f0fdf4", borderCard: "rgba(22,163,74,0.3)",  emoji: "✅", titulo: "Alta viabilidade"   },
  MEDIA:      { badge: "#d97706", bgCard: "#fffbeb", borderCard: "rgba(217,119,6,0.3)",  emoji: "⚠️", titulo: "Média viabilidade"  },
  BAIXA:      { badge: "#ea580c", bgCard: "#fff7ed", borderCard: "rgba(234,88,12,0.3)",  emoji: "🔍", titulo: "Baixa viabilidade"  },
  INELEGIVEL: { badge: "#dc2626", bgCard: "#fef2f2", borderCard: "rgba(220,38,38,0.3)",  emoji: "❌", titulo: "Não elegível"       },
};

export default function ResultadoPage() {
  const router = useRouter();
  const [resultado, setResultado] = useState<ResultadoAnalise | null>(null);
  const [mostrarLead, setMostrarLead] = useState(false);
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
  const cnpjFormatado = resultado.cnpj
    .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");

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
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.5rem 3rem", borderBottom: "1px solid var(--line)", background: "var(--cream)",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, letterSpacing: "0.08em" }}>
            BOHAC <span style={{ color: "var(--gold)" }}>MED</span>
          </span>
          <span style={{ fontSize: 9, letterSpacing: "0.22em", fontWeight: 300, color: "var(--muted)", textTransform: "uppercase" }}>Advogados Associados</span>
        </div>
        <button onClick={() => router.push("/")} style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--muted)", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase" }}>
          ← Nova análise
        </button>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "4rem 2rem" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "3rem" }}>
          CNPJ analisado: <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, letterSpacing: "0.08em", color: "var(--mid)" }}>{cnpjFormatado}</span>
        </div>

        {/* Resultado principal */}
        <div style={{ background: cfg.bgCard, border: `1px solid ${cfg.borderCard}`, padding: "2.5rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
            <span style={{ fontSize: 28 }}>{cfg.emoji}</span>
            <div>
              <span style={{ fontSize: 10, letterSpacing: "0.2em", fontWeight: 500, textTransform: "uppercase", background: cfg.badge, color: "#fff", padding: "3px 10px" }}>
                {cfg.titulo}
              </span>
              <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 12, letterSpacing: "0.1em" }}>{resultado.pontuacao}/100 pontos</span>
            </div>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, color: "var(--dark)", marginBottom: "1rem" }}>
            {resultado.razaoSocial}
          </h1>
          <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.85, color: "var(--mid)" }}>{resultado.justificativa}</p>
        </div>

        {/* CNAEs elegíveis */}
        {resultado.cnaesElegiveis.length > 0 && (
          <div style={{ border: "1px solid var(--line)", marginBottom: "1.5px" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--gold)", textTransform: "uppercase" }}>Atividades compatíveis</span>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>({resultado.cnaesElegiveis.length})</span>
            </div>
            {resultado.cnaesElegiveis.map((c, i) => (
              <div key={c.codigo} style={{ padding: "1.25rem 1.5rem", borderBottom: i < resultado.cnaesElegiveis.length - 1 ? "1px solid var(--line)" : "none", background: "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--gold)", fontWeight: 600 }}>{c.codigo}</span>
                  <span style={{ fontSize: 12, color: "#15803d", letterSpacing: "0.1em", textTransform: "uppercase" }}>✓ Elegível</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--mid)", fontWeight: 300 }}>{c.descricao}</p>
              </div>
            ))}
          </div>
        )}

        {/* CNAEs não elegíveis */}
        {resultado.cnaesNaoElegiveis.length > 0 && (
          <div style={{ border: "1px solid var(--line)", marginBottom: "2rem" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--line)" }}>
              <span style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--muted)", textTransform: "uppercase" }}>Atividades não enquadradas ({resultado.cnaesNaoElegiveis.length})</span>
            </div>
            {resultado.cnaesNaoElegiveis.map((c, i) => (
              <div key={c.codigo} style={{ padding: "1rem 1.5rem", borderBottom: i < resultado.cnaesNaoElegiveis.length - 1 ? "1px solid var(--line)" : "none" }}>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--muted)" }}>{c.codigo} </span>
                <p style={{ fontSize: 13, color: "var(--muted)", fontWeight: 300 }}>{c.descricao}</p>
              </div>
            ))}
          </div>
        )}

        {/* Próximos passos */}
        <div style={{ borderLeft: "2px solid var(--gold)", paddingLeft: "1.5rem", marginBottom: "3rem" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "0.75rem" }}>Próximos passos</div>
          <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.85, color: "var(--mid)" }}>{resultado.proximosPasosRecomendados}</p>
        </div>

        {/* CTA */}
        {resultado.nivelViabilidade !== "INELEGIVEL" && (
          <div style={{ background: "var(--dark)", padding: "3rem" }}>
            {!enviado ? (
              <>
                <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "var(--gold-light)", textTransform: "uppercase", marginBottom: "1rem" }}>Próximo passo</div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 300, color: "#F5F0E8", marginBottom: "1rem" }}>
                  Quanto você pode <em style={{ fontStyle: "italic", color: "var(--gold-light)" }}>recuperar</em>?
                </h2>
                <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.85, color: "rgba(245,240,232,0.55)", marginBottom: "2rem" }}>
                  Nossa equipe faz a análise completa das suas notas fiscais e calcula o valor exato de impostos recuperáveis dos últimos 5 anos — sem custo antecipado para você.
                </p>
                {!mostrarLead ? (
                  <button onClick={() => setMostrarLead(true)} className="btn-gold">
                    Solicitar análise completa →
                  </button>
                ) : (
                  <form onSubmit={enviarLead} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 460 }}>
                    {[
                      { key: "nome", placeholder: "Dr. João da Silva", label: "Nome completo", type: "text" },
                      { key: "email", placeholder: "contato@clinica.com.br", label: "E-mail", type: "email" },
                      { key: "telefone", placeholder: "(18) 99999-9999", label: "WhatsApp", type: "tel" },
                    ].map(({ key, placeholder, label, type }) => (
                      <div key={key}>
                        <label style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", color: "rgba(245,240,232,0.45)", textTransform: "uppercase", marginBottom: 6 }}>{label}</label>
                        <input
                          type={type} placeholder={placeholder}
                          value={lead[key as keyof typeof lead]}
                          onChange={e => setLead(p => ({ ...p, [key]: e.target.value }))}
                          style={{ width: "100%", padding: "12px 16px", border: "1px solid rgba(184,151,90,0.4)", background: "rgba(255,255,255,0.05)", fontFamily: "'Jost', sans-serif", fontSize: 14, fontWeight: 300, color: "#F5F0E8", outline: "none" }}
                        />
                      </div>
                    ))}
                    {erroLead && <p style={{ fontSize: 12, color: "#fca5a5" }}>{erroLead}</p>}
                    <button type="submit" disabled={enviando} className="btn-gold" style={{ marginTop: 8 }}>
                      {enviando ? "Enviando…" : "Quero minha análise completa →"}
                    </button>
                  </form>
                )}
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, color: "var(--gold)", marginBottom: "1rem" }}>✓</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 300, color: "#F5F0E8", marginBottom: "0.75rem" }}>Solicitação recebida</h3>
                <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.85, color: "rgba(245,240,232,0.55)" }}>
                  Nossa equipe entrará em contato em até 1 dia útil pelo WhatsApp informado. Separe suas notas fiscais dos últimos 5 anos para agilizar a análise.
                </p>
              </div>
            )}
          </div>
        )}

        <p style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.06em", lineHeight: 1.7, marginTop: "2rem", textAlign: "center" }}>
          Esta análise é baseada nos CNAEs cadastrados na Receita Federal e tem caráter informativo. O enquadramento definitivo depende de análise jurídica e documental completa. Bohac Med — um serviço da Bohac Advogados Associados.
        </p>
      </div>
    </main>
  );
}
