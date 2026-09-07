"use client";

import type { ResultadoAnalise, Nivel } from "@/types";
import { ROTULO_NATUREZA } from "@/lib/criterios/tipos";

/**
 * Componente único de parecer — usado pelas três modalidades.
 *
 * Sem semáforo verde/amarelo/vermelho e sem emoji: aquilo é gramática de
 * e-commerce e destoa de um documento que leva a marca de uma banca. O nível
 * aparece como rótulo tipográfico com fio dourado.
 */

const ROTULO: Record<Nivel, string> = {
  COMPORTA_ANALISE: "Comporta análise",
  REQUER_VERIFICACAO: "Requer verificação",
  NAO_COMPORTA: "Não comporta",
};

function dataExtenso(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatCNPJ(c: string) {
  return c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

export const ENCERRAMENTO_PARECER = {
  titulo: "Sobre o alcance desta verificação",
  corpo:
    "Esta análise é preliminar e se baseia exclusivamente nos dados cadastrais consultados. O enquadramento na equiparação hospitalar depende de elementos que somente a análise concreta apura.",
  destaque:
    "A análise documental individualizada é sempre relevante e eleva substancialmente o grau de precisão do resultado — inclusive nos casos em que a verificação preliminar não indicou enquadramento, já que o CNAE cadastrado pode divergir da atividade efetivamente exercida.",
};

export default function Parecer({ r }: { r: ResultadoAnalise }) {
  const inativa = r.situacao && r.situacao.toUpperCase() !== "ATIVA";
  const relevantes = r.cnaes.filter((c) => c.natureza !== "nenhum" || c.principal);
  const semRelacao = r.cnaes.filter((c) => c.natureza === "nenhum" && !c.principal);

  return (
    <article className="parecer print-content">
      {/* ── Identificação ── */}
      <header className="parecer__head print-no-break">
        <div className="parecer__meta">
          <span>Protocolo {r.protocolo}</span>
          <span>{dataExtenso(r.analisadoEm)}</span>
        </div>
        <h2 className="parecer__titulo">Parecer preliminar de enquadramento</h2>
        <p className="parecer__sub">Tese da equiparação hospitalar — verificação por CNAE</p>
      </header>

      <section className="parecer__ident print-no-break">
        <dl>
          <div><dt>Razão social</dt><dd>{r.razaoSocial || "—"}</dd></div>
          {r.nomeFantasia && <div><dt>Nome fantasia</dt><dd>{r.nomeFantasia}</dd></div>}
          <div><dt>CNPJ</dt><dd>{formatCNPJ(r.cnpj)}</dd></div>
          <div><dt>Situação cadastral</dt><dd className={inativa ? "parecer__alerta" : ""}>{r.situacao || "—"}</dd></div>
          {(r.municipio || r.uf) && <div><dt>Município</dt><dd>{[r.municipio, r.uf].filter(Boolean).join(" — ")}</dd></div>}
        </dl>
      </section>

      {inativa && (
        <p className="parecer__aviso print-no-break">
          A empresa não consta como <b>ATIVA</b> na base da Receita Federal. A situação cadastral
          precisa ser regularizada antes de qualquer discussão sobre enquadramento.
        </p>
      )}

      {/* ── Conclusão ── */}
      <section className={`parecer__nivel parecer__nivel--${r.nivel.toLowerCase()} print-no-break`}>
        <span className="parecer__nivel-rot">{ROTULO[r.nivel]}</span>
        <p className="parecer__abertura">{r.abertura}</p>
        <p className="parecer__motivo">{r.motivo}</p>
      </section>

      {/* ── Tabela de CNAEs ──
          As atividades sem relação com saúde entram como contagem, não linha a
          linha: numa holding com 25 CNAEs, listar software e consultoria afoga
          a informação que importa. */}
      <section className="parecer__bloco">
        <h3>Atividades registradas e sua classificação</h3>
        <table className="cnae-table">
          <thead>
            <tr>
              <th>CNAE</th><th>Descrição</th><th>Classificação</th><th>Fundamento</th>
            </tr>
          </thead>
          <tbody>
            {relevantes.map((c, i) => (
              <tr key={`${c.codigo}-${i}`} className={`nat-${c.natureza}`}>
                <td className="cnae-cod">
                  {c.codigo}
                  {c.principal && <span className="cnae-tag">principal</span>}
                </td>
                <td>{c.descricao}</td>
                <td className="cnae-nat">{ROTULO_NATUREZA[c.natureza]}</td>
                <td className="cnae-fund">{c.fundamento}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {semRelacao.length > 0 && (
          <p className="parecer__resto">
            A empresa registra ainda <b>{semRelacao.length}</b>{" "}
            {semRelacao.length === 1 ? "atividade" : "atividades"} sem relação com a área da
            saúde, que não interferem nesta verificação.
          </p>
        )}
      </section>

      {/* ── Fundamento ── */}
      <section className="parecer__bloco print-no-break">
        <h3>Fundamento normativo</h3>
        <ul className="parecer__lista">
          {r.fundamentos.map((f) => <li key={f}>{f}</li>)}
        </ul>
      </section>

      {/* ── Limites — o bloco que sustenta a confiança e protege o escritório ── */}
      <section className="parecer__bloco parecer__limites print-no-break">
        <h3>O que esta verificação não apurou</h3>
        <ul className="parecer__lista">
          {r.naoApurado.map((n) => <li key={n}>{n}</li>)}
        </ul>
      </section>

      {/* ── Encerramento fixo ── */}
      <section className="parecer__encerra print-no-break">
        <h3>{ENCERRAMENTO_PARECER.titulo}</h3>
        <p>{ENCERRAMENTO_PARECER.corpo}</p>
        <p className="parecer__encerra-destaque">{ENCERRAMENTO_PARECER.destaque}</p>
      </section>

      <p className="print-disclaimer">
        Documento de caráter informativo, nos termos do Provimento 205/2021 do Conselho Federal
        da OAB. Não constitui parecer jurídico definitivo nem oferta de serviços em relação a
        caso concreto. Fonte dos dados cadastrais: Receita Federal do Brasil, consultada em{" "}
        {dataExtenso(r.analisadoEm)}.
      </p>
    </article>
  );
}
