/**
 * CNAEs elegíveis para a tese de equiparação hospitalar
 *
 * Base legal: art. 15, §1°, III, "a" da Lei 9.249/95 conforme interpretação
 * do STJ (Resp 1.116.399/BA — Tema 217) e jurisprudência consolidada.
 *
 * Empresas com esses CNAEs têm maior probabilidade de enquadramento, desde
 * que os serviços efetivamente prestados sejam de natureza hospitalar.
 */

export interface CNAEInfo {
  codigo: string;
  descricao: string;
  peso: number; // 1=possível, 2=provável, 3=forte indício
  observacao?: string;
}

export const CNAES_ELEGIVEIS: CNAEInfo[] = [
  // ── Atividades hospitalares ──────────────────────────────────────────────
  { codigo: "8610-1/01", descricao: "Atividades de atendimento hospitalar, exceto pronto-socorro e unidades para atendimento a urgências", peso: 3 },
  { codigo: "8610-1/02", descricao: "Atividades de atendimento em pronto-socorro e unidades hospitalares para atendimento a urgências", peso: 3 },
  { codigo: "8610-1/03", descricao: "UTIs móveis", peso: 3 },

  // ── Serviços médico-ambulatoriais ────────────────────────────────────────
  { codigo: "8621-6/01", descricao: "UTI móvel - unidade de terapia intensiva móvel para resgate hospitalar", peso: 3 },
  { codigo: "8621-6/02", descricao: "Serviços móveis de atendimento a urgências, exceto UTI móvel", peso: 2 },
  { codigo: "8622-4/00", descricao: "Serviços de remoção de pacientes, exceto os serviços móveis de atendimento a urgências", peso: 2 },

  // ── Clínicas e serviços de saúde ─────────────────────────────────────────
  { codigo: "8630-5/01", descricao: "Atividade médica ambulatorial com recursos para realização de procedimentos cirúrgicos", peso: 3,
    observacao: "Forte candidato — procedimentos cirúrgicos ambulatoriais" },
  { codigo: "8630-5/02", descricao: "Atividade médica ambulatorial com recursos para realização de exames complementares", peso: 3 },
  { codigo: "8630-5/03", descricao: "Atividade médica ambulatorial restrita a consultas", peso: 2,
    observacao: "Viabilidade depende do conjunto de serviços prestados" },
  { codigo: "8630-5/04", descricao: "Atividade odontológica", peso: 2 },
  { codigo: "8630-5/06", descricao: "Serviços de vacinação e imunização humana", peso: 2 },
  { codigo: "8630-5/07", descricao: "Atividades de reprodução humana assistida", peso: 3 },
  { codigo: "8630-5/08", descricao: "Atividades de atenção ambulatorial não especificadas anteriormente", peso: 2 },

  // ── Diagnóstico e terapia ─────────────────────────────────────────────────
  { codigo: "8640-2/01", descricao: "Laboratórios de anatomia patológica e citológica", peso: 3 },
  { codigo: "8640-2/02", descricao: "Laboratórios clínicos", peso: 3 },
  { codigo: "8640-2/03", descricao: "Serviços de diálise e nefrologia", peso: 3 },
  { codigo: "8640-2/04", descricao: "Serviços de tomografia", peso: 3 },
  { codigo: "8640-2/05", descricao: "Serviços de diagnóstico por imagem sem uso de radiação ionizante, exceto ressonância magnética", peso: 3 },
  { codigo: "8640-2/06", descricao: "Serviços de ressonância magnética", peso: 3 },
  { codigo: "8640-2/07", descricao: "Serviços de diagnóstico por registro gráfico (ECG, EEG, etc.)", peso: 3 },
  { codigo: "8640-2/08", descricao: "Serviços de diagnóstico por métodos ópticos (endoscopia, colonoscopia, etc.)", peso: 3 },
  { codigo: "8640-2/09", descricao: "Serviços de diagnóstico para determinação de patologias clínicas especializadas", peso: 3 },
  { codigo: "8640-2/99", descricao: "Atividades de serviços de complementação diagnóstica e terapêutica não especificadas anteriormente", peso: 2 },

  // ── Terapias e reabilitação ───────────────────────────────────────────────
  { codigo: "8650-0/01", descricao: "Atividades de enfermagem", peso: 3 },
  { codigo: "8650-0/02", descricao: "Atividades de profissionais da nutrição", peso: 2 },
  { codigo: "8650-0/03", descricao: "Atividades de psicologia e psicanálise", peso: 1 },
  { codigo: "8650-0/04", descricao: "Atividades de fisioterapia", peso: 3 },
  { codigo: "8650-0/05", descricao: "Atividades de terapia ocupacional", peso: 2 },
  { codigo: "8650-0/06", descricao: "Atividades de fonoaudiologia", peso: 2 },
  { codigo: "8650-0/07", descricao: "Atividades de terapia de nutrição enteral e parenteral", peso: 3 },
  { codigo: "8650-0/99", descricao: "Atividades de profissionais da área de saúde não especificadas anteriormente", peso: 2 },

  // ── Saúde coletiva e outras ───────────────────────────────────────────────
  { codigo: "8660-7/00", descricao: "Atividades de apoio à gestão de saúde", peso: 1 },
  { codigo: "8690-9/01", descricao: "Atividades de práticas integrativas e complementares em saúde humana", peso: 1 },
  { codigo: "8690-9/02", descricao: "Atividades de banco de leite humano", peso: 2 },
  { codigo: "8690-9/03", descricao: "Atividades de acupuntura", peso: 1 },
  { codigo: "8690-9/04", descricao: "Atividades de podologia", peso: 1 },
  { codigo: "8690-9/99", descricao: "Outras atividades de atenção à saúde humana não especificadas anteriormente", peso: 2 },
];

/**
 * Retorna informações de um CNAE se for elegível, ou null se não for.
 */
export function verificarCNAE(codigo: string): CNAEInfo | null {
  // Normaliza o código (remove pontos/hífens e reaplica o padrão)
  const normalizado = normalizarCodigoCNAE(codigo);
  return CNAES_ELEGIVEIS.find(c => normalizarCodigoCNAE(c.codigo) === normalizado) ?? null;
}

function normalizarCodigoCNAE(codigo: string): string {
  // Remove tudo que não é dígito ou letra
  const limpo = codigo.replace(/[^0-9a-zA-Z]/g, "");
  // Formato padrão: XXXX-X/XX → 7 chars
  if (limpo.length === 7) {
    return `${limpo.slice(0,4)}-${limpo[4]}/${limpo.slice(5)}`;
  }
  return codigo.toUpperCase().trim();
}

/**
 * Calcula score de viabilidade com base nos CNAEs encontrados.
 * Retorna valor de 0 a 100.
 */
export function calcularScore(cnaesElegiveis: CNAEInfo[]): number {
  if (cnaesElegiveis.length === 0) return 0;

  const pesoPrincipal = cnaesElegiveis[0]?.peso ?? 0; // CNAE principal tem peso duplo
  const somaTotal = pesoPrincipal * 2 + cnaesElegiveis.slice(1).reduce((acc, c) => acc + c.peso, 0);
  const maxPossivel = 3 * 2 + 3 * Math.max(0, cnaesElegiveis.length - 1);

  const base = Math.min(100, Math.round((somaTotal / maxPossivel) * 100));

  // Bônus se tiver CNAE principal de peso 3
  if (pesoPrincipal === 3 && cnaesElegiveis.length >= 2) return Math.min(100, base + 10);
  return base;
}
