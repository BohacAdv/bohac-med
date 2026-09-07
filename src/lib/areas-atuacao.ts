/**
 * Frentes de atuação do escritório na clínica médica.
 * Tom editorial espelhado nas verticais do site principal (verticals.js):
 * prosa densa, norma nomeada, sem superlativo e sem promessa de resultado.
 */
export type Frente = {
  id: string;
  titulo: string;
  texto: string;
  img: string;
  alt: string;
};

export type Bloco = {
  id: string;
  titulo: string;
  intro: string;
  frentes: Frente[];
};

export const BLOCOS: Bloco[] = [
  {
    id: "ato-medico",
    titulo: "O ato médico e sua defesa",
    intro:
      "A frente mais antiga do escritório: o que acontece quando o atendimento é questionado — pelo Conselho, pelo paciente ou pelo Estado.",
    frentes: [
      {
        id: "crm",
        titulo: "Processos éticos no CRM",
        texto:
          "Representação em sindicância e em processo ético-profissional perante o Conselho Regional de Medicina, da defesa prévia ao recurso no CFM, sob o Código de Ética Médica (Resolução CFM 2.217/2018). A denúncia costuma chegar antes da ação judicial e define o terreno em que ela será discutida — o que se declara ao Conselho não se desfaz depois.",
        img: "/areas/crm.webp",
        alt: "Corredor administrativo vazio com portas de madeira escura",
      },
      {
        id: "responsabilidade",
        titulo: "Responsabilidade civil médica",
        texto:
          "Defesa em ações de alegado erro médico, com leitura técnica do prontuário, acompanhamento de perícia e discussão da natureza da obrigação assumida. A responsabilidade do profissional liberal depende de culpa comprovada (art. 14, §4º do CDC), e é na documentação do atendimento que essa discussão se ganha ou se perde.",
        img: "/areas/responsabilidade.webp",
        alt: "Mesa de perícia com lupa, régua e pastas fechadas",
      },
      {
        id: "prontuario",
        titulo: "Prontuário, consentimento e documentação clínica",
        texto:
          "Estruturação do prontuário e dos termos de consentimento livre e esclarecido, guarda e digitalização de registros (Resoluções CFM 1.638/2002 e 1.821/2007) e resposta a requisições por paciente, Conselho, perito e autoridade judicial. O prazo de guarda e a forma da entrega não são detalhe administrativo: são a condição da defesa.",
        img: "/areas/prontuario.webp",
        alt: "Arquivo deslizante de aço com gavetas fechadas em penumbra",
      },
      {
        id: "criminal",
        titulo: "Repercussão criminal do ato médico",
        texto:
          "Acompanhamento em inquérito e ação penal decorrentes do exercício profissional — lesão corporal culposa, omissão, atestado ou laudo inverídico, exercício ilegal da medicina e imputações de fraude em faturamento a operadoras. É a frente que menos se espera e a que exige atuação mais imediata, porque começa fora do controle da clínica.",
        img: "/areas/criminal.webp",
        alt: "Portal de pedra e degraus gastos de fórum antigo",
      },
    ],
  },
  {
    id: "estabelecimento",
    titulo: "A clínica como estabelecimento de saúde",
    intro:
      "Antes de ser empresa, a clínica é um estabelecimento sujeito à vigilância sanitária. É a frente que mais surpreende quem abriu o consultório sem assessoria.",
    frentes: [
      {
        id: "licenciamento",
        titulo: "Licenciamento e regularidade do estabelecimento",
        texto:
          "Abertura e regularização perante a vigilância sanitária municipal, adequação da planta física às exigências da RDC ANVISA 50/2002, cadastro no CNES, inscrição da pessoa jurídica no Conselho Regional de Medicina e designação de diretor e responsável técnico (Resolução CFM 2.147/2016). São também os requisitos que sustentam, no plano tributário, a condição de prestadora que atende às normas da ANVISA.",
        img: "/areas/licenciamento.webp",
        alt: "Fachada modernista de concreto com marquise, sem placas",
      },
      {
        id: "fiscalizacao",
        titulo: "Fiscalização sanitária e defesa em autuações",
        texto:
          "Acompanhamento de inspeção, resposta a termo de intimação e defesa em processo administrativo sanitário, na esfera federal (Lei 6.437/1977) e perante os códigos sanitários estaduais e municipais. A interdição cautelar de sala ou equipamento produz efeito imediato sobre a agenda, o que torna o prazo de defesa mais curto do que o do processo.",
        img: "/areas/fiscalizacao.webp",
        alt: "Portas duplas de aço inox fechadas ao fim de um corredor vazio",
      },
      {
        id: "residuos",
        titulo: "Resíduos, radiação e insumos controlados",
        texto:
          "Plano de gerenciamento de resíduos de serviços de saúde (RDC ANVISA 222/2018 e Resolução CONAMA 358/2005), programa de proteção radiológica em radiodiagnóstico (RDC ANVISA 611/2022) e escrituração de medicamentos sujeitos a controle especial (Portaria SVS/MS 344/1998 e SNGPC). Três exigências que raramente aparecem no planejamento da clínica e sempre aparecem na inspeção.",
        img: "/areas/residuos.webp",
        alt: "Contêineres cilíndricos alinhados sobre piso epóxi",
      },
      {
        id: "telemedicina",
        titulo: "Telemedicina e prescrição eletrônica",
        texto:
          "Estruturação do atendimento a distância sob a Lei 14.510/2022 e a Resolução CFM 2.314/2022 — termo de consentimento próprio, registro em prontuário, guarda da gravação quando houver, prescrição com assinatura em certificado ICP-Brasil e contratos com plataformas. A modalidade mudou o formato da consulta, não o regime de responsabilidade.",
        img: "/areas/telemedicina.webp",
        alt: "Cabo de rede saindo de conduíte metálico em parede de concreto",
      },
    ],
  },
  {
    id: "empresa",
    titulo: "A clínica como empresa",
    intro:
      "A estrutura societária decide o regime tributário, a governança entre sócios e — no caso da equiparação hospitalar — a própria possibilidade de enquadramento.",
    frentes: [
      {
        id: "societario",
        titulo: "Societário e sucessório da clínica",
        texto:
          "Constituição e transformação do tipo societário, acordo entre sócios, entrada e saída do quadro, apuração de haveres e a sucessão do médico titular — holding, doação com reserva de usufruto e planejamento de ITCMD. A escolha entre sociedade simples e sociedade empresária não é formalidade de cartório: define registro, governança e regime de tributação.",
        img: "/areas/societario.webp",
        alt: "Livro de atas encadernado em couro sobre mesa de nogueira",
      },
      {
        id: "trabalhista",
        titulo: "Trabalhista e formação da equipe",
        texto:
          "Modelagem da contratação de médicos, plantonistas e equipe de apoio, discussão de vínculo e de contratação por pessoa jurídica, jornada e escala, adicional de insalubridade, obrigações de saúde e segurança próprias dos serviços de saúde (NR-32), piso da enfermagem e defesa em reclamatórias. A forma como a equipe é contratada é o passivo mais previsível e o menos previsto de uma clínica.",
        img: "/areas/trabalhista.webp",
        alt: "Fileira de armários de vestiário em aço claro",
      },
      {
        id: "convenios",
        titulo: "Convênios, operadoras e glosas",
        texto:
          "Credenciamento e descredenciamento, discussão de glosas, revisão de tabelas e reajuste, cláusulas impostas por operadoras e regras da Agência Nacional de Saúde Suplementar. Inclui uma verificação que costuma passar despercebida: pacotes, mensalidades e cartões de desconto oferecidos pela própria clínica podem configurar operação de plano de saúde sem registro na ANS, nos termos da Lei 9.656/1998.",
        img: "/areas/convenios.webp",
        alt: "Pilha de guias de papel presas por clipe metálico",
      },
      {
        id: "tributario",
        titulo: "Tributário além da equiparação",
        texto:
          "Enquadramento de regime, ISS e definição do município competente (LC 116/2003), retenções na fonte sobre serviços prestados a pessoas jurídicas, PIS/COFINS e defesa em autuação. Inclui a leitura da reforma tributária — Emenda Constitucional 132/2023 e legislação complementar — e do que a redução de alíquota prevista para serviços de saúde muda na formação de preço da clínica ao longo da transição.",
        img: "/areas/tributario.webp",
        alt: "Papel contínuo com colunas de cifras desfocadas",
      },
    ],
  },
  {
    id: "dados",
    titulo: "Dados, imagem e relações institucionais",
    intro:
      "Prontuário é o dado mais sensível que uma empresa brasileira pode guardar. E a reputação da clínica é regulada por norma do Conselho, não só pelo mercado.",
    frentes: [
      {
        id: "lgpd",
        titulo: "LGPD e dados de saúde",
        texto:
          "Adequação da clínica ao tratamento de dado pessoal sensível (art. 11 da Lei 13.709/2018): base legal para cada finalidade, contratos com operadores e plataformas de prontuário eletrônico, política de retenção compatível com os prazos do CFM, nomeação de encarregado e resposta a incidente de segurança perante a ANPD e os titulares.",
        img: "/areas/lgpd.webp",
        alt: "Rack de servidores atrás de portas de vidro escuro",
      },
      {
        id: "publicidade",
        titulo: "Publicidade médica e reputação",
        texto:
          "Adequação da divulgação à Resolução CFM 2.336/2023 e ao Código de Defesa do Consumidor, uso de imagem de paciente e de resultado de procedimento, conduta em redes sociais e em anúncios pagos, e resposta a avaliações difamatórias, com pedido de remoção ou retificação quando cabível. A norma do Conselho é mais restritiva do que a prática do mercado — e a fiscalização parte, quase sempre, de denúncia de concorrente.",
        img: "/areas/publicidade.webp",
        alt: "Placa de latão escovado sem inscrição em parede de travertino",
      },
      {
        id: "contratos",
        titulo: "Contratos, imóvel, marca e expansão",
        texto:
          "Contrato de prestação de serviços ao paciente, contratos com fornecedores e laboratórios, locação do imóvel e ação renovatória, adequações de acessibilidade e obra, registro da marca da clínica no INPI e estruturação de novas unidades ou de rede. Nome de clínica raramente é registrado antes de valer alguma coisa — e depois disso o registro pode já pertencer a outro.",
        img: "/areas/contratos.webp",
        alt: "Planta baixa em papel vegetal sobre prancheta com escalímetro",
      },
      {
        id: "sus",
        titulo: "SUS, poder público e integridade",
        texto:
          "Credenciamento e contratualização com o SUS e com secretarias municipais, participação em chamamentos e licitações (Lei 14.133/2021), prestação de contas, defesa em tomada de contas e programa de integridade nos termos da Lei 12.846/2013. A clínica que atende pelo poder público passa a responder por um conjunto de deveres que não existe na atividade privada.",
        img: "/areas/sus.webp",
        alt: "Escadaria de granito de prédio público em contraluz",
      },
    ],
  },
];

export const METODO = [
  {
    titulo: "Diagnóstico",
    texto:
      "Leitura da rotina da clínica, dos contratos em uso, da estrutura societária e das licenças vigentes, antes de existir um problema.",
  },
  {
    titulo: "Estrutura",
    texto:
      "Documentos, fluxos e enquadramentos ajustados para que a defesa, se necessária, já comece pronta.",
  },
  {
    titulo: "Defesa",
    texto:
      "Atuação técnica perante o Conselho, a vigilância sanitária, a Receita e o Judiciário, com acompanhamento direto dos sócios.",
  },
];
