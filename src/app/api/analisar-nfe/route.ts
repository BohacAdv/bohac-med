import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ResultadoAnaliseNFe, NivelViabilidade } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPT_SISTEMA = `Você é um especialista em direito tributário brasileiro, especializado na tese de equiparação hospitalar (art. 15, §1°, III, "a" da Lei 9.249/95 e jurisprudência do STJ — Tema 217).

Sua tarefa é analisar descrições de serviços de notas fiscais e determinar se esses serviços se enquadram na tese de equiparação hospitalar, que permite redução da base de cálculo do IRPJ e CSLL para empresas que prestam serviços de natureza hospitalar.

Serviços que se enquadram incluem (mas não se limitam a):
- Procedimentos cirúrgicos (mesmo ambulatoriais)
- Anestesiologia
- Diagnóstico por imagem (raio-x, ultrassom, tomografia, ressonância)
- Laboratório de análises clínicas
- Fisioterapia e reabilitação
- Hemodiálise e nefrologia
- Endoscopia, colonoscopia e procedimentos endoscópicos
- Atendimento de urgência e emergência
- UTI e terapia intensiva
- Serviços de enfermagem
- Quimioterapia e radioterapia
- Cardiologia invasiva

Serviços que NÃO se enquadram:
- Consultas médicas simples (sem procedimentos)
- Medicina estética pura (botox, preenchimento)
- Psicologia/psicanálise isolada
- Acupuntura isolada
- Nutrição isolada

Responda SEMPRE em JSON válido com esta estrutura exata:
{
  "enquadrado": boolean,
  "nivelViabilidade": "ALTA" | "MEDIA" | "BAIXA" | "INELEGIVEL",
  "servicosIdentificados": string[],
  "justificativa": string
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { descricao } = body;

    if (!descricao || typeof descricao !== "string" || descricao.trim().length < 10) {
      return NextResponse.json(
        { erro: "Informe a descrição dos serviços da nota fiscal (mínimo 10 caracteres)." },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Analise os seguintes serviços descritos em nota fiscal e determine a viabilidade de enquadramento na tese de equiparação hospitalar:\n\n"${descricao}"`,
        },
      ],
      system: PROMPT_SISTEMA,
    });

    const textoResposta = message.content[0].type === "text" ? message.content[0].text : "";

    // Extrai o JSON da resposta
    const jsonMatch = textoResposta.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Formato de resposta inválido.");

    const parsed = JSON.parse(jsonMatch[0]) as {
      enquadrado: boolean;
      nivelViabilidade: NivelViabilidade;
      servicosIdentificados: string[];
      justificativa: string;
    };

    const resultado: ResultadoAnaliseNFe = {
      descricaoOriginal: descricao,
      enquadrado: parsed.enquadrado,
      nivelViabilidade: parsed.nivelViabilidade,
      justificativa: parsed.justificativa,
      servicosIdentificados: parsed.servicosIdentificados,
    };

    return NextResponse.json({ sucesso: true, resultado });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro interno.";
    return NextResponse.json({ erro: mensagem }, { status: 500 });
  }
}
