/**
 * Consulta o CNPJ na Brasil API e analisa os CNAEs para equiparação hospitalar.
 */

import type { DadosCNPJ, ResultadoAnalise, CNAEAvaliado, NivelViabilidade } from "@/types";
import { verificarCNAE, calcularScore } from "./cnaes-elegiveis";

const BRASIL_API = "https://brasilapi.com.br/api/cnpj/v1";

export async function consultarCNPJ(cnpj: string): Promise<DadosCNPJ> {
  const cnpjLimpo = cnpj.replace(/\D/g, "");
  if (cnpjLimpo.length !== 14) throw new Error("CNPJ inválido — deve ter 14 dígitos.");

    const res = await fetch(`${BRASIL_API}/${cnpjLimpo}`, {
          cache: "no-store",
          headers: {
                  "User-Agent": "Mozilla/5.0 (compatible; BohacMed/1.0; +https://bohac-med.vercel.app)",
                  "Accept": "application/json",
          },
    });
    if (!res.ok) {
          if (res.status === 404) throw new Error("CNPJ não encontrado na Receita Federal.");
          if (res.status === 429) throw new Error("Muitas consultas simultâneas. Aguarde alguns segundos e tente novamente.");
          throw new Error(`Erro ao consultar a Receita Federal (HTTP ${res.status}). Tente novamente em instantes.`);
    }

  const data = await res.json();

  return {
    cnpj: cnpjLimpo,
    razaoSocial: data.razao_social ?? "",
    nomeFantasia: data.nome_fantasia ?? "",
    situacao: data.descricao_situacao_cadastral ?? "",
    cnaePrincipal: {
      codigo: data.cnae_fiscal_descricao ? formatarCodigoCNAE(String(data.cnae_fiscal)) : "",
      descricao: data.cnae_fiscal_descricao ?? "",
    },
    cnaesSecundarios: (data.cnaes_secundarios ?? []).map((c: { codigo: number; descricao: string }) => ({
      codigo: formatarCodigoCNAE(String(c.codigo)),
      descricao: c.descricao,
    })),
    municipio: data.municipio ?? "",
    uf: data.uf ?? "",
  };
}

function formatarCodigoCNAE(codigo: string): string {
  const s = codigo.padStart(7, "0");
  return `${s.slice(0,4)}-${s[4]}/${s.slice(5)}`;
}

export function analisarViabilidade(dados: DadosCNPJ): ResultadoAnalise {
  const todosCnaes = [dados.cnaePrincipal, ...dados.cnaesSecundarios];

  const cnaesAvaliados: CNAEAvaliado[] = todosCnaes.map((cnae, idx) => {
    const info = verificarCNAE(cnae.codigo);
    return {
      ...cnae,
      elegivel: !!info,
      motivo: info
        ? `CNAE enquadrado na legislação de serviços hospitalares (peso ${info.peso}/3)${idx === 0 ? " — ATIVIDADE PRINCIPAL" : ""}.`
        : "Este CNAE não consta na lista de atividades elegíveis para equiparação hospitalar.",
    };
  });

  const elegiveis = cnaesAvaliados.filter(c => c.elegivel);
  const naoElegiveis = cnaesAvaliados.filter(c => !c.elegivel);

  // O CNAE principal elegível tem peso dobrado no score
  const cnaesParaScore = elegiveis.map(c => verificarCNAE(c.codigo)!);
  const pontuacao = calcularScore(cnaesParaScore);

  const nivelViabilidade: NivelViabilidade =
    pontuacao >= 75 ? "ALTA" :
    pontuacao >= 50 ? "MEDIA" :
    pontuacao >= 25 ? "BAIXA" : "INELEGIVEL";

  const justificativa = gerarJustificativa(dados, elegiveis, nivelViabilidade, pontuacao);
  const proximosPassos = gerarProximosPassos(nivelViabilidade);

  return {
    cnpj: dados.cnpj,
    razaoSocial: dados.razaoSocial,
    nivelViabilidade,
    pontuacao,
    cnaesElegiveis: elegiveis,
    cnaesNaoElegiveis: naoElegiveis,
    justificativa,
    proximosPasosRecomendados: proximosPassos,
    analisadoEm: new Date().toISOString(),
  };
}

function gerarJustificativa(
  dados: DadosCNPJ,
  elegiveis: CNAEAvaliado[],
  nivel: NivelViabilidade,
  pontuacao: number
): string {
  const nome = dados.nomeFantasia || dados.razaoSocial;

  if (nivel === "INELEGIVEL") {
    return `A empresa ${nome} não apresenta CNAEs compatíveis com a tese de equiparação hospitalar. ` +
      `A tese exige que a empresa preste serviços de natureza hospitalar — como clínicas, laboratórios, ` +
      `diagnóstico por imagem ou fisioterapia — conforme definido pelo STJ.`;
  }

  const descricaoElegiveis = elegiveis.map(c => `"${c.descricao}"`).join(", ");
  const qualificador = nivel === "ALTA" ? "forte" : nivel === "MEDIA" ? "moderada" : "baixa";

  return `A empresa ${nome} apresenta ${qualificador} viabilidade para a tese de equiparação hospitalar ` +
    `(pontuação: ${pontuacao}/100). ` +
    `Os seguintes CNAEs cadastrados são compatíveis com serviços de natureza hospitalar: ${descricaoElegiveis}. ` +
    `Isso indica que a empresa pode ter direito à redução da base de cálculo do IRPJ e da CSLL, ` +
    `pagando alíquota equivalente à de hospitais (8% sobre receita bruta para o IRPJ, em vez de 32%). ` +
    `Uma análise jurídica detalhada é necessária para confirmar o enquadramento.`;
}

function gerarProximosPassos(nivel: NivelViabilidade): string {
  if (nivel === "INELEGIVEL") {
    return "Com base nos CNAEs cadastrados, a aplicação direta da tese não é recomendada. " +
      "Porém, se os serviços prestados na prática são de natureza médico-hospitalar, pode haver " +
      "divergência entre o CNAE cadastrado e a atividade real — o que merece avaliação caso a caso.";
  }
  return "O próximo passo é uma análise documental completa: verificar as notas fiscais emitidas, " +
    "o contrato social e os laudos de serviços para confirmar o enquadramento e calcular o valor " +
    "passível de recuperação. Entre em contato com a equipe Bohac Med para uma consulta gratuita.";
}
