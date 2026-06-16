"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ResultadoAnaliseNFe, ResultadoAnaliseNFeArquivos, NotaFiscalAnexo } from "@/types";
import BrandMark from "@/components/BrandMark";

const MAX_NOTAS = 5;
const EXTENSOES_ACEITAS = ".pdf,.jpg,.jpeg,.png,.xml";

type Modo = "descricao" | "arquivos";

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

export default function AnalisePage() {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>("descricao");

  // ── Modo descrição (texto colado) ───────────────────────────────
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

  const corNivel = resultado ? CORES_NIVEL[resultado.nivelViabilidade] : null;

  // ── Modo arquivos (upload de notas fiscais) ─────────────────────
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [erroArquivos, setErroArquivos] = useState("");
  const [carregandoArquivos, setCarregandoArquivos] = useState(false);
  const [resultadoArquivos, setResultadoArquivos] = useState<ResultadoAnaliseNFeArquivos | null>(null);
  const [arquivosSalvos, setArquivosSalvos] = useState<NotaFiscalAnexo[]>([]);
  const [analiseId, setAnaliseId] = useState<string>("");

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

  // ── Captura de lead (apenas no modo arquivos, quando enquadrado) ─
  const [lead, setLead] = useState({ nome: "", email: "", telefone: "" });
  const [enviandoLead, setEnviandoLead] = useState(false);
  const [leadEnviado, setLeadEnviado] = useState(false);
  const [erroLead, setErroLead] = useState("");

  async function enviarLead(e: React.FormEvent) {
    e.preventDefault();
    setErroLead("");
    if (!lead.nome || !lead.email || !lead.telefone) { setErroLead("Preencha todos os campos."); return; }
    setEnviandoLead(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lead,
          origem: "site",
          notasFiscais: arquivosSalvos,
          parecerNfe: resultadoArquivos,
        }),
      });
      if (!res.ok) throw new Error();
      setLeadEnviado(true);
    } catch { setErroLead("Erro ao enviar. Tente novamente."); }
    finally { setEnviandoLead(false); }
  }

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
          Análise dos seus<br /><em style={{ fontStyle: "italic" }}>serviços prestados</em>
        </h1>
        <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.85, color: "var(--muted)", marginBottom: "2rem", maxWidth: 560 }}>
          Cole a descrição dos serviços ou anexe diretamente suas notas fiscais — nossa IA identifica se os serviços se enquadram na tese de equiparação hospitalar.
        </p>

        {/* Alternador de modo */}
        <div style={{ display: "flex", gap: 0, marginBottom: "2.5rem", border: "1px solid var(--line)", width: "fit-content" }}>
          {[
            { id: "descricao" as Modo, label: "Colar descrição" },
            { id: "arquivos" as Modo, label: "Anexar notas fiscais" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setModo(id)}
              style={{
                padding: "10px 20px", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
                background: modo === id ? "var(--dark)" : "transparent",
                color: modo === id ? "#F5F0E8" : "var(--muted)",
                border: "none", cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Modo: colar descrição ──────────────────────────────── */}
        {modo === "descricao" && (
          <>
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
                    <Spinner /> Analisando com IA…
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
          </>
        )}

        {/* ── Modo: anexar notas fiscais ─────────────────────────── */}
        {modo === "arquivos" && (
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
                    cursor: "pointer", background: "rgba(184,151,90,0.04)", textAlign: "center",
                  }}
                >
                  <span style={{ fontSize: 24 }}>📎</span>
                  <span style={{ fontSize: 13, color: "var(--mid)", fontWeight: 300 }}>
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

                {arquivos.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
                    {arquivos.map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "var(--mid)", background: "#fff", border: "1px solid var(--line)", padding: "8px 12px" }}>
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
                  <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.85, color: "var(--mid)", whiteSpace: "pre-line" }}>
                    {resultadoArquivos.parecer}
                  </p>
                </div>

                {/* Detalhamento por nota */}
                {resultadoArquivos.notas.length > 0 && (
                  <div style={{ border: "1px solid var(--line)", marginBottom: "2rem" }}>
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--line)" }}>
                      <span style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--gold)", textTransform: "uppercase" }}>Detalhamento por nota ({resultadoArquivos.notas.length})</span>
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
                          <p style={{ fontSize: 12, color: "var(--mid)", fontWeight: 300, marginBottom: 4 }}>
                            Serviços: {n.servicosIdentificados.join(", ")}
                          </p>
                        )}
                        <p style={{ fontSize: 12, color: "var(--muted)", fontWeight: 300 }}>{n.observacoesRelevantes}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Captura de lead */}
                {resultadoArquivos.enquadradoGeral && (
                  <div style={{ background: "var(--dark)", padding: "3rem" }}>
                    {!leadEnviado ? (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" }}>
                        <div>
                          <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "var(--gold-light)", textTransform: "uppercase", marginBottom: "1rem" }}>Próximo passo</div>
                          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, color: "#F5F0E8", marginBottom: "1.25rem", lineHeight: 1.15 }}>
                            Quanto você pode <em style={{ fontStyle: "italic", color: "var(--gold-light)" }}>recuperar</em>?
                          </h2>
                          <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.85, color: "rgba(245,240,232,0.55)", marginBottom: "2rem" }}>
                            Nossa equipe analisa suas notas fiscais anexadas (analiseId: {analiseId.slice(0, 8)}) e calcula o valor exato de impostos recuperáveis dos últimos 5 anos — sem custo antecipado.
                          </p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {[
                              "Revisão jurídica das notas anexadas",
                              "Cálculo do valor exato a recuperar",
                              "Sem honorários antecipados",
                            ].map(item => (
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
                                  style={{
                                    width: "100%", padding: "13px 16px",
                                    border: "1px solid rgba(184,151,90,0.35)",
                                    background: "rgba(255,255,255,0.04)",
                                    fontFamily: "'Jost', sans-serif", fontSize: 14, fontWeight: 300,
                                    color: "#F5F0E8", outline: "none",
                                    transition: "border-color 0.2s",
                                  }}
                                  onFocus={e => { (e.target as HTMLElement).style.borderColor = "rgba(184,151,90,0.7)"; }}
                                  onBlur={e => { (e.target as HTMLElement).style.borderColor = "rgba(184,151,90,0.35)"; }}
                                />
                              </div>
                            ))}
                            {erroLead && <p style={{ fontSize: 12, color: "#fca5a5" }}>{erroLead}</p>}
                            <button type="submit" disabled={enviandoLead} className="btn-gold" style={{ marginTop: 4, padding: "15px 24px" }}>
                              {enviandoLead ? "Enviando…" : "Quero minha análise completa →"}
                            </button>
                            <p style={{ fontSize: 10, color: "rgba(245,240,232,0.3)", letterSpacing: "0.06em" }}>
                              🔒 Suas notas fiscais já enviadas serão vinculadas automaticamente ao seu cadastro.
                            </p>
                          </form>
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: "center", padding: "3rem 0" }}>
                        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 56, color: "var(--gold)", marginBottom: "1rem", lineHeight: 1 }}>✓</div>
                        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color: "#F5F0E8", marginBottom: "0.75rem" }}>Solicitação recebida</h3>
                        <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.85, color: "rgba(245,240,232,0.55)", maxWidth: 400, margin: "0 auto" }}>
                          Nossa equipe entrará em contato em até 1 dia útil pelo WhatsApp informado, já com suas notas fiscais em análise.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
