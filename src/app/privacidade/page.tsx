import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";

export const metadata: Metadata = {
  title: "Política de Privacidade — Bohac Med",
  description: "Política de privacidade e proteção de dados do Bohac Med, em conformidade com a LGPD.",
};

export default function PrivacidadePage() {
  const atualizadoEm = "15 de junho de 2026";

  return (
    <main className="min-h-screen bg-cream font-sans text-bohac-dark">
      {/* Header */}
      <header className="bg-navy text-cream px-6 md:px-10 py-8 border-b border-gold/30">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-gold-light hover:text-cream text-xs uppercase tracking-widest transition-colors">
            ← Voltar ao início
          </Link>
          <Link href="/" aria-label="Voltar para a página inicial" className="flex items-center gap-3 mt-4 w-fit hover:opacity-80 transition-opacity">
            <BrandMark size={32} tone="onDark" />
            <h1 className="font-serif text-3xl font-light">Política de Privacidade</h1>
          </Link>
          <p className="text-gold-light/60 text-sm mt-1">Atualizada em {atualizadoEm}</p>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-12">

        {/* 1. Identificação do controlador */}
        <section className="mb-8">
          <h2 className="text-xl font-serif font-semibold text-bohac-dark mb-3">1. Identificação do Controlador</h2>
          <p className="text-mid leading-relaxed">
            A plataforma <strong>Bohac Med</strong>, acessível em{" "}
            <a href="https://bohacmed.com.br" className="text-gold-dark underline hover:text-gold transition-colors">bohacmed.com.br</a>, é
            operada pela <strong>Bohac Sociedade de Advogados</strong> (CNPJ 39.293.156/0001-43),
            com sede na Rua Emílio Mori, 426, Presidente Prudente/SP — CEP 19015-230. Para
            questões relacionadas à privacidade e proteção de dados, entre em contato pelo
            e-mail{" "}
            <a href="mailto:privacidade@bohacadvogados.com.br" className="text-gold-dark underline hover:text-gold transition-colors">
              privacidade@bohacadvogados.com.br
            </a>
            .
          </p>
        </section>

        {/* 2. Dados coletados */}
        <section className="mb-8">
          <h2 className="text-xl font-serif font-semibold text-bohac-dark mb-3">2. Quais Dados Coletamos</h2>
          <p className="text-mid leading-relaxed mb-3">
            Coletamos as seguintes categorias de dados, sempre com a finalidade específica
            de verificar a viabilidade da equiparação hospitalar:
          </p>

          <div className="space-y-4">
            <div className="bg-white border border-gold/20 p-4">
              <h3 className="font-serif font-semibold text-bohac-dark mb-1">2.1 Dados de identificação pessoal</h3>
              <p className="text-muted text-sm">
                Nome completo, endereço de e-mail e número de telefone/WhatsApp, fornecidos
                voluntariamente ao solicitar contato com a equipe jurídica.
              </p>
            </div>

            <div className="bg-white border border-gold/20 p-4">
              <h3 className="font-serif font-semibold text-bohac-dark mb-1">2.2 Dados empresariais (CNPJ e CNAEs)</h3>
              <p className="text-muted text-sm">
                Número do CNPJ fornecido pelo usuário. A partir dele, consultamos automaticamente
                a Receita Federal (API pública) para obter a razão social, atividades econômicas
                (CNAEs) e situação cadastral. Esses dados são utilizados exclusivamente para
                a análise de viabilidade e não são compartilhados com terceiros.
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 p-4">
              <h3 className="font-semibold text-orange-900 mb-1">
                2.3 Dados de Nota Fiscal Eletrônica (NF-e) — Dado Sensível Fiscal
              </h3>
              <p className="text-orange-800 text-sm leading-relaxed">
                Quando o usuário opta pela análise de NF-e, ele fornece <strong>voluntariamente</strong>{" "}
                a descrição dos serviços constantes em suas notas fiscais. Esses dados são
                processados em tempo real por um modelo de inteligência artificial (Anthropic Claude)
                <strong> apenas para determinar se os serviços descritos se enquadram na tese
                de equiparação hospitalar</strong>. O conteúdo das notas fiscais <strong>não é
                armazenado em nossos servidores</strong>; somente o resultado da análise
                (enquadrado/não enquadrado, nível de viabilidade e justificativa resumida)
                é salvo vinculado ao lead. Não coletamos: número da NF-e, valor, tomador,
                prestador, CFOP, ou qualquer dado que permita a identificação das operações
                comerciais específicas.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Finalidades e bases legais */}
        <section className="mb-8">
          <h2 className="text-xl font-serif font-semibold text-bohac-dark mb-3">
            3. Finalidades do Tratamento e Bases Legais (LGPD)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gold/20">
              <thead className="bg-cream-dark">
                <tr>
                  <th className="text-left px-4 py-2 text-bohac-dark font-serif font-semibold">Finalidade</th>
                  <th className="text-left px-4 py-2 text-bohac-dark font-serif font-semibold">Base Legal (LGPD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {[
                  ["Análise de viabilidade de equiparação hospitalar", "Art. 7º, II — execução de contrato a pedido do titular"],
                  ["Contato por WhatsApp para apresentação de proposta jurídica", "Art. 7º, I — consentimento (coletado no formulário de lead)"],
                  ["Melhoria e depuração da ferramenta de análise", "Art. 7º, IX — legítimo interesse do controlador"],
                  ["Cumprimento de obrigações legais e regulatórias (ex: guarda de registros)", "Art. 7º, II — cumprimento de obrigação legal"],
                ].map(([fin, base]) => (
                  <tr key={fin} className="bg-white">
                    <td className="px-4 py-2 text-mid">{fin}</td>
                    <td className="px-4 py-2 text-muted">{base}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Compartilhamento */}
        <section className="mb-8">
          <h2 className="text-xl font-serif font-semibold text-bohac-dark mb-3">4. Compartilhamento de Dados</h2>
          <p className="text-mid leading-relaxed mb-3">
            Não vendemos, alugamos ou comercializamos seus dados pessoais. O compartilhamento
            ocorre somente com os seguintes <strong>operadores</strong> contratados, que tratam
            dados apenas sob nossas instruções:
          </p>
          <ul className="list-disc list-inside space-y-2 text-mid text-sm">
            <li>
              <strong>Supabase Inc.</strong> (banco de dados em nuvem) — armazenamento
              dos leads e resultados de análise, com servidores nos EUA sob cláusulas
              contratuais padrão.
            </li>
            <li>
              <strong>Vercel Inc.</strong> (hospedagem da aplicação) — processamento das
              requisições HTTP da plataforma.
            </li>
            <li>
              <strong>Anthropic, PBC</strong> (modelo de IA) — recebe o texto da NF-e
              para análise de enquadramento; não retém os dados após o processamento,
              conforme{" "}
              <a
                href="https://www.anthropic.com/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-dark underline hover:text-gold transition-colors"
              >
                Política de Privacidade da Anthropic
              </a>
              .
            </li>
            <li>
              <strong>Meta Platforms Ireland Ltd.</strong> (WhatsApp Cloud API) — envio
              de mensagens de WhatsApp para o número fornecido pelo titular.
            </li>
          </ul>
        </section>

        {/* 5. Retenção */}
        <section className="mb-8">
          <h2 className="text-xl font-serif font-semibold text-bohac-dark mb-3">5. Prazo de Retenção</h2>
          <p className="text-mid leading-relaxed">
            Os dados de identificação e o resultado da análise são retidos por{" "}
            <strong>5 (cinco) anos</strong> a partir da coleta, prazo compatível com a
            prescrição de obrigações civis e com as exigências de guarda de registros eletrônicos
            previstas no Marco Civil da Internet (Lei nº 12.965/2014, art. 15). Após esse prazo,
            os dados são anonimizados ou excluídos de forma segura.
          </p>
        </section>

        {/* 6. Direitos dos titulares */}
        <section className="mb-8">
          <h2 className="text-xl font-serif font-semibold text-bohac-dark mb-3">
            6. Direitos dos Titulares de Dados
          </h2>
          <p className="text-mid leading-relaxed mb-3">
            Em conformidade com o art. 18 da LGPD (Lei nº 13.709/2018), você tem direito a:
          </p>
          <ul className="list-disc list-inside space-y-1 text-mid text-sm">
            <li>Confirmar a existência de tratamento dos seus dados;</li>
            <li>Acessar seus dados;</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
            <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários;</li>
            <li>Solicitar a portabilidade dos dados a outro fornecedor de serviço;</li>
            <li>Revogar o consentimento a qualquer momento;</li>
            <li>Peticionar à Autoridade Nacional de Proteção de Dados (ANPD).</li>
          </ul>
          <p className="text-mid text-sm mt-3">
            Para exercer qualquer desses direitos, envie solicitação para{" "}
            <a href="mailto:privacidade@bohacadvogados.com.br" className="text-gold-dark underline hover:text-gold transition-colors">
              privacidade@bohacadvogados.com.br
            </a>
            . Responderemos em até 15 dias corridos.
          </p>
        </section>

        {/* 7. Segurança */}
        <section className="mb-8">
          <h2 className="text-xl font-serif font-semibold text-bohac-dark mb-3">7. Segurança dos Dados</h2>
          <p className="text-mid leading-relaxed">
            Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados,
            incluindo: transmissão criptografada via HTTPS/TLS 1.3, controle de acesso por
            funções no banco de dados (Row Level Security), e restrição de acesso ao painel
            administrativo por autenticação. Em caso de incidente de segurança que possa
            acarretar risco ou dano relevante aos titulares, notificaremos a ANPD e os
            afetados no prazo legal.
          </p>
        </section>

        {/* 8. Cookies */}
        <section className="mb-8">
          <h2 className="text-xl font-serif font-semibold text-bohac-dark mb-3">8. Cookies</h2>
          <p className="text-mid leading-relaxed">
            Esta plataforma utiliza apenas cookies estritamente necessários para o funcionamento
            da sessão. Não utilizamos cookies de rastreamento, publicidade ou analytics de
            terceiros.
          </p>
        </section>

        {/* 9. Alterações */}
        <section className="mb-8">
          <h2 className="text-xl font-serif font-semibold text-bohac-dark mb-3">9. Alterações desta Política</h2>
          <p className="text-mid leading-relaxed">
            Reservamo-nos o direito de atualizar esta Política periodicamente. Alterações
            relevantes serão comunicadas pelo e-mail cadastrado ou por aviso na plataforma
            com antecedência mínima de 30 dias.
          </p>
        </section>

        {/* Rodapé */}
        <div className="border-t border-gold/20 pt-6 mt-10 text-xs text-muted">
          <p>
            Bohac Sociedade de Advogados · CNPJ 39.293.156/0001-43 ·{" "}
            <Link href="/termos" className="text-gold-dark underline hover:text-gold transition-colors">Termos de Uso</Link>
          </p>
        </div>
      </article>
    </main>
  );
}
