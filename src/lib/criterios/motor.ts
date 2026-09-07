import type {
  CNAEClassificado,
  CriterioVertical,
  Natureza,
  Nivel,
} from "./tipos";

function normalizar(codigo: string): string {
  const limpo = codigo.replace(/[^0-9]/g, "");
  if (limpo.length === 7) return `${limpo.slice(0, 4)}-${limpo[4]}/${limpo.slice(5)}`;
  return codigo.trim();
}

export function classificar(
  criterio: CriterioVertical,
  codigo: string,
  descricao: string,
  principal: boolean
): CNAEClassificado {
  const alvo = normalizar(codigo);
  const achado = criterio.cnaes.find((c) => normalizar(c.codigo) === alvo);
  return {
    codigo: alvo,
    descricao: descricao || achado?.descricao || "",
    natureza: achado?.natureza ?? "nenhum",
    fundamento: achado?.fundamento ?? "Atividade sem relação com a área da saúde.",
    principal,
  };
}

export interface Avaliacao {
  nivel: Nivel;
  /** Número da regra aplicada — impresso no parecer para rastreabilidade. */
  regra: number;
  motivo: string;
  classificados: CNAEClassificado[];
}

/**
 * Seis regras, avaliadas em ordem; a primeira que casar decide.
 *
 * Substitui o score 0–100 anterior, que atribuía "67 → MÉDIA viabilidade" a
 * um consultório restrito a consultas — hipótese que o Tema 217 exclui.
 */
export function avaliar(
  criterio: CriterioVertical,
  classificados: CNAEClassificado[]
): Avaliacao {
  const principal = classificados.find((c) => c.principal);
  const secundarios = classificados.filter((c) => !c.principal);
  const np: Natureza = principal?.natureza ?? "nenhum";
  const temSecHospitalar = secundarios.some((c) => c.natureza === "hospitalar");
  const temAlgumSaude = classificados.some((c) => c.natureza !== "nenhum");

  const R = (nivel: Nivel, regra: number, motivo: string): Avaliacao => ({
    nivel, regra, motivo, classificados,
  });

  // 1 — principal é hospitalar
  if (np === "hospitalar") {
    return R("COMPORTA_ANALISE", 1,
      `A atividade principal (${principal!.codigo}) é de natureza hospitalar.`);
  }

  // 2 — principal de apoio, com secundário hospitalar
  if (np === "apoio" && temSecHospitalar) {
    return R("COMPORTA_ANALISE", 2,
      "A atividade principal é de apoio, mas há atividade secundária de natureza hospitalar registrada.");
  }

  // 3 — principal excluído, mas há secundário hospitalar
  if (np === "excluido" && temSecHospitalar) {
    return R("REQUER_VERIFICACAO", 3,
      `A atividade principal (${principal!.codigo}) está fora do alcance da tese, mas há atividade secundária de natureza hospitalar. O CNAE cadastrado pode divergir da atividade efetivamente exercida.`);
  }

  // 4 — principal de apoio, sem secundário hospitalar
  if (np === "apoio") {
    return R("REQUER_VERIFICACAO", 4,
      "A atividade principal é da área da saúde, mas de natureza acessória. Isoladamente não caracteriza serviço hospitalar.");
  }

  // 5 — principal excluído, sem secundário hospitalar
  if (np === "excluido") {
    return R("NAO_COMPORTA", 5, principal!.fundamento);
  }

  // 6 — nenhuma atividade de saúde
  return R("NAO_COMPORTA", 6,
    temAlgumSaude
      ? "As atividades registradas não são de natureza hospitalar."
      : "A empresa não registra atividades da área da saúde.");
}
