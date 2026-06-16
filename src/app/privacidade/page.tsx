import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade — Bohac Med",
  description: "Política de privacidade e proteção de dados do Bohac Med, em conformidade com a LGPD.",
};

export default function PrivacidadePage() {
  const atualizadoEm = "15 de junho de 2026";

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white px-6 py-4">
        <Link href="/" className="text-blue-300 hover:text-white text-sm">
          ← Voltar ao início
        </Link>
        <h1 className="text-2xl font-bold mt-2">Política de Privacidade</h1>
        <p className="text-blue-300 text-sm">Atualizada em {atualizadoEm}</p>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-10 prose prose-gray">

        {/* 1. Identificação do controlador */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. Identificação do Controlador</h2>
          <p className="text-gray-700 leading-relaxed">
            A plataforma <strong>Bohac Med</strong>, acessível em{" "}
            <a href="https://bohacmed.com.br" className="text-blue-700">bohacmed.com.br</a>, é
            operada pela <strong>Bohac Sociedade de Advogados</strong> (CNPJ 39.293.156/0001-43),
            com sede na Rua Emílio Mori, 426, Presidente Prudente/SP — CEP 19015-230. Para
            questões relacionadas à privacidade e proteção de dados, entre em contato pelo
            e-mail{" "}
            <a href="mailto:privacidade@bohacadvogados.com.br" className="text-blue-700">
              privacidade@bohacadvogados.com.br
            </a>
            .
          </p>
        </section>

        {/* 2. Dados coletados */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. Quais Dados Coletamos</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Coletamos as seguintes categorias de dados, sempre com a finalidade específica
            de verificar a viabilidade da equiparação hospitalar:
          </p>

          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-1">2.1 Dados de identificação pessoal</h3>
              <p className="text-gray-600 text-sm">
                Nome completo, endereço de e-mail e número de telefone/WhatsApp, fornecidos
                voluntariamente ao solicitar contato com a equipe jurídica.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-1">2.2 Dados empresariais (CNPJ e CNAEs)</h3>
              <p className="text-gray-600 text-sm">
                Número do CNPJ fornecido pelo usuário. A partir dele, consultamos automaticamente
                a Receita Federal (API pública) para obter a razão social, atividades econômicas
                (CNAEs) e situação cadastral. Esses dados são utilizados exclusivamente para
                a análise de viabilidade e não são compartilhados com terceiros.
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
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
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            3. Finalidades do Tratamento e Bases Legais (LGPD)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-2 text-gray-700">Finalidade</th>
                  <th className="text-left px-4 py-2 text-gray-700">Base Legal (LGPD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["Análise de viabilidade de equiparação hospitalar", "Art. 7º, II — execução de contrato a pedido do titular"],
                  ["Contato por WhatsApp para apresentação de proposta jurídica", "Art. 7º, I — consentimento (coletado no formulário de lead)"],
                  ["Melhoria e depuração da ferramenta de análise", "Art. 7º, IX — legítimo interesse do controlador"],
                  ["Cumprimento de obrigações legais e regulatórias (ex: guarda de registros)", "Art. 7º, II — cumprimento de obrigação legal"],
                ].map(([fin, base]) => (
                  <tr key={fin} className="bg-white">
                    <td className="px-4 py-2 text-gray-700">{fin}</td>
                    <td className="px-4 py-2 text-gray-500">{base}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Compartilhamento */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Compartilhamento de Dados</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Não vendemos, alugamos ou comercializamos seus dados pessoais. O compartilhamento
            ocorre somente com os seguintes <strong>operadores</strong> contratados, que tratam
            dados apenas sob nossas instruções:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
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
                className="text-blue-700"
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
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Prazo de Retenção</h2>
          <p className="text-gray-700 leading-relaxed">
            Os dados de identificação e o resultado da análise são retidos por{" "}
            <strong>5 (cinco) anos</strong> a partir da coleta, prazo compatível com a
            prescrição de obrigações civis e com as exigências de guarda de registros eletrônicos
            previstas no Marco Civil da Internet (Lei nº 12.965/2014, art. 15). Após esse prazo,
            os dados são anonimizados ou excluídos de forma segura.
          </p>
        </section>

        {/* 6. Direitos dos titulares */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            6. Direitos dos Titulares de Dados
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Em conformidade com o art. 18 da LGPD (Lei nº 13.709/2018), você tem direito a:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
            <li>Confirmar a existência de tratamento dos seus dados;</li>
            <li>Acessar seus dados;</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
            <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários;</li>
            <li>Solicitar a portabilidade dos dados a outro fornecedor de serviço;</li>
            <li>Revogar o consentimento a qualquer momento;</li>
            <li>Peticionar à Autoridade Nacional de Proteção de Dados (ANPD).</li>
          </ul>
          <p className="text-gray-700 text-sm mt-3">
            Para exercer qualquer desses direitos, envie solicitação para{" "}
            <a href="mailto:privacidade@bohacadvogados.com.br" className="text-blue-700">
              privacidade@bohacadvogados.com.br
            </a>
            . Responderemos em até 15 dias corridos.
          </p>
        </section>

        {/* 7. Segurança */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">7. Segurança dos Dados</h2>
          <p className="text-gray-700 leading-relaxed">
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
          <h2 className="text-xl font-bold text-gray-900 mb-3">8. Cookies</h2>
          <p className="text-gray-700 leading-relaxed">
            Esta plataforma utiliza apenas cookies estritamente necessários para o funcionamento
            da sessão. Não utilizamos cookies de rastreamento, publicidade ou analytics de
            terceiros.
          </p>
        </section>

        {/* 9. Alterações */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">9. Alterações desta Política</h2>
          <p className="text-gray-700 leading-relaxed">
            Reservamo-nos o direito de atualizar esta Política periodicamente. Alterações
            relevantes serão comunicadas pelo e-mail cadastrado ou por aviso na plataforma
            com antecedência mínima de 30 dias.
          </p>
        </section>

        {/* Rodapé */}
        <div className="border-t border-gray-200 pt-6 mt-8 text-xs text-gray-400">
          <p>
            Bohac Sociedade de Advogados · CNPJ 39.293.156/0001-43 ·{" "}
            <Link href="/termos" className="text-blue-600">Termos de Uso</Link>
          </p>
        </div>
      </article>
    </main>
  );
}
