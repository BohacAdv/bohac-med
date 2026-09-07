import type { Metadata } from "next";
import Link from "next/link";
import { whatsappHref } from "@/lib/verticais";

export const metadata: Metadata = {
  title: "A Tese da Equiparação Hospitalar — Análise Técnica | Bohac Med",
  description:
    "Fundamento legal, critérios de enquadramento, via administrativa e via judicial da equiparação hospitalar. Análise técnica com base na Lei 9.249/1995 e SC COSIT n° 100/2013.",
};

const WA_URL =
  whatsappHref("Olá! Gostaria de saber mais sobre a equiparação hospitalar.");

/* ── Componente de âncora de seção ── */
function SectionAnchor({ id }: { id: string }) {
  return <span id={id} style={{ scrollMarginTop: "80px", display: "block" }} />;
}

/* ── Badge de citação legal ── */
function LegalBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: "rgba(174,129,103,0.1)",
        border: "1px solid rgba(174,129,103,0.35)",
        color: "#8a6348",
        fontSize: 12.5,
        fontWeight: 600,
        letterSpacing: "0.06em",
        padding: "3px 9px",
        fontFamily: "var(--mono, monospace)",
      }}
    >
      {children}
    </span>
  );
}

export default function TesePage() {
  return (
    <>
      {/* ── HEADER SIMPLIFICADO ── */}

      {/* ── HERO DA PÁGINA ── */}
      <section
        style={{
          background: "var(--navy, var(--navy))",
          padding: "170px 0 3.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="wrap" style={{ maxWidth: 820 }}>
          <span
            className="kicker on-navy"
            style={{ marginBottom: "1rem", display: "block" }}
          >
            Análise técnica
          </span>
          <h1
            style={{
              fontFamily: "var(--sans)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "var(--cream, #f5f0e8)",
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: "1.25rem",
            }}
          >
            A Tese da Equiparação Hospitalar
          </h1>
          <p
            style={{
              fontSize: "clamp(1rem, 1.8vw, 1.15rem)",
              color: "rgba(245,240,232,0.65)",
              lineHeight: 1.75,
              maxWidth: 680,
              marginBottom: "2rem",
            }}
          >
            Fundamento legal, requisitos objetivos de enquadramento, limites de
            aplicação, vias de implementação e recuperação retroativa — análise
            com base na Lei 9.249/1995, na Lei 11.727/2008 e no julgamento do
            STJ no REsp 1.116.399/BA (Tema 217 dos recursos repetitivos).
          </p>
          {/* Índice rápido */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              fontSize: 14,
            }}
          >
            {[
              ["#o-que-e", "O que é"],
              ["#arcabouco-normativo", "Arcabouço normativo"],
              ["#criterios", "Critérios"],
              ["#nao-se-aplica", "Quem não se enquadra"],
              ["#calculo", "O cálculo"],
              ["#via-administrativa", "Via administrativa"],
              ["#via-judicial", "Via judicial"],
              ["#precedentes", "Precedentes"],
              ["#retroativo", "Recuperação retroativa"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                style={{
                  color: "rgba(174,129,103,0.85)",
                  textDecoration: "none",
                  border: "1px solid rgba(174,129,103,0.25)",
                  padding: "4px 10px",
                  letterSpacing: "0.04em",
                  transition: "border-color 0.15s",
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CORPO DA PÁGINA ── */}
      <main style={{ background: "var(--paper, #f5f0e8)", minHeight: "60vh" }}>
        <div
          className="wrap"
          style={{ maxWidth: 820, padding: "3.5rem 1.5rem 5rem" }}
        >

          {/* ── 1. O QUE É ── */}
          <SectionAnchor id="o-que-e" />
          <article style={sectionStyle}>
            <SectionHeader
              n="01"
              title="O que é a equiparação hospitalar"
            />
            <p style={bodyText}>
              A <strong>equiparação hospitalar</strong> é a aplicação dos
              percentuais de presunção de <strong>8%</strong> (IRPJ) e{" "}
              <strong>12%</strong> (CSLL) sobre a receita bruta de prestadores
              de serviços de saúde enquadrados no Lucro Presumido — em
              substituição ao percentual padrão de <strong>32%</strong>{" "}
              aplicável a prestadores de serviços em geral.
            </p>
            <p style={bodyText}>
              Não se trata de benefício fiscal ou isenção. É a alíquota
              legalmente correta para quem presta serviços de natureza
              hospitalar. A aplicação do percentual de 32% a essas atividades
              representa recolhimento de tributos acima do legalmente devido —
              sujeito a restituição ou compensação dentro do prazo de cinco anos (art. 168 do CTN).
            </p>
            <Callout>
              A tese não cria um direito novo. Ela aplica o direito já existente
              à situação concreta do contribuinte. A maioria das clínicas paga a
              mais por desconhecimento, não por ausência de direito.
            </Callout>
          </article>

          <Divider />

          {/* ── 2. ARCABOUÇO NORMATIVO ── */}
          <SectionAnchor id="arcabouco-normativo" />
          <article style={sectionStyle}>
            <SectionHeader
              n="02"
              title="Arcabouço normativo"
            />
            <p style={bodyText}>
              A hierarquia normativa que sustenta a tese é a seguinte:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8, marginBottom: 24 }}>
              <NormCard
                badge="Lei 9.249/1995 — art. 15, §1°, III, 'a'"
                title="Fonte primária — IRPJ"
                body="Reduz o percentual de presunção do IRPJ de 32% para 8% para 'serviços hospitalares'. É a norma originária, vigente desde janeiro de 1996. Toda a construção jurisprudencial parte deste dispositivo."
              />
              <NormCard
                badge="Lei 9.249/1995 — art. 20, §1°"
                title="Fonte primária — CSLL"
                body="Aplica, para fins de CSLL (Contribuição Social sobre o Lucro Líquido), lógica equivalente: o percentual de presunção cai de 32% para 12% para as mesmas atividades hospitalares. CSLL não é imposto — é contribuição de competência da União."
              />
              <NormCard
                badge="Lei 11.727/2008 — requisitos cumulativos"
                title="Requisitos legais — sociedade empresária e ANVISA"
                body="A Lei 11.727/2008 alterou os arts. 15 e 20 da Lei 9.249/1995 e acrescentou dois requisitos cumulativos: a prestadora deve estar organizada sob a forma de sociedade empresária e atender às normas da ANVISA. Clínicas constituídas como sociedade simples, registradas em Cartório de Registro Civil de Pessoas Jurídicas, não preenchem o primeiro requisito enquanto não houver transformação do tipo societário."
              />
              <NormCard
                badge="STJ — REsp 1.116.399/BA (Tema 217)"
                title="Alcance fixado em recurso repetitivo"
                body="Julgado sob o rito dos repetitivos, o REsp 1.116.399/BA firmou que 'serviços hospitalares' são aqueles ligados às atividades desenvolvidas pelos hospitais, voltados diretamente à promoção da saúde — sem exigir internação noturna ou leitos. O mesmo julgado excluiu expressamente as simples consultas médicas. A disciplina administrativa consta da IN RFB 1.700/2017."
              />
            </div>

            <p style={{ ...bodyText, color: "var(--muted, #6b7280)", fontSize: 15 }}>
              <strong>Observação terminológica:</strong> O conjunto formado por
              IRPJ e CSLL é denominado, tecnicamente, de{" "}
              <em>tributos</em> (gênero). O IRPJ é imposto; a CSLL é
              contribuição. Referências genéricas a "impostos" para designar
              ambos são tecnicamente incorretas.
            </p>
          </article>

          <Divider />

          {/* ── 3. CRITÉRIOS ── */}
          <SectionAnchor id="criterios" />
          <article style={sectionStyle}>
            <SectionHeader
              n="03"
              title="Critérios objetivos de enquadramento"
            />
            <p style={bodyText}>
              Com base na SC COSIT n° 100/2013 e na jurisprudência do STJ, o
              enquadramento requer o cumprimento cumulativo dos seguintes
              requisitos:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, margin: "20px 0" }}>
              {[
                {
                  title: "Regime tributário: Lucro Presumido",
                  body: "A tese é exclusiva do Lucro Presumido. No Lucro Real, a tributação é calculada sobre o lucro efetivo, não sobre percentuais de presunção — a discussão não se aplica. No Simples Nacional, o regime é incompatível.",
                },
                {
                  title: "CNAE compatível com serviços hospitalares",
                  body: "O CNAE principal (e/ou secundários) deve corresponder a atividades de saúde de natureza hospitalar. A análise é casuística: o mesmo CNAE pode ou não qualificar dependendo da estrutura e dos serviços efetivamente prestados.",
                },
                {
                  title: "Estrutura e serviços análogos aos de um hospital",
                  body: "A SC COSIT n° 100/2013 exige que a entidade disponha de estrutura material e de pessoal compatível com a prestação de serviços hospitalares. Não é necessário internação noturna ou leitos, mas é necessário que a atividade envolva atendimento clínico presencial em ambiente adequado.",
                },
                {
                  title: "Prestação direta de serviços ao paciente",
                  body: "A atividade deve ser de prestação direta de serviços de saúde — não meramente administrativa, de gestão ou consultiva.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    borderLeft: "3px solid #ae8167",
                    paddingLeft: "1rem",
                    paddingTop: 4,
                    paddingBottom: 4,
                  }}
                >
                  <p style={{ fontWeight: 700, fontSize: 16, margin: "0 0 4px", color: "var(--dark, #1a1a2e)" }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize: 16, margin: 0, color: "var(--mid, #4b5563)", lineHeight: 1.75 }}>
                    {item.body}
                  </p>
                </div>
              ))}
            </div>

            <p style={{ ...bodyText, fontWeight: 600, marginTop: 8 }}>
              Atividades que tipicamente se enquadram:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
              {[
                "Cirurgia ambulatorial",
                "Diagnóstico por imagem (US, TC, RM, PET-CT)",
                "Hemodiálise",
                "Quimioterapia e radioterapia",
                "Pronto-atendimento / UPA",
                "Endoscopia e colonoscopia",
                "Day Hospital / Day Clinic",
                "Procedimentos em centro cirúrgico",
                "Laboratórios com infraestrutura complexa",
              ].map((item) => (
                <span
                  key={item}
                  style={{
                    background: "rgba(174,129,103,0.1)",
                    border: "1px solid rgba(174,129,103,0.3)",
                    color: "#6b4c36",
                    fontSize: 14,
                    padding: "4px 10px",
                    fontWeight: 500,
                  }}
                >
                  ✓ {item}
                </span>
              ))}
            </div>
            <p style={{ ...bodyText, fontSize: 15, color: "var(--muted, #6b7280)" }}>
              A lista não é taxativa. O enquadramento deve ser verificado caso a caso, com análise dos CNAEs, da estrutura física e dos serviços efetivamente prestados.
            </p>
          </article>

          <Divider />

          {/* ── 4. QUEM NÃO SE ENQUADRA ── */}
          <SectionAnchor id="nao-se-aplica" />
          <article style={sectionStyle}>
            <SectionHeader
              n="04"
              title="Quem não se enquadra — limites da tese"
            />
            <p style={bodyText}>
              Transparência sobre os limites da tese é tão importante quanto
              seu fundamento. Os seguintes casos estão <strong>fora do escopo</strong>:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, margin: "20px 0" }}>
              {[
                {
                  title: "Empresas no Simples Nacional",
                  body: "O Simples Nacional é regime próprio, com alíquotas unificadas progressivas. O percentual de presunção de 8%/12% não se aplica — a tributação segue as tabelas do Anexo III ou V da LC 123/2006.",
                },
                {
                  title: "Empresas no Lucro Real",
                  body: "No Lucro Real, o IRPJ e a CSLL incidem sobre o lucro contábil ajustado, não sobre presunção de receita. A discussão sobre percentual de presunção é irrelevante nesse regime.",
                },
                {
                  title: "Consulta médica exclusivamente ambulatorial",
                  body: "A prestação de serviços de consulta médica simples, sem estrutura e procedimentos hospitalares, não satisfaz os critérios da SC COSIT n° 100/2013. O percentual aplicável para clínicas de consulta pura é de 32%.",
                },
                {
                  title: "Serviços administrativos e de gestão em saúde",
                  body: "Empresas que prestam serviços de gestão hospitalar, administração de planos de saúde, ou consultoria — sem atendimento direto ao paciente — não se enquadram no conceito de 'serviços hospitalares'.",
                },
                {
                  title: "Telemedicina e teleconsulta exclusivas",
                  body: "A atividade exclusivamente remota não preenche o requisito estrutural da SC COSIT 100/2013. A questão é ainda incipiente na jurisprudência, com poucas manifestações administrativas específicas.",
                },
                {
                  title: "Serviços odontológicos",
                  body: "A odontologia possui regime próprio de presunção. A equiparação hospitalar do art. 15, §1°, III, 'a' da Lei 9.249/1995 não se aplica indistintamente à odontologia — exige análise específica do enquadramento CNAE.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    borderLeft: "3px solid rgba(12,36,56,0.25)",
                    paddingLeft: "1rem",
                    paddingTop: 4,
                    paddingBottom: 4,
                  }}
                >
                  <p style={{ fontWeight: 700, fontSize: 16, margin: "0 0 4px", color: "var(--dark, #1a1a2e)" }}>
                    ✗ {item.title}
                  </p>
                  <p style={{ fontSize: 16, margin: 0, color: "var(--mid, #4b5563)", lineHeight: 1.75 }}>
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <Divider />

          {/* ── 5. O CÁLCULO ── */}
          <SectionAnchor id="calculo" />
          <article style={sectionStyle}>
            <SectionHeader
              n="05"
              title="Como funciona o cálculo — exemplo numérico"
            />
            <p style={bodyText}>
              O impacto da equiparação se dá na <strong>base de cálculo presumida</strong> do IRPJ e da CSLL, não diretamente nas alíquotas nominais desses tributos. O exemplo abaixo usa receita bruta anual de{" "}
              <strong>R$ 1.000.000,00</strong> para uma empresa no Lucro Presumido, apuração trimestral:
            </p>

            {/* Tabela comparativa */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                margin: "24px 0",
              }}
            >
              {/* Sem equiparação */}
              <div
                style={{
                  background: "rgba(12,36,56,0.05)",
                  border: "1px solid rgba(12,36,56,0.12)",
                  padding: "1.25rem 1.25rem 1rem",
                }}
              >
                <p
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(12,36,56,0.5)",
                    marginBottom: 12,
                  }}
                >
                  Sem equiparação (32%)
                </p>
                {[
                  ["Receita bruta anual", "R$ 1.000.000"],
                  ["Base IRPJ (32%)", "R$ 320.000"],
                  ["IRPJ — 15% s/ base", "R$ 48.000"],
                  ["IRPJ adicional — 10% s/ excedente¹", "R$ 8.000"],
                  ["Total IRPJ", "R$ 56.000"],
                  ["Base CSLL (32%)", "R$ 320.000"],
                  ["CSLL — 9% s/ base", "R$ 28.800"],
                  ["Total CSLL", "R$ 28.800"],
                ].map(([label, value], i) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      padding: "5px 0",
                      borderTop: i === 4 || i === 7 ? "1px solid rgba(12,36,56,0.12)" : undefined,
                      fontWeight: i === 4 || i === 7 ? 700 : 400,
                      fontSize: 15,
                      color: "var(--dark, #1a1a2e)",
                    }}
                  >
                    <span style={{ color: i === 4 || i === 7 ? "var(--dark)" : "var(--mid, #4b5563)" }}>{label}</span>
                    <span>{value}</span>
                  </div>
                ))}
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: "2px solid rgba(12,36,56,0.2)",
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 800,
                    fontSize: 17,
                    color: "var(--dark)",
                  }}
                >
                  <span>IRPJ + CSLL total</span>
                  <span>R$ 84.800</span>
                </div>
              </div>

              {/* Com equiparação */}
              <div
                style={{
                  background: "rgba(174,129,103,0.06)",
                  border: "1px solid rgba(174,129,103,0.35)",
                  padding: "1.25rem 1.25rem 1rem",
                }}
              >
                <p
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#ae8167",
                    marginBottom: 12,
                  }}
                >
                  Com equiparação (8% / 12%)
                </p>
                {[
                  ["Receita bruta anual", "R$ 1.000.000"],
                  ["Base IRPJ (8%)", "R$ 80.000"],
                  ["IRPJ — 15% s/ base", "R$ 12.000"],
                  ["IRPJ adicional — 10% s/ excedente¹", "—"],
                  ["Total IRPJ", "R$ 12.000"],
                  ["Base CSLL (12%)", "R$ 120.000"],
                  ["CSLL — 9% s/ base", "R$ 10.800"],
                  ["Total CSLL", "R$ 10.800"],
                ].map(([label, value], i) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      padding: "5px 0",
                      borderTop: i === 4 || i === 7 ? "1px solid rgba(174,129,103,0.2)" : undefined,
                      fontWeight: i === 4 || i === 7 ? 700 : 400,
                      fontSize: 15,
                      color: "var(--dark, #1a1a2e)",
                    }}
                  >
                    <span style={{ color: i === 4 || i === 7 ? "var(--dark)" : "var(--mid, #4b5563)" }}>{label}</span>
                    <span>{value}</span>
                  </div>
                ))}
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: "2px solid #ae8167",
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 800,
                    fontSize: 17,
                    color: "#ae8167",
                  }}
                >
                  <span>IRPJ + CSLL total</span>
                  <span>R$ 22.800</span>
                </div>
              </div>
            </div>

            {/* Resultado */}
            <div
              style={{
                background: "var(--navy, var(--navy))",
                color: "var(--cream, #f5f0e8)",
                padding: "1.25rem 1.5rem",
                display: "flex",
                flexWrap: "wrap",
                gap: "2rem",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p style={{ fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.5, margin: "0 0 4px" }}>Economia anual</p>
                <p style={{ fontSize: 28, fontWeight: 800, margin: 0, color: "#ae8167" }}>R$ 62.000</p>
              </div>
              <div>
                <p style={{ fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.5, margin: "0 0 4px" }}>Redução na carga tributária</p>
                <p style={{ fontSize: 28, fontWeight: 800, margin: 0, color: "#ae8167" }}>73%</p>
              </div>
              <div>
                <p style={{ fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.5, margin: "0 0 4px" }}>Recuperação retroativa (5 anos)</p>
                <p style={{ fontSize: 28, fontWeight: 800, margin: 0, color: "#ae8167" }}>até R$ 310.000</p>
              </div>
            </div>
            <p style={{ ...bodyText, fontSize: 14, color: "var(--muted, #6b7280)", marginTop: 8 }}>
              ¹ O IRPJ adicional de 10% incide sobre a parcela da base de cálculo que exceder R$ 240.000/ano (R$ 20.000/mês). Com equiparação, a base de R$ 80.000 não atinge o limite — o adicional deixa de incidir. Os valores são estimativas com base em receita bruta uniforme, sem deduções. O cálculo real pode variar conforme a apuração trimestral.
            </p>
          </article>

          <Divider />

          {/* ── 6. VIA ADMINISTRATIVA ── */}
          <SectionAnchor id="via-administrativa" />
          <article style={sectionStyle}>
            <SectionHeader
              n="06"
              title="Via administrativa"
            />
            <p style={bodyText}>
              A via administrativa compreende dois momentos distintos: a
              aplicação prospectiva (para frente) e a recuperação retroativa
              (para os períodos anteriores). Ambos ocorrem sem necessidade de
              propositura de ação judicial.
            </p>

            <h3 style={subheadStyle}>6.1 Aplicação prospectiva</h3>
            <p style={bodyText}>
              Uma vez confirmado o enquadramento, a empresa simplesmente passa a
              aplicar o percentual de presunção correto (8% IRPJ / 12% CSLL) na
              próxima apuração trimestral. A DCTF (Declaração de Débitos e
              Créditos Tributários Federais) e o DARF são preenchidos com os
              valores apurados sob o novo percentual.
            </p>
            <p style={bodyText}>
              É recomendável que essa mudança seja sustentada por{" "}
              <strong>laudo técnico ou parecer jurídico</strong> documentando o
              enquadramento, de modo a amparar a empresa em eventual
              fiscalização pela Receita Federal.
            </p>

            <h3 style={subheadStyle}>6.2 Recuperação retroativa — PER/DCOMP</h3>
            <p style={bodyText}>
              Para os períodos anteriores, a recuperação do indébito tributário
              se dá por meio do{" "}
              <strong>
                PER/DCOMP (Pedido Eletrônico de Restituição/Declaração de
                Compensação)
              </strong>{" "}
              , previsto no art. 74 da Lei 9.430/1996. O contribuinte apresenta
              o pedido via e-CAC (Centro Virtual de Atendimento ao Contribuinte)
              e pode:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "16px 0 20px 16px" }}>
              {[
                "Solicitar a restituição do valor em espécie, com correção pela taxa SELIC;",
                "Compensar o crédito com outros tributos federais vincendos (IRPJ, CSLL, PIS, COFINS, contribuições previdenciárias).",
              ].map((item) => (
                <p key={item} style={{ fontSize: 16, color: "var(--mid, #4b5563)", margin: 0, lineHeight: 1.75 }}>
                  → {item}
                </p>
              ))}
            </div>
            <p style={bodyText}>
              O prazo de homologação pela Receita Federal é de até 5 anos. Se
              indeferido, o contribuinte pode recorrer ao{" "}
              <strong>CARF (Conselho Administrativo de Recursos Fiscais)</strong>{" "}
              e, posteriormente, ao Judiciário — sem perda do prazo
              do art. 168 do CTN original.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "20px 0" }}>
              <div style={{ background: "rgba(22,163,74,0.07)", border: "1px solid rgba(22,163,74,0.2)", padding: "1rem" }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: "#15803d", marginBottom: 8 }}>Vantagens</p>
                {["Menor custo (sem honorários advocatícios de êxito judiciais)", "Processo mais rápido se a RF homologar", "Possibilidade de compensação imediata com tributos devidos", "Sem necessidade de propositura de ação judicial"].map(v => (
                  <p key={v} style={{ fontSize: 15, color: "#166534", margin: "4px 0", lineHeight: 1.5 }}>✓ {v}</p>
                ))}
              </div>
              <div style={{ background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.15)", padding: "1rem" }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: "#b91c1c", marginBottom: 8 }}>Limitações</p>
                {["Sujeito a auditoria e possível indeferimento pela RF", "Sem coisa julgada — RF pode questionar futuramente", "Demora no processamento do PER/DCOMP (até 5 anos)", "Exige retificação das DIRPJ/DCTF dos exercícios anteriores"].map(v => (
                  <p key={v} style={{ fontSize: 15, color: "#991b1b", margin: "4px 0", lineHeight: 1.5 }}>✗ {v}</p>
                ))}
              </div>
            </div>
          </article>

          <Divider />

          {/* ── 7. VIA JUDICIAL ── */}
          <SectionAnchor id="via-judicial" />
          <article style={sectionStyle}>
            <SectionHeader
              n="07"
              title="Via judicial"
            />
            <p style={bodyText}>
              A via judicial pode ser utilizada tanto em substituição à via
              administrativa quanto em complemento a ela — especialmente quando
              o PER/DCOMP é indeferido pela Receita Federal ou quando a empresa
              necessita de segurança jurídica definitiva (coisa julgada).
            </p>

            <h3 style={subheadStyle}>7.1 Ação de repetição de indébito</h3>
            <p style={bodyText}>
              Prevista nos arts. 165 a 169 do CTN, a ação de repetição de
              indébito é o instrumento judicial padrão para recuperação de
              tributos recolhidos indevidamente ou a maior. O contribuinte
              pleiteia:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "16px 0 20px 16px" }}>
              {[
                "Declaração do direito ao percentual de presunção reduzido;",
                "Condenação da União à restituição dos valores pagos a maior nos últimos 5 anos;",
                "Correção pelo índice SELIC (Tema STJ n° 905 e RE 1.346.152 — incidência de SELIC como índice único de atualização do indébito tributário).",
              ].map((item) => (
                <p key={item} style={{ fontSize: 16, color: "var(--mid, #4b5563)", margin: 0, lineHeight: 1.75 }}>
                  → {item}
                </p>
              ))}
            </div>

            <h3 style={subheadStyle}>7.2 Ação declaratória com pedido de repetição</h3>
            <p style={bodyText}>
              Em muitos casos, combina-se o pedido declaratório (reconhecimento
              do direito ao enquadramento) com o pedido condenatório
              (restituição do passado). Isso permite que a sentença produza{" "}
              <strong>coisa julgada material</strong> — impedindo que a Receita
              Federal questione o enquadramento em exercícios futuros.
            </p>

            <h3 style={subheadStyle}>7.3 Mandado de Segurança preventivo</h3>
            <p style={bodyText}>
              O Mandado de Segurança é adequado quando o contribuinte pretende
              assegurar preventivamente o direito de aplicar o percentual
              reduzido, antes de eventual autuação fiscal. O prazo decadencial
              para o MS é de 120 dias contados do ato coator — o que torna seu
              uso mais restrito no contexto da recuperação retroativa, mas
              relevante para a segurança prospectiva do enquadramento.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "20px 0" }}>
              <div style={{ background: "rgba(22,163,74,0.07)", border: "1px solid rgba(22,163,74,0.2)", padding: "1rem" }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: "#15803d", marginBottom: 8 }}>Vantagens</p>
                {["Coisa julgada material — segurança jurídica definitiva", "Correção pela SELIC sobre todo o período", "Proteção contra autuações futuras pelo mesmo fundamento", "Adequado quando PER/DCOMP é indeferido"].map(v => (
                  <p key={v} style={{ fontSize: 15, color: "#166534", margin: "4px 0", lineHeight: 1.5 }}>✓ {v}</p>
                ))}
              </div>
              <div style={{ background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.15)", padding: "1rem" }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: "#b91c1c", marginBottom: 8 }}>Limitações</p>
                {["Prazo: 3 a 10+ anos dependendo da Vara e do Tribunal", "Honorários advocatícios e custas processuais", "Risco de improcedência se os critérios não forem atendidos", "Requer representação por advogado habilitado"].map(v => (
                  <p key={v} style={{ fontSize: 15, color: "#991b1b", margin: "4px 0", lineHeight: 1.5 }}>✗ {v}</p>
                ))}
              </div>
            </div>

            <Callout>
              <strong>Qual via escolher?</strong> Em regra, recomenda-se iniciar
              pela via administrativa (PER/DCOMP), que é mais ágil e menos
              custosa. A via judicial é prioritária quando: (a) o PER/DCOMP é
              indeferido; (b) os valores envolvidos justificam o custo do
              litígio; (c) o contribuinte necessita de coisa julgada para
              segurança em exercícios futuros; ou (d) o prazo do art. 168 do CTN para
              alguns períodos está próximo de se expirar.
            </Callout>
          </article>

          <Divider />

          {/* ── 8. PRECEDENTES ── */}
          <SectionAnchor id="precedentes" />
          <article style={sectionStyle}>
            <SectionHeader
              n="08"
              title="Posicionamentos e precedentes"
            />

            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 16 }}>
              <PrecedentCard
                fonte="Receita Federal do Brasil"
                badge="SC COSIT n° 100/2013"
                body="A Solução de Consulta COSIT n° 100/2013 é o ato mais relevante para a definição administrativa dos critérios de enquadramento. A Receita Federal estabeleceu que 'serviços hospitalares' são aqueles prestados em estabelecimento com estrutura e serviços análogos aos de um hospital, realizando atendimento ao paciente. A exigência de internação noturna foi expressamente afastada como requisito obrigatório. O documento vincula as unidades da RF por todo o território nacional."
              />
              <PrecedentCard
                fonte="Superior Tribunal de Justiça — STJ"
                badge="Jurisprudência pacificada — 1ª e 2ª Turmas"
                body="O STJ consolidou o entendimento de que o conceito de 'serviços hospitalares' para fins do percentual de presunção do Lucro Presumido deve ser interpretado de forma objetiva, com foco na natureza dos serviços prestados e na estrutura da entidade. A Corte afastou a interpretação restritiva que exigia internação noturna ou leitos, reconhecendo que clínicas e centros de diagnóstico com estrutura adequada se enquadram no benefício. O critério é funcional — o que importa é o que a entidade faz e como faz, não a denominação que ostenta."
              />
              <PrecedentCard
                fonte="CARF — Conselho Administrativo de Recursos Fiscais"
                badge="Instância administrativa recursal"
                body="O CARF tem produzido acórdãos relevantes sobre os critérios de enquadramento, com análise casuística da compatibilidade entre o CNAE declarado, a estrutura física da empresa e os serviços efetivamente prestados. As decisões do CARF não têm efeito vinculante universal, mas formam precedentes relevantes para a análise administrativa e influenciam o contencioso judicial. A análise documental (alvarás, habilitações junto a órgãos regulatórios, descrição de serviços em notas fiscais) é determinante nos julgamentos."
              />
            </div>
          </article>

          <Divider />

          {/* ── 9. RECUPERAÇÃO RETROATIVA ── */}
          <SectionAnchor id="retroativo" />
          <article style={sectionStyle}>
            <SectionHeader
              n="09"
              title="Recuperação retroativa — prazo e procedimento"
            />
            <p style={bodyText}>
              O direito à restituição ou compensação de tributos recolhidos a
              maior extingue-se em{" "}
              <strong>5 anos contados da data do recolhimento</strong>, nos
              termos do art. 168, I do CTN. Para tributos lançados por
              homologação (como IRPJ e CSLL no Lucro Presumido), o prazo é
              contado do pagamento antecipado.
            </p>
            <p style={bodyText}>
              Na prática, a empresa pode recuperar os valores recolhidos a maior
              nos <strong>últimos 5 anos</strong> — não importa quando ela tomou
              conhecimento da tese. O prazo é objetivo.
            </p>
            <p style={bodyText}>
              O procedimento envolve:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "16px 0 20px 0" }}>
              {[
                { n: "1.", text: "Levantamento dos recolhimentos de IRPJ e CSLL dos últimos 5 anos (extrato do e-CAC ou DCTF);" },
                { n: "2.", text: "Cálculo do indébito — diferença entre o que foi recolhido (presunção de 32%) e o que deveria ter sido recolhido (presunção de 8%/12%);" },
                { n: "3.", text: "Retificação das DIRPJ (Declaração de Informações Econômico-Fiscais da Pessoa Jurídica) e DCTF dos exercícios correspondentes;" },
                { n: "4.", text: "Transmissão do PER/DCOMP via e-CAC, ou ajuizamento da ação de repetição de indébito." },
              ].map(({ n, text }) => (
                <div key={n} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontWeight: 800, color: "#ae8167", fontSize: 16, minWidth: 20, marginTop: 2 }}>{n}</span>
                  <p style={{ fontSize: 16, color: "var(--mid, #4b5563)", margin: 0, lineHeight: 1.75 }}>{text}</p>
                </div>
              ))}
            </div>
            <Callout>
              A correção dos valores recuperados é feita pela{" "}
              <strong>taxa SELIC</strong> (art. 39, §4° da Lei 9.250/1995),
              acumulada desde a data de cada recolhimento. Não há incidência de
              IRPJ sobre os juros de mora calculados pela SELIC em repetição de
              indébito tributário — posição pacificada no STJ (Tema 962) e
              confirmada pelo STF (Tema 962/STF).
            </Callout>
          </article>

          <Divider />

          {/* ── CTA DISCRETO ── */}
          <div
            style={{
              background: "var(--navy, var(--navy))",
              padding: "2.5rem 2rem",
              textAlign: "center",
              marginTop: "2rem",
            }}
          >
            <p
              style={{
                fontSize: 14,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(245,240,232,0.4)",
                marginBottom: "0.75rem",
              }}
            >
              Bohac Med · Bohac Advogados Associados
            </p>
            <h3
              style={{
                fontFamily: "var(--sans)",
                color: "var(--cream, #f5f0e8)",
                fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              A análise de elegibilidade é gratuita e sem compromisso
            </h3>
            <p
              style={{
                color: "rgba(245,240,232,0.55)",
                fontSize: 16,
                lineHeight: 1.75,
                maxWidth: 500,
                margin: "0 auto 2rem",
              }}
            >
              O enquadramento depende da análise do CNAE, do regime tributário
              e da estrutura de serviços. Verificamos gratuitamente se a tese é
              aplicável à sua situação concreta.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                justifyContent: "center",
              }}
            >
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener"
                className="btn btn--gold btn-lg"
              >
                Falar com especialista pelo WhatsApp
              </a>
              <Link href="/#topo" className="btn btn--ghost-light btn-lg">
                Verificar meu CNPJ gratuitamente
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* ── FOOTER SIMPLIFICADO ── */}
      <footer
        style={{
          background: "var(--navy, var(--navy))",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "1.5rem 0",
          textAlign: "center",
        }}
      >
        <div className="wrap">
          <p style={{ fontSize: 14, color: "rgba(245,240,232,0.3)", margin: 0 }}>
            © {new Date().getFullYear()} Bohac Advogados Associados · OAB/SP ·{" "}
            <a
              href="mailto:contato@bohac.com.br"
              style={{ color: "rgba(245,240,232,0.4)" }}
            >
              contato@bohac.com.br
            </a>{" "}
            ·{" "}
            <a
              href={whatsappHref("Olá! Vim pela análise técnica da tese.")}
              target="_blank"
              rel="noopener"
              style={{ color: "rgba(245,240,232,0.4)" }}
            >
              (18) 3222-6245
            </a>
          </p>
          <p style={{ fontSize: 12.5, color: "rgba(245,240,232,0.18)", margin: "6px 0 0" }}>
            Este conteúdo tem caráter informativo e não constitui parecer
            jurídico. A análise de elegibilidade deve ser realizada caso a caso
            por profissional habilitado.
          </p>
        </div>
      </footer>
    </>
  );
}

/* ── Componentes internos ── */

function SectionHeader({ n, title }: { n: string; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: "1.25rem" }}>
      <span
        style={{
          fontFamily: "var(--mono, monospace)",
          fontSize: 12.5,
          fontWeight: 700,
          color: "#ae8167",
          opacity: 0.8,
          marginTop: 6,
          minWidth: 24,
        }}
      >
        {n}
      </span>
      <h2
        style={{
          fontFamily: "var(--sans)",
          fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
          color: "var(--dark, #1a1a2e)",
          fontWeight: 700,
          lineHeight: 1.2,
          margin: 0,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        borderLeft: "3px solid #ae8167",
        background: "rgba(174,129,103,0.07)",
        padding: "1rem 1.25rem",
        margin: "20px 0",
        fontSize: 16,
        color: "var(--dark, #1a1a2e)",
        lineHeight: 1.75,
      }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return (
    <hr
      style={{
        border: "none",
        borderTop: "1px solid rgba(12,36,56,0.1)",
        margin: "2.5rem 0",
      }}
    />
  );
}

function NormCard({
  badge,
  title,
  body,
}: {
  badge: string;
  title: string;
  body: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(12,36,56,0.08)",
        padding: "1.1rem 1.25rem",
      }}
    >
      <LegalBadge>{badge}</LegalBadge>
      <p
        style={{
          fontWeight: 700,
          fontSize: 16,
          margin: "8px 0 4px",
          color: "var(--dark, #1a1a2e)",
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontSize: 15,
          color: "var(--mid, #4b5563)",
          margin: 0,
          lineHeight: 1.75,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function PrecedentCard({
  fonte,
  badge,
  body,
}: {
  fonte: string;
  badge: string;
  body: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(12,36,56,0.08)",
        padding: "1.25rem",
      }}
    >
      <p
        style={{
          fontSize: 12.5,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "rgba(12,36,56,0.4)",
          margin: "0 0 8px",
        }}
      >
        {fonte}
      </p>
      <LegalBadge>{badge}</LegalBadge>
      <p
        style={{
          fontSize: 16,
          color: "var(--mid, #4b5563)",
          margin: "12px 0 0",
          lineHeight: 1.75,
        }}
      >
        {body}
      </p>
    </div>
  );
}

/* ── Estilos compartilhados ── */
const sectionStyle: React.CSSProperties = {
  marginBottom: "0.5rem",
};

const bodyText: React.CSSProperties = {
  fontSize: 17,
  lineHeight: 1.75,
  color: "var(--mid, #374151)",
  margin: "0 0 1rem",
};

const subheadStyle: React.CSSProperties = {
  fontFamily: "var(--sans)",
  fontSize: "1.05rem",
  fontWeight: 700,
  color: "var(--dark, #1a1a2e)",
  margin: "1.5rem 0 0.5rem",
};
