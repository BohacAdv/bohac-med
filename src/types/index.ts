// ─── Tipos centrais do Bohac Med ──────────────────────────────────────────────

export interface DadosCNPJ {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  situacao: string;
  cnaePrincipal: CNAE;
  cnaesSecundarios: CNAE[];
  municipio: string;
  uf: string;
}

export interface CNAE {
  codigo: string;
  descricao: string;
}

export type NivelViabilidade = "ALTA" | "MEDIA" | "BAIXA" | "INELEGIVEL";

export interface ResultadoAnalise {
  cnpj: string;
  razaoSocial: string;
  nivelViabilidade: NivelViabilidade;
  pontuacao: number; // 0–100
  cnaesElegiveis: CNAEAvaliado[];
  cnaesNaoElegiveis: CNAEAvaliado[];
  justificativa: string;          // Texto simples para o médico
  proximosPasosRecomendados: string;
  analisadoEm: string;            // ISO date
}

export interface CNAEAvaliado extends CNAE {
  elegivel: boolean;
  motivo: string;
}

export interface ResultadoAnaliseNFe {
  descricaoOriginal: string;
  enquadrado: boolean;
  nivelViabilidade: NivelViabilidade;
  justificativa: string;
  servicosIdentificados: string[];
}

export interface DadosLead {
  nome: string;
  email: string;
  telefone: string;
  cnpj?: string;
  mensagem?: string;
  origem: "site" | "whatsapp";
  resultadoAnalise?: ResultadoAnalise;
  criadoEm?: string;
}
