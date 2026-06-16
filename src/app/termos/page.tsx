import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";

export const metadata: Metadata = {
  title: "Termos de Uso — Bohac Med",
  description: "Termos e condições de uso da plataforma Bohac Med.",
};

export default function TermosPage() {
  const atualizadoEm = "15 de junho de 2026";

  return (
    <main className="min-h-screen bg-cream font-sans text-bohac-dark">
      {/* Header */}
      <header className="bg-navy text-cream px-6 md:px-10 py-8 border-b border-gold/30">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-gold-light hover:text-cream text-xs uppercase tracking-widest transition-colors">
            ← Voltar ao início
          </Link>
          <div className="flex items-center gap-3 mt-4">
            <BrandMark size={32} tone="onDark" />
            <h1 className="font-serif text-3xl font-light">Termos de Uso</h1>
          </div>
          <p className="text-gold-light/60 text-sm mt-1">Atualizados em {atualizadoEm}</p>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-12">

        <p className="text-mid mb-8 leading-relaxed">
          Estes Termos de Uso ("Termos") regem o acesso e a utilização da plataforma{" "}
          <strong>Bohac Med</strong> (<a href="https://bohacmed.com.br" className="text-gold-dark underline hover:text-gold transition-colors">
            bohacmed.com.br
          </a>
          ), operada pela <strong>Bohac Sociedade de Advogados</strong> (CNPJ 39.293.156/0001-43).
          Ao utilizar a plataforma, você concorda com estes Termos. Caso não concorde, não
          utilize o serviço.
        </p>

        {/* 1. Objeto */}
        <section className="mb-8">
          <h2 className="text-xl font-serif font-semibold text-bohac-dark mb-3">1. Objeto da Plataforma</h2>
          <p className="text-mid leading-relaxed">
            O Bohac Med é uma ferramenta de <strong>triagem informativa</strong> que permite a
            médicos, dentistas, clínicas e empresas da área da saúde verificar preliminarmente
            se sua atividade econômica pode se enquadrar na tese jurídica-tributária de{" "}
            <em>equiparação hospitalar</em> para fins de redução das alíquotas de IRPJ e CSLL,
            com base nos critérios do STJ e da Receita Federal.
          </p>
        </section>

        {/* 2. Natureza do serviço */}
        <section className="mb-8">
          <h2 className="text-xl font-serif font-semibold text-bohac-dark mb-3">
            2. Natureza Informativa — Não Configura Consultoria Jurídica
          </h2>
          <div className="bg-yellow-50 border border-yellow-200 p-4 mb-4">
            <p className="text-yellow-900 text-sm leading-relaxed font-medium">
              ⚠️ O resultado gerado pelo Bohac Med é uma análise preliminar e automatizada,
              elaborada com base em dados cadastrais públicos e/ou descrições fornecidas pelo
              próprio usuário. <strong>Não constitui, em nenhuma hipótese, parecer jurídico,
              consultoria tributária ou opinião legal</strong>.
            </p>
          </div>
          <p className="text-mid leading-relaxed">
            A avaliação definitiva sobre a viabilidade da tese de equiparação hospitalar
            depende da análise aprofundada dos documentos, contratos, notas fiscais e demais
            elementos específicos de cada caso, a ser realizada por profissional habilitado
            da Bohac Sociedade de Advogados. A plataforma serve exclusivamente como instrumento
            de triagem para identificar casos que merecem análise jurídica aprofundada.
          </p>
        </section>

        {/* 3. Cadastro e lead */}
        <section className="mb-8">
          <h2 className="text-xl font-serif font-semibold text-bohac-dark mb-3">3. Cadastro e Contato</h2>
          <p className="text-mid leading-relaxed mb-3">
            Ao preencher o formulário de contato, o usuário:
          </p>
          <ul className="list-disc list-inside space-y-1 text-mid text-sm">
            <li>
              Autoriza expressamente o recebimento de contato por WhatsApp e e-mail da equipe
              da Bohac Sociedade de Advogados para fins de apresentação de proposta de serviços;
            </li>
            <li>
              Declara que as informações fornecidas são verdadeiras e de sua responsabilidade;
            </li>
            <li>
              Confirma que está ciente de que o resultado da análise automática é preliminar
              e não vincula juridicamente as partes.
            </li>
          </ul>
          <p className="text-mid text-sm mt-3">
            O usuário pode solicitar a interrupção do contato a qualquer momento respondendo
            "PARAR" via WhatsApp ou enviando e-mail para{" "}
            <a href="mailto:privacidade@bohacadvogados.com.br" className="text-gold-dark underline hover:text-gold transition-colors">
              privacidade@bohacadvogados.com.br
            </a>
            .
          </p>
        </section>

        {/* 4. Uso das NF-e */}
        <section className="mb-8">
          <h2 className="text-xl font-serif font-semibold text-bohac-dark mb-3">
            4. Fornecimento de Dados de Nota Fiscal Eletrônica
          </h2>
          <p className="text-mid leading-relaxed mb-3">
            A funcionalidade de análise de NF-e permite que o usuário insira, voluntariamente,
            a <em>descrição dos serviços</em> constante em suas notas fiscais para análise de
            enquadramento. Ao utilizar essa funcionalidade, o usuário:
          </p>
          <ul className="list-disc list-inside space-y-1 text-mid text-sm">
            <li>
              Confirma que possui autorização para compartilhar o conteúdo das notas fiscais
              inseridas (seja como emitente ou tomador do serviço);
            </li>
            <li>
              Está ciente de que o texto será processado por um modelo de inteligência artificial
              (Anthropic Claude) para fins exclusivos de classificação de enquadramento;
            </li>
            <li>
              Compreende que <strong>não deve inserir dados que permitam a identificação de
              terceiros</strong> (pacientes, tomadores), números de NF-e, valores ou quaisquer
              informações além da descrição do serviço prestado.
            </li>
          </ul>
        </section>

        {/* 5. Responsabilidades */}
        <section className="mb-8">
          <h2 className="text-xl font-serif font-semibold text-bohac-dark mb-3">5. Responsabilidades</h2>

          <h3 className="font-serif font-semibold text-bohac-dark mb-2">5.1 Do Usuário</h3>
          <p className="text-mid text-sm leading-relaxed mb-4">
            O usuário é responsável pela veracidade das informações fornecidas, pelo uso adequado
            da plataforma e por não utilizar o serviço para fins ilícitos, fraudulentos ou
            contrários aos presentes Termos.
          </p>

          <h3 className="font-serif font-semibold text-bohac-dark mb-2">5.2 Da Bohac Sociedade de Advogados</h3>
          <p className="text-mid text-sm leading-relaxed">
            A Bohac empreende esforços razoáveis para manter a plataforma disponível e os
            algoritmos de análise atualizados com a jurisprudência vigente. Contudo, não se
            responsabiliza por: (i) decisões tomadas com base exclusivamente no resultado
            automático da análise; (ii) indisponibilidades temporárias do serviço; (iii)
            imprecisões decorrentes de dados incorretos fornecidos pelo usuário; (iv) mudanças
            legislativas ou jurisprudenciais supervenientes que alterem os critérios de
            enquadramento.
          </p>
        </section>

        {/* 6. Propriedade intelectual */}
        <section className="mb-8">
          <h2 className="text-xl font-serif font-semibold text-bohac-dark mb-3">6. Propriedade Intelectual</h2>
          <p className="text-mid leading-relaxed">
            Todo o conteúdo da plataforma — incluindo textos, lógica de análise, interface,
            código-fonte e marca Bohac Med — é de propriedade exclusiva da Bohac Sociedade de
            Advogados e está protegido pela Lei nº 9.610/1998 (Lei de Direitos Autorais) e
            legislação aplicável. É vedada a reprodução, distribuição ou criação de obras
            derivadas sem autorização prévia e expressa.
          </p>
        </section>

        {/* 7. Legislação */}
        <section className="mb-8">
          <h2 className="text-xl font-serif font-semibold text-bohac-dark mb-3">
            7. Legislação Aplicável e Foro
          </h2>
          <p className="text-mid leading-relaxed">
            Estes Termos são regidos pelas leis brasileiras, incluindo a Lei nº 13.709/2018
            (LGPD), a Lei nº 12.965/2014 (Marco Civil da Internet) e o Código de Defesa do
            Consumidor (Lei nº 8.078/1990). Fica eleito o foro da comarca de Presidente
            Prudente/SP para dirimir quaisquer controvérsias, com renúncia a qualquer outro,
            por mais privilegiado que seja.
          </p>
        </section>

        {/* 8. Contato */}
        <section className="mb-8">
          <h2 className="text-xl font-serif font-semibold text-bohac-dark mb-3">8. Contato</h2>
          <p className="text-mid leading-relaxed">
            Dúvidas, solicitações ou reclamações podem ser dirigidas a:{" "}
            <a href="mailto:contato@bohacadvogados.com.br" className="text-gold-dark underline hover:text-gold transition-colors">
              contato@bohacadvogados.com.br
            </a>{" "}
            ou pelo WhatsApp disponível na plataforma.
          </p>
        </section>

        {/* Rodapé */}
        <div className="border-t border-gold/20 pt-6 mt-10 text-xs text-muted">
          <p>
            Bohac Sociedade de Advogados · CNPJ 39.293.156/0001-43 ·{" "}
            <Link href="/privacidade" className="text-gold-dark underline hover:text-gold transition-colors">Política de Privacidade</Link>
          </p>
        </div>
      </article>
    </main>
  );
}
