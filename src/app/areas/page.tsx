import type { Metadata } from "next";
import { BLOCOS, METODO } from "@/lib/areas-atuacao";
import { whatsappHref } from "@/lib/verticais";

export const metadata: Metadata = {
  title: "Áreas de atuação na clínica médica — Bohac Med",
  description:
    "Atuação jurídica integral para clínicas e serviços de saúde: licenciamento sanitário, processos éticos no CRM, responsabilidade civil, convênios e operadoras, LGPD e prontuário, telemedicina, trabalhista, societário e tributário.",
  openGraph: {
    title: "Áreas de atuação na clínica médica — Bohac Med",
    description:
      "Do alvará da vigilância ao contrato social, do prontuário à defesa no CRM: as frentes jurídicas de uma clínica, tratadas pela mesma banca.",
    type: "article",
  },
};

export default function AreasPage() {
  return (
    <>
      {/* ── BANDA ── */}
      <section className="areas-hero">
        <div className="areas-hero__bg" aria-hidden="true" />
        <div className="wrap areas-hero__inner">
          <span className="kicker on-navy reveal">Conceito omnijurídico</span>
          <h1 className="reveal" data-d="1">
            Tudo o que uma clínica precisa resolver fora da consulta
          </h1>
          <p className="areas-hero__lead reveal" data-d="2">
            O Bohac Med nasceu de uma tese tributária, mas não se limita a ela. A clínica
            médica é, ao mesmo tempo, um estabelecimento de saúde sujeito à vigilância
            sanitária, uma sociedade sujeita à Junta e ao Conselho, um empregador, um
            prestador de serviço ao consumidor e um controlador de dados sensíveis.
          </p>
        </div>
      </section>

      {/* ── INTRO ── */}
      <section className="areas-intro section-pad-tight">
        <div className="wrap">
          <div className="areas-intro__grid">
            <p className="reveal">
              Nenhuma dessas frentes existe isolada. O contrato assinado com o paciente é a
              primeira prova na ação de responsabilidade civil; a forma societária escolhida
              na abertura decide o regime tributário e a própria possibilidade de equiparação
              hospitalar; o prontuário mal preenchido é ao mesmo tempo infração ética,
              fragilidade processual e risco de incidente de segurança. Quando cada assunto é
              tratado por um profissional diferente, essas conexões se perdem — e reaparecem
              como custo.
            </p>
            <p className="reveal" data-d="1">
              O escritório atende a clínica inteira, no mesmo método consolidado no Direito
              Médico e replicado nas demais verticais do grupo: entender a rotina antes de
              redigir qualquer documento, organizar a estrutura enquanto ainda não há conflito,
              e conduzir a defesa quando ela for necessária, com os sócios acompanhando
              diretamente.
            </p>
          </div>
        </div>
      </section>

      {/* ── BLOCOS ── */}
      {BLOCOS.map((bloco, bi) => (
        <section
          key={bloco.id}
          id={bloco.id}
          className={`areas-bloco section-pad ${bi % 2 === 1 ? "areas-bloco--alt" : ""}`}
        >
          <div className="wrap">
            <div className="section-head reveal">
              <span className="kicker">Frente {String(bi + 1).padStart(2, "0")}</span>
              <h2>{bloco.titulo}</h2>
              <p className="lede">{bloco.intro}</p>
            </div>

            <div className="frentes">
              {bloco.frentes.map((f, i) => (
                <article className="frente reveal" data-d={String((i % 3) + 1)} key={f.id}>
                  <div className="frente__img">
                    {/* Imagens de atmosfera: arquitetura e objeto, sem pessoas
                        e sem texto — decorativas, por isso alt descritivo curto. */}
                    <img src={f.img} alt={f.alt} loading="lazy" width={900} height={600} />
                  </div>
                  <div className="frente__body">
                    <h3>{f.titulo}</h3>
                    <p>{f.texto}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ── MÉTODO ── */}
      <section className="areas-metodo section-pad">
        <div className="wrap">
          <div className="section-head center on-navy reveal">
            <span className="kicker on-navy center">Como trabalhamos</span>
            <h2>Método</h2>
          </div>
          <div className="metodo-grid">
            {METODO.map((m, i) => (
              <div className="metodo-item reveal" data-d={String(i + 1)} key={m.titulo}>
                <span className="metodo-item__n">{String(i + 1).padStart(2, "0")}</span>
                <h4>{m.titulo}</h4>
                <p>{m.texto}</p>
              </div>
            ))}
          </div>
          <p className="areas-declaracao reveal">
            A clínica é atendida por inteiro, ou não é atendida.
          </p>
        </div>
      </section>

      {/* ── CONTATO ── */}
      <section className="areas-cta section-pad">
        <div className="wrap">
          <div className="areas-cta__inner">
            <h2 className="reveal">Vamos conversar sobre a sua clínica</h2>
            <p className="reveal" data-d="1">
              Uma conversa inicial já indica onde estão os principais pontos de exposição e o
              que pode ser ajustado de imediato.
            </p>
            <div className="areas-cta__actions reveal" data-d="2">
              <a
                href={whatsappHref(
                  "Olá! Vim pela página de áreas de atuação do Bohac Med e gostaria de falar com o escritório."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--ghost btn-lg"
              >
                Falar com o escritório
              </a>
            </div>
            <p className="areas-cta__volta reveal" data-d="3">
              <a href="/#topo">
                A tese da equiparação hospitalar — verificar o enquadramento da clínica →
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
