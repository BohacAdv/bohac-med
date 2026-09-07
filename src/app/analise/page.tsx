"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  ResultadoAnalise,
  ResultadoAnaliseNFeArquivos,
  NotaFiscalAnexo,
} from "@/types";
import Parecer from "@/components/Parecer";
import CapturaLead from "@/components/CapturaLead";
import { ENCERRAMENTO_PARECER } from "@/components/Parecer";

const MAX_NOTAS = 5;
const EXTENSOES_ACEITAS = ".pdf,.jpg,.jpeg,.png,.xml";

type Modo = "cnpj" | "cartao-cnpj" | "notas-fiscais";

/* ── Helpers ── */
function maskCNPJ(v: string) {
  return v.replace(/\D/g, "").slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}
function validCNPJ(c: string) {
  const n = c.replace(/\D/g, "");
  if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false;
  const calc = (s: string, w: number[]) =>
    w.reduce((a, b, i) => a + parseInt(s[i]) * b, 0);
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = calc(n, w1) % 11; const r1 = d1 < 2 ? 0 : 11 - d1;
  const d2 = calc(n, w2) % 11; const r2 = d2 < 2 ? 0 : 11 - d2;
  return r1 === parseInt(n[12]) && r2 === parseInt(n[13]);
}

/* Mantido apenas para a modalidade de notas fiscais, cujo nível vem da IA. */
const CORES_NIVEL: Record<string, { bg: string; border: string; badge: string; titulo: string; emoji: string }> = {
  ALTA:       { bg: "#f0fdf4", border: "rgba(22,163,74,0.3)",  badge: "#16a34a", titulo: "Alta viabilidade",   emoji: "✅" },
  MEDIA:      { bg: "#fffbeb", border: "rgba(217,119,6,0.3)",  badge: "#d97706", titulo: "Média viabilidade",  emoji: "⚠️" },
  BAIXA:      { bg: "#fff7ed", border: "rgba(234,88,12,0.3)",  badge: "#ea580c", titulo: "Baixa viabilidade",  emoji: "🔍" },
  INELEGIVEL: { bg: "#fef2f2", border: "rgba(220,38,38,0.3)",  badge: "#dc2626", titulo: "Não enquadrado",     emoji: "❌" },
};

function Spinner() {
  return (
    <svg style={{ animation: "spin 1s linear infinite", width: 14, height: 14 }} viewBox="0 0 24 24" fill="none">
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

/* ── Bloco de parecer + captura + PDF (modalidades CNPJ e Cartão) ── */
function BlocoParecer({
  resultado,
  onCTA,
}: {
  resultado: ResultadoAnalise;
  onCTA: () => void;
}) {
  const [liberado, setLiberado] = useState(false);

  return (
    <div style={{ marginTop: "2.5rem" }}>
      <Parecer r={resultado} />

      {liberado ? (
        <div className="parecer__acoes print-hide">
          <button type="button" className="btn btn--gold" onClick={() => window.print()}>
            Baixar parecer em PDF
          </button>
          {resultado.nivel !== "NAO_COMPORTA" && (
            <button type="button" className="btn btn--ghost" onClick={onCTA}>
              Aprofundar com as notas fiscais
            </button>
          )}
        </div>
      ) : (
        <CapturaLead
          payloadExtra={{ cnpj: resultado.cnpj, resultadoAnalise: resultado }}
          aoConcluir={() => setLiberado(true)}
        />
      )}
    </div>
  );
}

/* ── Componente principal ── */
function AnaliseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modo, setModo] = useState<Modo>(() => {
    const tab = searchParams.get("tab");
    if (tab === "notas-fiscais") return "notas-fiscais";
    if (tab === "cartao-cnpj")  return "cartao-cnpj";
    return "cnpj";
  });

  // Sync tab with URL param on navigation
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "notas-fiscais") setModo("notas-fiscais");
    else if (tab === "cartao-cnpj")  setModo("cartao-cnpj");
  }, [searchParams]);

  // ── Estado: CNPJ ────────────────────────────────────────────────
  const [cnpj, setCnpj]                   = useState("");
  const [erroCnpj, setErroCnpj]           = useState("");
  const [carregandoCnpj, setCarregandoCnpj] = useState(false);
  const [resultadoCnpj, setResultadoCnpj] = useState<ResultadoAnalise | null>(null);

  const consultarCnpj = useCallback(async (valor: string) => {
    setErroCnpj(""); setResultadoCnpj(null);
    if (!validCNPJ(valor)) { setErroCnpj("CNPJ inválido. Verifique e tente novamente."); return; }
    setCarregandoCnpj(true);
    try {
      const res = await fetch("/api/analisar-cnpj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cnpj: valor.replace(/\D/g, "") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro ?? "Erro na análise.");
      setResultadoCnpj(data.resultado);
    } catch (err: unknown) {
      setErroCnpj(err instanceof Error ? err.message : "Erro inesperado.");
    } finally { setCarregandoCnpj(false); }
  }, []);

  function handleAnalisarCnpj(e: React.FormEvent) {
    e.preventDefault();
    void consultarCnpj(cnpj);
  }

  /* Entrada vinda da home: /analise?cnpj=XXXXXXXXXXXXXX dispara a consulta
     automaticamente. Antes a home mandava para /resultado?cnpj=, rota que
     lia sessionStorage — chave que ninguém escrevia — e devolvia para "/". */
  const [autoRodou, setAutoRodou] = useState(false);
  useEffect(() => {
    if (autoRodou) return;
    const param = searchParams.get("cnpj");
    if (!param) return;
    const limpo = param.replace(/\D/g, "");
    if (limpo.length !== 14) return;
    setAutoRodou(true);
    setCnpj(maskCNPJ(limpo));
    void consultarCnpj(limpo);
  }, [searchParams, autoRodou, consultarCnpj]);

  // ── Estado: Cartão CNPJ ─────────────────────────────────────────
  const [arquivoCartao, setArquivoCartao]         = useState<File | null>(null);
  const [erroCartao, setErroCartao]               = useState("");
  const [carregandoCartao, setCarregandoCartao]   = useState(false);
  const [resultadoCartao, setResultadoCartao]     = useState<ResultadoAnalise | null>(null);

  async function handleAnalisarCartao(e: React.FormEvent) {
    e.preventDefault();
    setErroCartao(""); setResultadoCartao(null);
    if (!arquivoCartao) { setErroCartao("Anexe o arquivo do Cartão CNPJ."); return; }
    setCarregandoCartao(true);
    try {
      const form = new FormData();
      form.append("cartao", arquivoCartao);
      const res = await fetch("/api/analisar-cartao-cnpj", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro ?? "Erro na análise.");
      setResultadoCartao(data.resultado);
    } catch (err: unknown) {
      setErroCartao(err instanceof Error ? err.message : "Erro inesperado.");
    } finally { setCarregandoCartao(false); }
  }

  // ── Estado: Notas Fiscais ───────────────────────────────────────
  const [arquivos, setArquivos]                       = useState<File[]>([]);
  const [erroArquivos, setErroArquivos]               = useState("");
  const [carregandoArquivos, setCarregandoArquivos]   = useState(false);
  const [resultadoArquivos, setResultadoArquivos]     = useState<ResultadoAnaliseNFeArquivos | null>(null);
  const [arquivosSalvos, setArquivosSalvos]           = useState<NotaFiscalAnexo[]>([]);
  const [analiseId, setAnaliseId]                     = useState<string>("");
  const [leadNfEnviado, setLeadNfEnviado]             = useState(false);

  function handleSelecionarArquivos(e: React.ChangeEvent<HTMLInputElement>) {
    const selecionados = Array.from(e.target.files ?? []);
    setErroArquivos("");
    if (selecionados.length > MAX_NOTAS) {
      setErroArquivos(`Selecione no máximo ${MAX_NOTAS} notas fiscais por envio.`);
      setArquivos(selecionados.slice(0, MAX_NOTAS));
      return;
    }
    setArquivos(selecionados);
  }

  function removerArquivo(idx: number) {
    setArquivos(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleAnalisarArquivos(e: React.FormEvent) {
    e.preventDefault();
    setErroArquivos(""); setResultadoArquivos(null);
    if (arquivos.length === 0) { setErroArquivos("Anexe ao menos uma nota fiscal."); return; }
    if (arquivos.length > MAX_NOTAS) { setErroArquivos(`Envie no máximo ${MAX_NOTAS} notas fiscais por vez.`); return; }
    setCarregandoArquivos(true);
    try {
      const id = crypto.randomUUID();
      const formData = new FormData();
      formData.append("analiseId", id);
      arquivos.forEach(f => formData.append("notas", f));
      const res = await fetch("/api/analisar-nfe-arquivos", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro ?? "Erro na análise.");
      setResultadoArquivos(data.resultado);
      setArquivosSalvos(data.arquivos ?? []);
      setAnaliseId(data.analiseId ?? id);
    } catch (err: unknown) {
      setErroArquivos(err instanceof Error ? err.message : "Erro inesperado.");
    } finally { setCarregandoArquivos(false); }
  }

  const corNivelArquivos = resultadoArquivos ? CORES_NIVEL[resultadoArquivos.nivelViabilidadeGeral] : null;

  /* ── TABS CONFIG ── */
  const TABS: { id: Modo; label: string; descricao: string }[] = [
    { id: "cnpj",        label: "Digitar CNPJ",   descricao: "Consulta automática na Receita Federal" },
    { id: "cartao-cnpj", label: "Cartão CNPJ",    descricao: "Upload do comprovante emitido pela RFB" },
    { id: "notas-fiscais", label: "Notas Fiscais", descricao: "Análise baseada nos serviços prestados" },
  ];

  const tabDescricao = TABS.find(t => t.id === modo)?.descricao ?? "";

  return (
    <main style={{ background: "var(--cream)", minHeight: "100vh", fontFamily: "'Jost', sans-serif", color: "var(--dark)" }}>

      {/* Nav */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "150px 2rem 4rem" }}>

        {/* Cabeçalho — chrome da página, fora do parecer impresso */}
        <div className="print-hide">
        <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "1rem", display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--gold)" }} />
          Verificação de elegibilidade
        </div>
        <h1 style={{ fontFamily: "var(--sans)", fontSize: 38, fontWeight: 300, marginBottom: "1rem" }}>
          Analise sua clínica em<br /><em style={{ fontStyle: "italic" }}>três formas diferentes</em>
        </h1>
        <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.85, color: "var(--muted)", marginBottom: "2.5rem", maxWidth: 560 }}>
          Escolha a forma mais prática: informe o CNPJ, envie o Cartão CNPJ ou anexe notas fiscais — cada via gera um parecer personalizado sobre a tese de equiparação hospitalar.
        </p>

        {/* ── Tab switcher ── */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, border: "1px solid var(--line)" }}>
            {TABS.map(({ id, label }, idx) => (
              <button
                key={id}
                onClick={() => setModo(id)}
                style={{
                  padding: "14px 12px",
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  background: modo === id ? "var(--dark)" : "transparent",
                  color: modo === id ? "#F5F0E8" : "var(--muted)",
                  border: "none",
                  borderLeft: idx > 0 ? "1px solid var(--line)" : "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: modo === id ? 500 : 300,
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 10, letterSpacing: "0.06em" }}>
            {tabDescricao}
          </p>
        </div>

        </div>

        {/* ══════════════════════════════════════════════
            TAB 1 — CNPJ
        ══════════════════════════════════════════════ */}
        {modo === "cnpj" && (
          <>
            <form onSubmit={handleAnalisarCnpj} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
                  CNPJ da empresa
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={e => { setCnpj(maskCNPJ(e.target.value)); setErroCnpj(""); }}
                  maxLength={18}
                  autoComplete="off"
                  className="bohac-input"
                  style={{ fontSize: 16, letterSpacing: "0.05em" }}
                  disabled={carregandoCnpj}
                />
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6, fontWeight: 300 }}>
                  Consultamos os CNAEs diretamente na base da Receita Federal.
                </p>
              </div>
              {erroCnpj && <p style={{ fontSize: 12, color: "#b91c1c" }}>{erroCnpj}</p>}
              <button
                type="submit"
                disabled={carregandoCnpj || !validCNPJ(cnpj)}
                className="btn-gold"
                style={{ alignSelf: "flex-start" }}
              >
                {carregandoCnpj ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Spinner /> Consultando Receita Federal…
                  </span>
                ) : "Verificar elegibilidade"}
              </button>
            </form>

            {resultadoCnpj && (
              <BlocoParecer
                resultado={resultadoCnpj}
                onCTA={() => setModo("notas-fiscais")}
              />
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════
            TAB 2 — CARTÃO CNPJ
        ══════════════════════════════════════════════ */}
        {modo === "cartao-cnpj" && (
          <>
            <form onSubmit={handleAnalisarCartao} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
                  Cartão CNPJ (PDF, JPG ou PNG)
                </label>
                <label
                  htmlFor="input-cartao"
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: 10, padding: "2.5rem 1.5rem", border: "1.5px dashed var(--line)",
                    cursor: "pointer", background: "rgba(174,129,103,0.04)", textAlign: "center",
                  }}
                >
                  {arquivoCartao ? (
                    <>
                      <span style={{ fontSize: 28 }}>📄</span>
                      <span style={{ fontSize: 13, color: "var(--dark)", fontWeight: 500 }}>{arquivoCartao.name}</span>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>Clique para trocar o arquivo</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 28 }}>🪪</span>
                      <span style={{ fontSize: 13, color: "var(--navy-500)", fontWeight: 300 }}>
                        Clique para selecionar o Cartão CNPJ
                      </span>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>PDF, JPG ou PNG — máx. 8MB</span>
                    </>
                  )}
                  <input
                    id="input-cartao"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => { setArquivoCartao(e.target.files?.[0] ?? null); setErroCartao(""); }}
                    disabled={carregandoCartao}
                    style={{ display: "none" }}
                  />
                </label>
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8, fontWeight: 300 }}>
                  Nossa IA extrai automaticamente o CNPJ e os CNAEs registrados no cartão, sem que você precise digitar nada.
                </p>
              </div>
              {erroCartao && <p style={{ fontSize: 12, color: "#b91c1c" }}>{erroCartao}</p>}
              <button
                type="submit"
                disabled={carregandoCartao || !arquivoCartao}
                className="btn-gold"
                style={{ alignSelf: "flex-start" }}
              >
                {carregandoCartao ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Spinner /> Lendo Cartão CNPJ com IA…
                  </span>
                ) : "Analisar Cartão CNPJ"}
              </button>
            </form>

            {resultadoCartao && (
              <BlocoParecer
                resultado={resultadoCartao}
                onCTA={() => setModo("notas-fiscais")}
              />
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════
            TAB 3 — NOTAS FISCAIS
        ══════════════════════════════════════════════ */}
        {modo === "notas-fiscais" && (
          <>
            <form onSubmit={handleAnalisarArquivos} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
                  Notas fiscais (até {MAX_NOTAS} arquivos — PDF, imagem ou XML)
                </label>
                <label
                  htmlFor="input-notas"
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: 8, padding: "2.5rem 1.5rem", border: "1.5px dashed var(--line)",
                    cursor: "pointer", background: "rgba(174,129,103,0.04)", textAlign: "center",
                  }}
                >
                  <span style={{ fontSize: 24 }}>📎</span>
                  <span style={{ fontSize: 13, color: "var(--navy-500)", fontWeight: 300 }}>
                    Clique para selecionar até {MAX_NOTAS} arquivos
                  </span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>PDF, JPG, PNG ou XML — máx. 8MB cada</span>
                  <input
                    id="input-notas"
                    type="file"
                    multiple
                    accept={EXTENSOES_ACEITAS}
                    onChange={handleSelecionarArquivos}
                    disabled={carregandoArquivos}
                    style={{ display: "none" }}
                  />
                </label>
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8, fontWeight: 300 }}>
                  A análise é focada na descrição dos serviços das notas — não apenas nos CNAEs cadastrados.
                </p>

                {arquivos.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
                    {arquivos.map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "var(--navy-500)", background: "#fff", border: "1px solid var(--line)", padding: "8px 12px" }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                        <button type="button" onClick={() => removerArquivo(i)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 14, marginLeft: 10 }}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {erroArquivos && <p style={{ fontSize: 12, color: "#b91c1c" }}>{erroArquivos}</p>}

              <button
                type="submit"
                disabled={carregandoArquivos || arquivos.length === 0}
                className="btn-gold"
                style={{ alignSelf: "flex-start" }}
              >
                {carregandoArquivos ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Spinner /> Lendo notas fiscais com IA…
                  </span>
                ) : "Analisar notas fiscais"}
              </button>
            </form>

            {resultadoArquivos && corNivelArquivos && (
              <div style={{ marginTop: "3rem" }}>
                <div style={{ background: corNivelArquivos.bg, border: `1px solid ${corNivelArquivos.border}`, padding: "2rem", marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
                    <span style={{ fontSize: 24 }}>{corNivelArquivos.emoji}</span>
                    <span style={{ fontSize: 10, letterSpacing: "0.2em", fontWeight: 500, textTransform: "uppercase", background: corNivelArquivos.badge, color: "#fff", padding: "3px 10px" }}>
                      {corNivelArquivos.titulo}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.85, color: "var(--navy-500)", whiteSpace: "pre-line" }}>
                    {resultadoArquivos.parecer}
                  </p>
                </div>

                {resultadoArquivos.notas.length > 0 && (
                  <div style={{ border: "1px solid var(--line)", marginBottom: "2rem" }}>
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--line)" }}>
                      <span style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--gold)", textTransform: "uppercase" }}>
                        Detalhamento por nota ({resultadoArquivos.notas.length})
                      </span>
                    </div>
                    {resultadoArquivos.notas.map((n, i) => (
                      <div key={i} style={{ padding: "1.25rem 1.5rem", borderBottom: i < resultadoArquivos.notas.length - 1 ? "1px solid var(--line)" : "none", background: "#fff" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--dark)" }}>{n.nomeArquivo}</span>
                          <span style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: n.enquadrado ? "#15803d" : "var(--muted)" }}>
                            {n.enquadrado ? "✓ Enquadrado" : "Não enquadrado"}
                          </span>
                        </div>
                        {n.servicosIdentificados.length > 0 && (
                          <p style={{ fontSize: 12, color: "var(--navy-500)", fontWeight: 300, marginBottom: 4 }}>
                            Serviços: {n.servicosIdentificados.join(", ")}
                          </p>
                        )}
                        <p style={{ fontSize: 12, color: "var(--muted)", fontWeight: 300 }}>{n.observacoesRelevantes}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Encerramento fixo — igual às demais modalidades. A análise
                    concreta é o que eleva a precisão, e isso precisa estar dito. */}
                <section className="parecer__encerra print-no-break" style={{ marginTop: "2rem" }}>
                  <h3>{ENCERRAMENTO_PARECER.titulo}</h3>
                  <p>
                    A descrição de serviço em nota fiscal é indício da atividade prestada, não
                    prova do enquadramento. A tese exige ainda organização sob a forma de
                    sociedade empresária e atendimento às normas da ANVISA, requisitos que estes
                    documentos não demonstram.
                  </p>
                  <p className="parecer__encerra-destaque">{ENCERRAMENTO_PARECER.destaque}</p>
                </section>

                <p className="print-disclaimer">
                  Documento de caráter informativo, nos termos do Provimento 205/2021 do Conselho
                  Federal da OAB. Não constitui parecer jurídico definitivo nem oferta de serviços
                  em relação a caso concreto.
                </p>

                {leadNfEnviado ? (
                  <div className="parecer__acoes print-hide">
                    <button type="button" className="btn btn--gold" onClick={() => window.print()}>
                      Baixar parecer em PDF
                    </button>
                  </div>
                ) : (
                  <CapturaLead
                    payloadExtra={{ notasFiscais: arquivosSalvos, parecerNfe: resultadoArquivos }}
                    aoConcluir={() => setLeadNfEnviado(true)}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function AnalisePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--cream)" }} />}>
      <AnaliseContent />
    </Suspense>
  );
}
