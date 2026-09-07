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

/**
 * Três níveis. O antigo conjunto de quatro (ALTA/MEDIA/BAIXA/INELEGIVEL) com
 * score 0–100 sugeria uma medição que a verificação por CNAE não faz.
 */
export type Nivel = "COMPORTA_ANALISE" | "REQUER_VERIFICACAO" | "NAO_COMPORTA";

/** Mantido só para a modalidade de notas fiscais, que a IA classifica. */
export type NivelViabilidade = "ALTA" | "MEDIA" | "BAIXA" | "INELEGIVEL";

export interface ResultadoAnalise {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  situacao: string;
  municipio: string;
  uf: string;
  nivel: Nivel;
  /** Número da regra aplicada — rastreabilidade do parecer. */
  regraAplicada: number;
  motivo: string;
  abertura: string;
  cnaes: CNAEAvaliado[];
  fundamentos: string[];
  naoApurado: string[];
  protocolo: string;
  analisadoEm: string;
}

export interface CNAEAvaliado extends CNAE {
  natureza: "hospitalar" | "apoio" | "excluido" | "nenhum";
  fundamento: string;
  principal: boolean;
}

export interface ResultadoAnaliseNFe {
  descricaoOriginal: string;
  enquadrado: boolean;
  nivelViabilidade: NivelViabilidade;
  justificativa: string;
  servicosIdentificados: string[];
}

// ─── Anexo de notas fiscais (upload de arquivo, não texto colado) ─────────────

export interface NotaFiscalAnexo {
  nomeArquivo: string;
  caminho: string; // path dentro do bucket "notas-fiscais" no Supabase Storage
  tipo: string;     // mime type / extensão do arquivo
}

export interface NotaFiscalAvaliada {
  nomeArquivo: string;
  servicosIdentificados: string[];
  enquadrado: boolean;
  observacoesRelevantes: string;
}

export interface ResultadoAnaliseNFeArquivos {
  parecer: string; // parecer corrido, agregando todas as notas enviadas
  enquadradoGeral: boolean;
  nivelViabilidadeGeral: NivelViabilidade;
  notas: NotaFiscalAvaliada[];
}

export interface DadosLead {
  nome: string;
  /** Ao menos um entre email e telefone deve vir preenchido. */
  email?: string;
  telefone?: string;
  cnpj?: string;
  mensagem?: string;
  origem: "site" | "whatsapp";
  resultadoAnalise?: ResultadoAnalise;
  notasFiscais?: NotaFiscalAnexo[];
  parecerNfe?: ResultadoAnaliseNFeArquivos;
  criadoEm?: string;
}
