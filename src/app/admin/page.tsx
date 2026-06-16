"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase (client-side, apenas leitura pública pelo anon key) ─────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Tipos ────────────────────────────────────────────────────────────────────
type NivelViabilidade = "ALTA" | "MEDIA" | "BAIXA" | "INELEGIVEL";

const FASES_CONTRATUAIS = [
  "Primeiro contato",
  "Proposta enviada",
  "Em negociação",
  "Contrato assinado",
  "Documentação em coleta",
  "Processo ajuizado",
  "Acordo/Encerrado",
  "Sem interesse",
] as const;

type FaseContratual = (typeof FASES_CONTRATUAIS)[number];

interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cnpj: string | null;
  origem: string;
  resultado_analise: {
    nivelViabilidade: NivelViabilidade;
    razaoSocial: string;
    pontuacao: number;
    justificativa: string;
  } | null;
  criado_em: string;
  tratamentos?: Tratamento[];
}

type TipoTratamento = "fase" | "comentario";

interface Tratamento {
  id: string;
  lead_id: string;
  tipo: TipoTratamento;
  fase: FaseContratual | null;
  anotacao: string;
  criado_em: string;
  criado_por: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const COR_NIVEL: Record<NivelViabilidade, string> = {
  ALTA: "bg-green-100 text-green-800",
  MEDIA: "bg-yellow-100 text-yellow-800",
  BAIXA: "bg-orange-100 text-orange-800",
  INELEGIVEL: "bg-red-100 text-red-800",
};

function formatarData(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarCNPJ(cnpj: string) {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

// Retorna a fase contratual vigente do lead, considerando apenas
// os registros do tipo "fase" (ignora comentários internos).
function obterFaseAtual(lead: Lead): FaseContratual | null {
  const registrosDeFase = (lead.tratamentos ?? []).filter(
    (t) => t.tipo === "fase" && t.fase
  );
  return registrosDeFase.at(-1)?.fase ?? null;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function AdminPage() {
  const [senha, setSenha] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadSelecionado, setLeadSelecionado] = useState<Lead | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [filtroNivel, setFiltroNivel] = useState<NivelViabilidade | "TODOS">("TODOS");
  const [filtroFase, setFiltroFase] = useState<FaseContratual | "TODAS">("TODAS");
  const [busca, setBusca] = useState("");
  const [visualizacao, setVisualizacao] = useState<"lista" | "kanban">("lista");

  // Form de novo tratamento (mudança de fase)
  const [novaFase, setNovaFase] = useState<FaseContratual>("Primeiro contato");
  const [novaAnotacao, setNovaAnotacao] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Form de novo comentário (não altera a fase)
  const [novoComentario, setNovoComentario] = useState("");
  const [salvandoComentario, setSalvandoComentario] = useState(false);

  const SENHA_ADMIN = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "bohac2024";

  // ── Carregar leads ──────────────────────────────────────────────────────────
  const carregarLeads = useCallback(async () => {
    setCarregando(true);
    const { data, error } = await supabase
      .from("leads")
      .select(`*, tratamentos:lead_tratamentos(*)`)
      .order("criado_em", { ascending: false });

    if (!error && data) setLeads(data as Lead[]);
    setCarregando(false);
  }, []);

  useEffect(() => {
    if (autenticado) carregarLeads();
  }, [autenticado, carregarLeads]);

  // ── Recarregar um único lead (após inserir tratamento/comentário) ──────────
  const recarregarLeadSelecionado = useCallback(async (leadId: string) => {
    const { data } = await supabase
      .from("leads")
      .select(`*, tratamentos:lead_tratamentos(*)`)
      .eq("id", leadId)
      .single();
    if (data) setLeadSelecionado(data as Lead);
  }, []);

  // ── Adicionar tratamento (mudança de fase) ──────────────────────────────────
  async function adicionarTratamento() {
    if (!leadSelecionado || !novaAnotacao.trim()) return;
    setSalvando(true);
    const { error } = await supabase.from("lead_tratamentos").insert([
      {
        lead_id: leadSelecionado.id,
        tipo: "fase",
        fase: novaFase,
        anotacao: novaAnotacao.trim(),
        criado_por: "Guilherme",
      },
    ]);
    if (!error) {
      setNovaAnotacao("");
      await carregarLeads();
      await recarregarLeadSelecionado(leadSelecionado.id);
    }
    setSalvando(false);
  }

  // ── Adicionar comentário interno (não altera a fase do lead) ───────────────
  async function adicionarComentario() {
    if (!leadSelecionado || !novoComentario.trim()) return;
    setSalvandoComentario(true);
    const { error } = await supabase.from("lead_tratamentos").insert([
      {
        lead_id: leadSelecionado.id,
        tipo: "comentario",
        fase: null,
        anotacao: novoComentario.trim(),
        criado_por: "Guilherme",
      },
    ]);
    if (!error) {
      setNovoComentario("");
      await carregarLeads();
      await recarregarLeadSelecionado(leadSelecionado.id);
    }
    setSalvandoComentario(false);
  }

  // ── Mover lead de fase via drag-and-drop no quadro Kanban ───────────────────
  async function moverFaseKanban(leadId: string, novaFase: FaseContratual) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || obterFaseAtual(lead) === novaFase) return;
    await supabase.from("lead_tratamentos").insert([
      {
        lead_id: leadId,
        tipo: "fase",
        fase: novaFase,
        anotacao: `Movido para "${novaFase}" via quadro Kanban.`,
        criado_por: "Guilherme",
      },
    ]);
    await carregarLeads();
    if (leadSelecionado?.id === leadId) await recarregarLeadSelecionado(leadId);
  }

  // ── Filtros ─────────────────────────────────────────────────────────────────
  const leadsFiltrados = leads.filter((l) => {
    const nivel = l.resultado_analise?.nivelViabilidade;
    if (filtroNivel !== "TODOS" && nivel !== filtroNivel) return false;

    const ultimaFase = obterFaseAtual(l);
    if (filtroFase !== "TODAS" && ultimaFase !== filtroFase) return false;

    if (busca) {
      const q = busca.toLowerCase();
      if (
        !l.nome.toLowerCase().includes(q) &&
        !l.email.toLowerCase().includes(q) &&
        !(l.cnpj ?? "").includes(q) &&
        !(l.resultado_analise?.razaoSocial ?? "").toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = {
    total: leads.length,
    alta: leads.filter((l) => l.resultado_analise?.nivelViabilidade === "ALTA").length,
    media: leads.filter((l) => l.resultado_analise?.nivelViabilidade === "MEDIA").length,
    contratos: leads.filter((l) =>
      l.tratamentos?.some((t) => t.tipo === "fase" && t.fase === "Contrato assinado")
    ).length,
  };

  // ── Login ───────────────────────────────────────────────────────────────────
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-blue-900">Bohac Med</div>
            <div className="text-gray-500 text-sm mt-1">Painel administrativo</div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (senha === SENHA_ADMIN) setAutenticado(true);
              else alert("Senha incorreta.");
            }}
          >
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-900 text-white rounded-lg py-2 font-semibold hover:bg-blue-800 transition"
            >
              Entrar
            </button>
          </form>
          <div className="text-center mt-4">
            <a
              href={`mailto:guilherme.pbh@hotmail.com?subject=${encodeURIComponent(
                "Recuperação de senha — Painel Bohac Med"
              )}&body=${encodeURIComponent(
                "Olá, esqueci a senha do painel administrativo do Bohac Med. Pode me enviar a senha de acesso?"
              )}`}
              className="text-blue-700 text-sm hover:underline"
            >
              Esqueci minha senha?
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Dashboard ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <span className="font-bold text-lg">Bohac Med</span>
          <span className="text-blue-300 ml-2 text-sm">— Gestão de Leads</span>
        </div>
        <button
          onClick={() => setAutenticado(false)}
          className="text-blue-300 hover:text-white text-sm"
        >
          Sair
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
        {[
          { label: "Total de leads", valor: stats.total, cor: "text-blue-900" },
          { label: "Viabilidade Alta", valor: stats.alta, cor: "text-green-700" },
          { label: "Viabilidade Média", valor: stats.media, cor: "text-yellow-700" },
          { label: "Contratos assinados", valor: stats.contratos, cor: "text-purple-700" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm p-4">
            <div className={`text-3xl font-bold ${s.cor}`}>{s.valor}</div>
            <div className="text-gray-500 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="px-6 pb-4 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Buscar nome, email, CNPJ..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filtroNivel}
          onChange={(e) => setFiltroNivel(e.target.value as NivelViabilidade | "TODOS")}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          <option value="TODOS">Todos os níveis</option>
          <option value="ALTA">Alta viabilidade</option>
          <option value="MEDIA">Média viabilidade</option>
          <option value="BAIXA">Baixa viabilidade</option>
          <option value="INELEGIVEL">Inelegível</option>
        </select>
        <select
          value={filtroFase}
          onChange={(e) => setFiltroFase(e.target.value as FaseContratual | "TODAS")}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          <option value="TODAS">Todas as fases</option>
          {FASES_CONTRATUAIS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <div className="flex gap-1 bg-gray-200 rounded-lg p-1">
          <button
            onClick={() => setVisualizacao("lista")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              visualizacao === "lista" ? "bg-white shadow-sm text-blue-900" : "text-gray-500"
            }`}
          >
            Lista
          </button>
          <button
            onClick={() => setVisualizacao("kanban")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              visualizacao === "kanban" ? "bg-white shadow-sm text-blue-900" : "text-gray-500"
            }`}
          >
            Kanban
          </button>
        </div>
        <button
          onClick={carregarLeads}
          className="ml-auto bg-blue-900 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-800 transition"
        >
          ↻ Atualizar
        </button>
      </div>

      {/* Layout: tabela/kanban + painel lateral */}
      <div className="px-6 pb-6 flex gap-4" style={{ minHeight: "60vh" }}>
        {visualizacao === "kanban" ? (
        /* Quadro Kanban */
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-3 h-full pb-2" style={{ minWidth: "max-content" }}>
            {FASES_CONTRATUAIS.map((fase) => {
              const leadsNaFase = leadsFiltrados.filter((l) => {
                const faseAtual = obterFaseAtual(l);
                return faseAtual === fase || (faseAtual === null && fase === "Primeiro contato");
              });
              return (
                <div
                  key={fase}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const leadId = e.dataTransfer.getData("text/plain");
                    if (leadId) moverFaseKanban(leadId, fase);
                  }}
                  className="w-64 flex-shrink-0 bg-gray-100 rounded-xl flex flex-col"
                >
                  <div className="px-3 py-2.5 border-b border-gray-200 flex items-center justify-between">
                    <span className="font-semibold text-xs text-gray-600 uppercase tracking-wide">{fase}</span>
                    <span className="text-xs text-gray-400 bg-white rounded-full px-2 py-0.5">{leadsNaFase.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2" style={{ maxHeight: "60vh" }}>
                    {leadsNaFase.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("text/plain", lead.id)}
                        onClick={() => setLeadSelecionado(lead)}
                        className={`bg-white rounded-lg shadow-sm p-3 cursor-pointer hover:shadow-md transition border-2 ${
                          leadSelecionado?.id === lead.id ? "border-blue-500" : "border-transparent"
                        }`}
                      >
                        <div className="font-medium text-sm text-gray-900">{lead.nome}</div>
                        {lead.resultado_analise?.nivelViabilidade && (
                          <span
                            className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                              COR_NIVEL[lead.resultado_analise.nivelViabilidade]
                            }`}
                          >
                            {lead.resultado_analise.nivelViabilidade}
                          </span>
                        )}
                        <div className="text-gray-400 text-xs mt-1.5">{lead.telefone}</div>
                      </div>
                    ))}
                    {leadsNaFase.length === 0 && (
                      <div className="text-gray-300 text-xs text-center py-6">Arraste um lead aqui</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        ) : (
        /* Tabela de leads */
        <div className="flex-1 bg-white rounded-xl shadow-sm overflow-auto">
          {carregando ? (
            <div className="flex items-center justify-center h-40 text-gray-400">
              Carregando leads...
            </div>
          ) : leadsFiltrados.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400">
              Nenhum lead encontrado.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Nome / Empresa</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Contato</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Viabilidade</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Fase atual</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Captado em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leadsFiltrados.map((lead) => {
                  const ultimaFase = obterFaseAtual(lead) ?? "—";
                  const nivel = lead.resultado_analise?.nivelViabilidade;
                  const ativo = leadSelecionado?.id === lead.id;
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setLeadSelecionado(lead)}
                      className={`cursor-pointer hover:bg-blue-50 transition ${
                        ativo ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{lead.nome}</div>
                        {lead.resultado_analise?.razaoSocial && (
                          <div className="text-gray-400 text-xs">{lead.resultado_analise.razaoSocial}</div>
                        )}
                        {lead.cnpj && (
                          <div className="text-gray-400 text-xs">{formatarCNPJ(lead.cnpj)}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-700">{lead.email}</div>
                        <div className="text-gray-400">{lead.telefone}</div>
                      </td>
                      <td className="px-4 py-3">
                        {nivel ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${COR_NIVEL[nivel]}`}>
                            {nivel}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{ultimaFase}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {formatarData(lead.criado_em)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        )}

        {/* Painel lateral de tratamentos */}
        {leadSelecionado && (
          <div className="w-96 bg-white rounded-xl shadow-sm flex flex-col">
            {/* Cabeçalho do lead */}
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-900">{leadSelecionado.nome}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{leadSelecionado.email}</div>
                  <div className="text-gray-500 text-xs">{leadSelecionado.telefone}</div>
                </div>
                <button
                  onClick={() => setLeadSelecionado(null)}
                  className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                >
                  ×
                </button>
              </div>
              {leadSelecionado.resultado_analise && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold ${
                        COR_NIVEL[leadSelecionado.resultado_analise.nivelViabilidade]
                      }`}
                    >
                      {leadSelecionado.resultado_analise.nivelViabilidade}
                    </span>
                    <span className="text-gray-500">
                      Pontuação: {leadSelecionado.resultado_analise.pontuacao}/100
                    </span>
                  </div>
                  <div className="text-gray-600 leading-relaxed">
                    {leadSelecionado.resultado_analise.justificativa}
                  </div>
                </div>
              )}
            </div>

            {/* Histórico de tratamentos */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Histórico de tratamentos
              </div>
              {(leadSelecionado.tratamentos ?? []).length === 0 ? (
                <div className="text-gray-400 text-sm text-center py-4">
                  Nenhum tratamento registrado.
                </div>
              ) : (
                [...(leadSelecionado.tratamentos ?? [])].reverse().map((t) => (
                  <div
                    key={t.id}
                    className={`border-l-2 pl-3 ${
                      t.tipo === "comentario" ? "border-amber-300" : "border-blue-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      {t.tipo === "comentario" ? (
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          💬 Comentário
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {t.fase}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{formatarData(t.criado_em)}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{t.anotacao}</p>
                  </div>
                ))
              )}
            </div>

            {/* Form novo tratamento (mudança de fase) */}
            <div className="p-4 border-t bg-gray-50">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Mudança de fase
              </div>
              <select
                value={novaFase}
                onChange={(e) => setNovaFase(e.target.value as FaseContratual)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {FASES_CONTRATUAIS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <textarea
                rows={2}
                placeholder="Anotação sobre o tratamento dado..."
                value={novaAnotacao}
                onChange={(e) => setNovaAnotacao(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={adicionarTratamento}
                disabled={salvando || !novaAnotacao.trim()}
                className="w-full bg-blue-900 text-white rounded-lg py-2 text-sm font-semibold hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {salvando ? "Salvando..." : "Registrar mudança de fase"}
              </button>
            </div>

            {/* Form novo comentário (não altera a fase) */}
            <div className="p-4 border-t bg-gray-50 rounded-b-xl">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Comentário interno
              </div>
              <textarea
                rows={2}
                placeholder="Adicionar um comentário, sem alterar a fase..."
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                onClick={adicionarComentario}
                disabled={salvandoComentario || !novoComentario.trim()}
                className="w-full bg-amber-500 text-white rounded-lg py-2 text-sm font-semibold hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {salvandoComentario ? "Salvando..." : "Adicionar comentário"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
