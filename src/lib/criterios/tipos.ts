/**
 * Critérios de enquadramento — contrato comum às verticais do grupo Bohac.
 *
 * O motor não assume "medicina": cada vertical declara seus próprios CNAEs,
 * regras e fundamentos. Bohac Odonto reaproveita a mesma máquina com um
 * arquivo de critério próprio, no qual a odontologia é `hospitalar` em vez
 * de `apoio`.
 */

/** Natureza do CNAE frente à tese. Substitui o antigo "peso 1..3". */
export type Natureza =
  /** Atividade de natureza hospitalar em sentido próprio. */
  | "hospitalar"
  /** Atividade de saúde que pode compor estrutura hospitalar, mas não a caracteriza sozinha. */
  | "apoio"
  /** Fora do alcance da tese por norma ou jurisprudência. */
  | "excluido"
  /** Sem relação com a área de saúde. */
  | "nenhum";

/**
 * Três níveis, não quatro. O antigo score 0–100 sugeria uma medição que uma
 * verificação por CNAE não faz — e produzia "67 → MÉDIA" para consultório
 * restrito a consultas, hipótese que o STJ exclui (Tema 217).
 */
export type Nivel = "COMPORTA_ANALISE" | "REQUER_VERIFICACAO" | "NAO_COMPORTA";

export interface CNAECriterio {
  codigo: string;
  descricao: string;
  natureza: Natureza;
  /** Por que este CNAE recebe esta natureza. Vai impresso no parecer. */
  fundamento?: string;
}

export interface CNAEClassificado {
  codigo: string;
  descricao: string;
  natureza: Natureza;
  fundamento: string;
  principal: boolean;
}

export interface CriterioVertical {
  id: string;
  nome: string;
  /** Tese à qual o critério se refere. */
  tese: string;
  cnaes: CNAECriterio[];
  /** Normas citadas no rodapé do parecer. */
  fundamentos: string[];
  /** Frase de abertura por nível. */
  aberturas: Record<Nivel, string>;
  rotulos: Record<Nivel, string>;
  /** Itens que a verificação preliminar não apura. */
  naoApurado: string[];
}

export const ROTULO_NATUREZA: Record<Natureza, string> = {
  hospitalar: "Natureza hospitalar",
  apoio: "Apoio à estrutura",
  excluido: "Fora do alcance",
  nenhum: "Sem relação com saúde",
};
