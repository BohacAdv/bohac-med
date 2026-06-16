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

interface Tratamento {
  id: string;
  lead_id: string;
  fase: FaseContratual;
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

  // Form de novo tratamento
  const [novaFase, setNovaFase] = useState<FaseContratual>("Primeiro contato");
  const [novaAnotacao, setNovaAnotacao] = useState("");
  const [salvando, setSalvando] = useState(false);

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

  // ── Adicionar tratamento ────────────────────────────────────────────────────
  async function adicionarTratamento() {
    if (!leadSelecionado || !novaAnotacao.trim()) return;
    setSalvando(true);
    const { error } = await supabase.from("lead_tratamentos").insert([
      {
        lead_id: leadSelecionado.id,
        fase: novaFase,
        anotacao: novaAnotacao.trim(),
        criado_por: "Guilherme",
      },
    ]);
    if (!error) {
      setNovaAnotacao("");
      await carregarLeads();
      // Atualiza lead selecionado com os novos dados
      const { data } = await supabase
        .from("leads")
        .select(`*, tratamentos:lead_tratamentos(*)`)
        .eq("id", leadSelecionado.id)
        .single();
      if (data) setLeadSelecionado(data as Lead);
    }
    setSalvando(false);
  }

  // ── Filtros ─────────────────────────────────────────────────────────────────
  const leadsFiltrados = leads.filter((l) => {
    const nivel = l.resultado_analise?.nivelViabilidade;
    if (filtroNivel !== "TODOS" && nivel !== filtroNivel) return false;

    const ultimaFase = l.tratamentos?.at(-1)?.fase;
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
      l.tratamentos?.some((t) => t.fase === "Contrato assinado")
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
        <button
          onClick={carregarLeads}
          className="ml-auto bg-blue-900 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-800 transition"
        >
          ↻ Atualizar
        </button>
      </div>

      {/* Layout: tabela + painel lateral */}
      <div className="px-6 pb-6 flex gap-4" style={{ minHeight: "60vh" }}>
        {/* Tabela de leads */}
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
                  const ultimaFase = lead.tratamentos?.at(-1)?.fase ?? "—";
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
                  <div key={t.id} className="border-l-2 border-blue-200 pl-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {t.fase}
                      </span>
                      <span className="text-xs text-gray-400">{formatarData(t.criado_em)}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{t.anotacao}</p>
                  </div>
                ))
              )}
            </div>

            {/* Form novo tratamento */}
            <div className="p-4 border-t bg-gray-50 rounded-b-xl">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Novo tratamento
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
                rows={3}
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
                {salvando ? "Salvando..." : "Registrar tratamento"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
