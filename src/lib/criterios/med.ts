import type { CriterioVertical } from "./tipos";

/**
 * Bohac Med — equiparação hospitalar (vertical medicina).
 *
 * Base: art. 15, §1º, III, "a" da Lei 9.249/1995, com a redação da Lei
 * 11.727/2008, e o alcance fixado pelo STJ no REsp 1.116.399/BA (Tema 217
 * dos repetitivos), disciplinado pela IN RFB 1.700/2017.
 */
export const CRITERIO_MED: CriterioVertical = {
  id: "med",
  nome: "Bohac Med",
  tese: "equiparação hospitalar",

  cnaes: [
    // ── Natureza hospitalar ────────────────────────────────────────────────
    { codigo: "8610-1/01", descricao: "Atividades de atendimento hospitalar, exceto pronto-socorro e unidades para atendimento a urgências", natureza: "hospitalar",
      fundamento: "Atendimento hospitalar em sentido próprio." },
    { codigo: "8610-1/02", descricao: "Atividades de atendimento em pronto-socorro e unidades hospitalares para atendimento a urgências", natureza: "hospitalar",
      fundamento: "Atendimento hospitalar de urgência." },
    { codigo: "8610-1/03", descricao: "Atividades de atendimento hospitalar, exceto pronto-socorro e unidades para atendimento a urgências", natureza: "hospitalar",
      fundamento: "Atendimento hospitalar em sentido próprio." },
    { codigo: "8621-6/01", descricao: "UTI móvel", natureza: "hospitalar",
      fundamento: "Terapia intensiva — estrutura hospitalar móvel." },
    { codigo: "8630-5/01", descricao: "Atividade médica ambulatorial com recursos para realização de procedimentos cirúrgicos", natureza: "hospitalar",
      fundamento: "Procedimento cirúrgico, ainda que ambulatorial, é atividade hospitalar (Tema 217)." },
    { codigo: "8630-5/02", descricao: "Atividade médica ambulatorial com recursos para realização de exames complementares", natureza: "hospitalar",
      fundamento: "Estrutura para exames complementares vai além da consulta." },
    { codigo: "8630-5/07", descricao: "Atividades de reprodução humana assistida", natureza: "hospitalar",
      fundamento: "Procedimentos com estrutura laboratorial e cirúrgica." },
    { codigo: "8640-2/01", descricao: "Laboratórios de anatomia patológica e citológica", natureza: "hospitalar",
      fundamento: "Serviço de apoio diagnóstico de natureza hospitalar." },
    { codigo: "8640-2/02", descricao: "Laboratórios clínicos", natureza: "hospitalar",
      fundamento: "Serviço de apoio diagnóstico de natureza hospitalar." },
    { codigo: "8640-2/03", descricao: "Serviços de diálise e nefrologia", natureza: "hospitalar",
      fundamento: "Terapia de alta complexidade em estrutura assistencial." },
    { codigo: "8640-2/04", descricao: "Serviços de tomografia", natureza: "hospitalar",
      fundamento: "Diagnóstico por imagem com equipamento hospitalar." },
    { codigo: "8640-2/05", descricao: "Serviços de diagnóstico por imagem sem uso de radiação ionizante, exceto ressonância magnética", natureza: "hospitalar",
      fundamento: "Diagnóstico por imagem." },
    { codigo: "8640-2/06", descricao: "Serviços de ressonância magnética", natureza: "hospitalar",
      fundamento: "Diagnóstico por imagem com equipamento hospitalar." },
    { codigo: "8640-2/07", descricao: "Serviços de diagnóstico por registro gráfico", natureza: "hospitalar",
      fundamento: "Apoio diagnóstico instrumental." },
    { codigo: "8640-2/08", descricao: "Serviços de diagnóstico por métodos ópticos (endoscopia, colonoscopia)", natureza: "hospitalar",
      fundamento: "Procedimento invasivo com preparo e recuperação." },
    { codigo: "8640-2/09", descricao: "Serviços de diagnóstico para determinação de patologias clínicas especializadas", natureza: "hospitalar",
      fundamento: "Apoio diagnóstico especializado." },
    { codigo: "8650-0/01", descricao: "Atividades de enfermagem", natureza: "hospitalar",
      fundamento: "Assistência de enfermagem é inerente à atividade hospitalar." },
    { codigo: "8650-0/04", descricao: "Atividades de fisioterapia", natureza: "hospitalar",
      fundamento: "Reabilitação em estrutura assistencial." },
    { codigo: "8650-0/07", descricao: "Atividades de terapia de nutrição enteral e parenteral", natureza: "hospitalar",
      fundamento: "Terapia nutricional de suporte, própria de estrutura assistencial." },

    // ── Apoio ──────────────────────────────────────────────────────────────
    { codigo: "8621-6/02", descricao: "Serviços móveis de atendimento a urgências, exceto UTI móvel", natureza: "apoio",
      fundamento: "Compõe estrutura assistencial, mas não a caracteriza isoladamente." },
    { codigo: "8622-4/00", descricao: "Serviços de remoção de pacientes, exceto os serviços móveis de atendimento a urgências", natureza: "apoio",
      fundamento: "Atividade de transporte assistencial." },
    { codigo: "8630-5/04", descricao: "Atividade odontológica", natureza: "apoio",
      fundamento: "Mantido no motor para a vertical odontológica; na vertical médica não caracteriza, sozinho, atividade hospitalar." },
    { codigo: "8630-5/06", descricao: "Serviços de vacinação e imunização humana", natureza: "apoio",
      fundamento: "Procedimento assistencial simples." },
    { codigo: "8630-5/08", descricao: "Atividades de atenção ambulatorial não especificadas anteriormente", natureza: "apoio",
      fundamento: "Genérico — depende da atividade efetivamente prestada." },
    { codigo: "8640-2/99", descricao: "Atividades de serviços de complementação diagnóstica e terapêutica não especificadas anteriormente", natureza: "apoio",
      fundamento: "Genérico — depende da atividade efetivamente prestada." },
    { codigo: "8650-0/05", descricao: "Atividades de terapia ocupacional", natureza: "apoio",
      fundamento: "Terapia de reabilitação; isoladamente não caracteriza estrutura hospitalar." },
    { codigo: "8650-0/06", descricao: "Atividades de fonoaudiologia", natureza: "apoio",
      fundamento: "Terapia especializada; isoladamente não caracteriza estrutura hospitalar." },
    { codigo: "8690-9/02", descricao: "Atividades de banco de leite humano", natureza: "apoio",
      fundamento: "Serviço de apoio vinculado a estrutura assistencial." },
    { codigo: "8690-9/99", descricao: "Outras atividades de atenção à saúde humana não especificadas anteriormente", natureza: "apoio",
      fundamento: "Genérico — depende da atividade efetivamente prestada." },

    // ── Fora do alcance ────────────────────────────────────────────────────
    { codigo: "8630-5/03", descricao: "Atividade médica ambulatorial restrita a consultas", natureza: "excluido",
      fundamento: "O STJ excluiu expressamente as simples consultas médicas do conceito de serviço hospitalar (REsp 1.116.399/BA, Tema 217)." },
    { codigo: "8650-0/02", descricao: "Atividades de profissionais da nutrição", natureza: "excluido",
      fundamento: "Atendimento nutricional isolado não configura serviço hospitalar." },
    { codigo: "8650-0/03", descricao: "Atividades de psicologia e psicanálise", natureza: "excluido",
      fundamento: "Atendimento psicológico isolado não configura serviço hospitalar." },
    { codigo: "8660-7/00", descricao: "Atividades de apoio à gestão de saúde", natureza: "excluido",
      fundamento: "Atividade administrativa, não assistencial." },
    { codigo: "8690-9/01", descricao: "Atividades de práticas integrativas e complementares em saúde humana", natureza: "excluido",
      fundamento: "Não configura serviço hospitalar." },
    { codigo: "8690-9/03", descricao: "Atividades de acupuntura", natureza: "excluido",
      fundamento: "Atendimento isolado, sem estrutura hospitalar." },
    { codigo: "8690-9/04", descricao: "Atividades de podologia", natureza: "excluido",
      fundamento: "Atendimento isolado, sem estrutura hospitalar." },
  ],

  fundamentos: [
    'Lei 9.249/1995, art. 15, §1º, III, "a" (IRPJ) e art. 20 (CSLL)',
    "Lei 11.727/2008 — exige sociedade empresária e atendimento às normas da ANVISA",
    "STJ, REsp 1.116.399/BA — Tema 217 dos recursos repetitivos",
    "IN RFB 1.700/2017",
  ],

  rotulos: {
    COMPORTA_ANALISE: "Comporta análise",
    REQUER_VERIFICACAO: "Requer verificação",
    NAO_COMPORTA: "Não comporta",
  },

  aberturas: {
    COMPORTA_ANALISE:
      "O cadastro indica atividade de natureza hospitalar. O caso comporta análise documental para verificação do enquadramento.",
    REQUER_VERIFICACAO:
      "O cadastro é compatível com a área da saúde, mas não é suficiente, por si só, para indicar enquadramento. A conclusão depende da atividade efetivamente prestada.",
    NAO_COMPORTA:
      "Pelos CNAEs cadastrados, a tese da equiparação hospitalar não se aplica a esta empresa.",
  },

  naoApurado: [
    "A forma societária adotada — a lei exige sociedade empresária, e boa parte das clínicas é sociedade simples registrada em cartório.",
    "A regularidade perante a ANVISA e a vigilância sanitária, exigida pela Lei 11.727/2008.",
    "A natureza dos serviços efetivamente prestados, que pode divergir do CNAE cadastrado.",
    "A escrituração fiscal e o regime de apuração no período.",
  ],
};
