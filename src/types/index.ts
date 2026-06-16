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
  email: string;
  telefone: string;
  cnpj?: string;
  mensagem?: string;
  origem: "site" | "whatsapp";
  resultadoAnalise?: ResultadoAnalise;
  notasFiscais?: NotaFiscalAnexo[];
  parecerNfe?: ResultadoAnaliseNFeArquivos;
  criadoEm?: string;
}
