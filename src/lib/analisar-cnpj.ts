/**
 * Consulta o CNPJ na Brasil API e aplica os critérios da vertical.
 *
 * A classificação e as regras vivem em `lib/criterios/` — a mesma fonte que
 * alimenta o prompt da análise de notas fiscais. Antes eram duas listas
 * separadas, e por isso as modalidades davam respostas opostas para o mesmo
 * caso (consulta simples: elegível pelo CNAE, inelegível pela descrição).
 */

import type { DadosCNPJ, ResultadoAnalise, CNAEAvaliado } from "@/types";
import { CRITERIO_MED } from "./criterios/med";
import { avaliar, classificar } from "./criterios/motor";

const BRASIL_API = "https://brasilapi.com.br/api/cnpj/v1";

/** Validação de dígito verificador — antes um CNPJ malformado virava 500 da Receita. */
export function cnpjValido(cnpj: string): boolean {
  const n = cnpj.replace(/\D/g, "");
  if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false;
  const calc = (s: string, pesos: number[]) =>
    pesos.reduce((a, peso, i) => a + parseInt(s[i], 10) * peso, 0);
  const p1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const p2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = calc(n, p1) % 11;
  const d2 = calc(n, p2) % 11;
  return (d1 < 2 ? 0 : 11 - d1) === +n[12] && (d2 < 2 ? 0 : 11 - d2) === +n[13];
}

export async function consultarCNPJ(cnpj: string): Promise<DadosCNPJ> {
  const cnpjLimpo = cnpj.replace(/\D/g, "");
  if (!cnpjValido(cnpjLimpo)) {
    throw new Error("CNPJ inválido — verifique os dígitos informados.");
  }

  const res = await fetch(`${BRASIL_API}/${cnpjLimpo}`, {
    cache: "no-store",
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; BohacMed/1.0; +https://bohacmed.com.br)",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error("CNPJ não localizado na base da Receita Federal.");
    if (res.status === 429) throw new Error("Muitas consultas simultâneas. Aguarde alguns segundos e tente novamente.");
    throw new Error(`A base da Receita Federal não respondeu (HTTP ${res.status}). Tente novamente em instantes.`);
  }

  const data = await res.json();

  return {
    cnpj: cnpjLimpo,
    razaoSocial: data.razao_social ?? "",
    nomeFantasia: data.nome_fantasia ?? "",
    situacao: data.descricao_situacao_cadastral ?? "",
    cnaePrincipal: {
      codigo: data.cnae_fiscal ? formatarCodigoCNAE(String(data.cnae_fiscal)) : "",
      descricao: data.cnae_fiscal_descricao ?? "",
    },
    cnaesSecundarios: (data.cnaes_secundarios ?? []).map(
      (c: { codigo: number; descricao: string }) => ({
        codigo: formatarCodigoCNAE(String(c.codigo)),
        descricao: c.descricao,
      })
    ),
    municipio: data.municipio ?? "",
    uf: data.uf ?? "",
  };
}

function formatarCodigoCNAE(codigo: string): string {
  const s = codigo.padStart(7, "0");
  return `${s.slice(0, 4)}-${s[4]}/${s.slice(5)}`;
}

function gerarProtocolo(cnpj: string): string {
  const d = new Date();
  const data = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `BM-${data}-${cnpj.slice(-4)}`;
}

export function analisarViabilidade(dados: DadosCNPJ): ResultadoAnalise {
  const criterio = CRITERIO_MED;

  const classificados = [
    classificar(criterio, dados.cnaePrincipal.codigo, dados.cnaePrincipal.descricao, true),
    ...dados.cnaesSecundarios.map((c) => classificar(criterio, c.codigo, c.descricao, false)),
  ];

  const av = avaliar(criterio, classificados);

  const cnaes: CNAEAvaliado[] = av.classificados.map((c) => ({
    codigo: c.codigo,
    descricao: c.descricao,
    natureza: c.natureza,
    fundamento: c.fundamento,
    principal: c.principal,
  }));

  return {
    cnpj: dados.cnpj,
    razaoSocial: dados.razaoSocial,
    nomeFantasia: dados.nomeFantasia,
    situacao: dados.situacao,
    municipio: dados.municipio,
    uf: dados.uf,
    nivel: av.nivel,
    regraAplicada: av.regra,
    motivo: av.motivo,
    abertura: criterio.aberturas[av.nivel],
    cnaes,
    fundamentos: criterio.fundamentos,
    naoApurado: criterio.naoApurado,
    protocolo: gerarProtocolo(dados.cnpj),
    analisadoEm: new Date().toISOString(),
  };
}
