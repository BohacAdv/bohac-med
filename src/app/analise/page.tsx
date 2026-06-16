"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ResultadoAnaliseNFe } from "@/types";
import BrandMark from "@/components/BrandMark";

export default function AnalisePage() {
  const router = useRouter();
  const [descricao, setDescricao] = useState("");
  const [resultado, setResultado] = useState<ResultadoAnaliseNFe | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleAnalisar(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); setResultado(null);
    if (descricao.trim().length < 10) { setErro("Digite ao menos uma descrição de serviço."); return; }
    setCarregando(true);
    try {
      const res = await fetch("/api/analisar-nfe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro ?? "Erro na análise.");
      setResultado(data.resultado);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally { setCarregando(false); }
  }

  const corNivel = resultado
    ? resultado.nivelViabilidade === "ALTA"   ? { bg: "#f0fdf4", border: "rgba(22,163,74,0.3)",  badge: "#16a34a", titulo: "Alta viabilidade",   emoji: "✅" }
    : resultado.nivelViabilidade === "MEDIA"  ? { bg: "#fffbeb", border: "rgba(217,119,6,0.3)",  badge: "#d97706", titulo: "Média viabilidade",  emoji: "⚠️" }
    : resultado.nivelViabilidade === "BAIXA"  ? { bg: "#fff7ed", border: "rgba(234,88,12,0.3)",  badge: "#ea580c", titulo: "Baixa viabilidade",  emoji: "🔍" }
    : { bg: "#fef2f2", border: "rgba(220,38,38,0.3)", badge: "#dc2626", titulo: "Não enquadrado", emoji: "❌" }
    : null;

  return (
    <main style={{ background: "var(--cream)", minHeight: "100vh", fontFamily: "'Jost', sans-serif", color: "var(--dark)" }}>
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.5rem 3rem", borderBottom: "1px solid var(--line)", background: "var(--cream)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <BrandMark size={30} />
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, letterSpacing: "0.08em" }}>
              BOHAC <span style={{ color: "var(--gold)" }}>MED</span>
            </span>
            <span style={{ fontSize: 9, letterSpacing: "0.22em", fontWeight: 300, color: "var(--muted)", textTransform: "uppercase" }}>Advogados Associados</span>
          </div>
        </div>
        <button onClick={() => router.push("/")} style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--muted)", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase" }}>
          ← Voltar
        </button>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "4rem 2rem" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "1rem", display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--gold)" }} />
          Análise por serviços
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 300, marginBottom: "1rem" }}>
          Análise pela descrição<br /><em style={{ fontStyle: "italic" }}>dos seus serviços</em>
        </h1>
        <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.85, color: "var(--muted)", marginBottom: "3rem", maxWidth: 520 }}>
          Cole abaixo a descrição dos serviços das suas notas fiscais. Pode ser o texto exato que aparece na nota — nossa IA identifica se os serviços se enquadram na tese de equiparação hospitalar.
        </p>

        <form onSubmit={handleAnalisar} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
              Descrição dos serviços
            </label>
            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder={"Exemplos:\n• Realização de procedimento cirúrgico ambulatorial - colecistectomia laparoscópica\n• Serviços de diagnóstico por imagem - ultrassonografia abdominal total\n• Sessões de hemodiálise - 12 sessões mensais\n• Fisioterapia pós-operatória - 20 sessões"}
              rows={8}
              className="bohac-input"
              style={{ fontSize: 13, resize: "vertical" }}
              disabled={carregando}
            />
          </div>
          {erro && <p style={{ fontSize: 12, color: "#b91c1c" }}>{erro}</p>}
          <button
            type="submit"
            disabled={carregando || descricao.trim().length < 10}
            className="btn-gold"
            style={{ alignSelf: "flex-start" }}
          >
            {carregando ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg style={{ animation: "spin 1s linear infinite", width: 14, height: 14 }} viewBox="0 0 24 24" fill="none">
                  <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Analisando com IA…
              </span>
            ) : "Analisar serviços"}
          </button>
        </form>

        {resultado && corNivel && (
          <div style={{ marginTop: "3rem" }}>
            <div style={{ background: corNivel.bg, border: `1px solid ${corNivel.border}`, padding: "2rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
                <span style={{ fontSize: 24 }}>{corNivel.emoji}</span>
                <span style={{ fontSize: 10, letterSpacing: "0.2em", fontWeight: 500, textTransform: "uppercase", background: corNivel.badge, color: "#fff", padding: "3px 10px" }}>
                  {corNivel.titulo}
                </span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.85, color: "var(--mid)", marginBottom: "1.25rem" }}>
                {resultado.justificativa}
              </p>
              {resultado.servicosIdentificados.length > 0 && (
                <div style={{ borderTop: "1px solid var(--line)", paddingTop: "1rem" }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Serviços identificados</div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                    {resultado.servicosIdentificados.map((s, i) => (
                      <li key={i} style={{ fontSize: 13, color: "var(--mid)", fontWeight: 300, display: "flex", gap: 8 }}>
                        <span style={{ color: "var(--gold)" }}>—</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {resultado.enquadrado && (
              <div style={{ background: "var(--dark)", padding: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem" }}>
                <div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: "#F5F0E8" }}>
                    Quer uma análise completa do seu CNPJ?
                  </p>
                  <p style={{ fontSize: 12, fontWeight: 300, color: "rgba(245,240,232,0.5)", marginTop: 6 }}>
                    Calculamos o valor exato de impostos recuperáveis dos últimos 5 anos.
                  </p>
                </div>
                <button onClick={() => router.push("/")} className="btn-outline-gold" style={{ borderColor: "rgba(184,151,90,0.5)", color: "var(--gold-light)", whiteSpace: "nowrap" }}>
                  Analisar CNPJ →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
