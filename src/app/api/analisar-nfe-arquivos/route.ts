import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import type { NivelViabilidade, NotaFiscalAnexo, ResultadoAnaliseNFeArquivos } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "notas-fiscais";
const MAX_ARQUIVOS = 5;
const MAX_BYTES_POR_ARQUIVO = 8 * 1024 * 1024; // 8MB

const TIPOS_ACEITOS: Record<string, "pdf" | "imagem" | "xml"> = {
  "application/pdf": "pdf",
  "image/jpeg": "imagem",
  "image/png": "imagem",
  "text/xml": "xml",
  "application/xml": "xml",
};

const EXTENSOES_ACEITAS: Record<string, "pdf" | "imagem" | "xml"> = {
  pdf: "pdf",
  jpg: "imagem",
  jpeg: "imagem",
  png: "imagem",
  xml: "xml",
};

const PROMPT_SISTEMA = `Você é um especialista em direito tributário brasileiro, especializado na tese de equiparação hospitalar (art. 15, §1°, III, "a" e art. 20 da Lei 9.249/95 e jurisprudência do STJ — Tema 217).

Você vai receber de 1 a ${MAX_ARQUIVOS} notas fiscais (em PDF, imagem/foto ou XML estruturado de NF-e/NFS-e) enviadas por um lead (clínica ou empresa médica). Para cada nota, leia com atenção os campos:
- "Descrição dos serviços" / "Discriminação dos serviços" (no XML, costuma estar em tags como <Discriminacao>, <xProd> ou similares);
- "Observações" / "Informações complementares" / "Dados adicionais" (no XML, tags como <InformacoesComplementares>, <infCpl> ou similares).

Com base nesses dois campos, determine se os serviços descritos se enquadram na tese de equiparação hospitalar, que permite redução da base de cálculo do IRPJ (de 32% para 8%) e da CSLL (de 32% para 12%) sobre a receita bruta, para empresas que prestam serviços de natureza hospitalar.

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

Responda SEMPRE em JSON válido (sem markdown, sem texto fora do JSON) com esta estrutura exata:
{
  "parecer": string,                  // parecer corrido (2 a 4 parágrafos, em português, tom jurídico mas acessível), avaliando em conjunto todas as notas enviadas e concluindo pela adequação ou não à tese
  "enquadradoGeral": boolean,         // true se ao menos uma nota indica enquadramento relevante
  "nivelViabilidadeGeral": "ALTA" | "MEDIA" | "BAIXA" | "INELEGIVEL",
  "notas": [
    {
      "nomeArquivo": string,
      "servicosIdentificados": string[],
      "enquadrado": boolean,
      "observacoesRelevantes": string  // o que foi lido nos campos de descrição/observações que motivou a conclusão
    }
  ]
}`;

function sanitizarNomeArquivo(nome: string): string {
  return nome
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9.\-_]/g, "_")
    .slice(-120);
}

function detectarTipo(file: File): "pdf" | "imagem" | "xml" | null {
  if (TIPOS_ACEITOS[file.type]) return TIPOS_ACEITOS[file.type];
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSOES_ACEITAS[ext] ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const arquivos = formData.getAll("notas").filter((f): f is File => f instanceof File);
    const analiseId = (formData.get("analiseId") as string) || crypto.randomUUID();

    if (arquivos.length === 0) {
      return NextResponse.json({ erro: "Anexe ao menos uma nota fiscal." }, { status: 400 });
    }
    if (arquivos.length > MAX_ARQUIVOS) {
      return NextResponse.json({ erro: `Envie no máximo ${MAX_ARQUIVOS} notas fiscais por vez.` }, { status: 400 });
    }

    const conteudoParaClaude: Anthropic.Messages.ContentBlockParam[] = [];
    const arquivosValidados: { file: File; buffer: Buffer; tipo: "pdf" | "imagem" | "xml" }[] = [];

    for (const file of arquivos) {
      if (file.size > MAX_BYTES_POR_ARQUIVO) {
        return NextResponse.json(
          { erro: `O arquivo "${file.name}" excede o limite de 8MB.` },
          { status: 400 }
        );
      }
      const tipo = detectarTipo(file);
      if (!tipo) {
        return NextResponse.json(
          { erro: `Formato de "${file.name}" não suportado. Envie PDF, JPG, PNG ou XML.` },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      arquivosValidados.push({ file, buffer, tipo });

      conteudoParaClaude.push({ type: "text", text: `Nota fiscal anexada: "${file.name}"` });
      if (tipo === "pdf") {
        conteudoParaClaude.push({
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: buffer.toString("base64") },
        });
      } else if (tipo === "imagem") {
        const mediaType = file.type === "image/png" ? "image/png" : "image/jpeg";
        conteudoParaClaude.push({
          type: "image",
          source: { type: "base64", media_type: mediaType, data: buffer.toString("base64") },
        });
      } else {
        const texto = buffer.toString("utf-8").slice(0, 20000);
        conteudoParaClaude.push({ type: "text", text: `Conteúdo XML:\n${texto}` });
      }
    }

    conteudoParaClaude.push({
      type: "text",
      text: "Avalie todas as notas fiscais acima em conjunto e responda apenas com o JSON pedido.",
    });

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{ role: "user", content: conteudoParaClaude }],
      system: PROMPT_SISTEMA,
    });

    const textoResposta = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = textoResposta.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Formato de resposta inválido da IA.");

    const parsed = JSON.parse(jsonMatch[0]) as {
      parecer: string;
      enquadradoGeral: boolean;
      nivelViabilidadeGeral: NivelViabilidade;
      notas: { nomeArquivo: string; servicosIdentificados: string[]; enquadrado: boolean; observacoesRelevantes: string }[];
    };

    const resultado: ResultadoAnaliseNFeArquivos = {
      parecer: parsed.parecer,
      enquadradoGeral: parsed.enquadradoGeral,
      nivelViabilidadeGeral: parsed.nivelViabilidadeGeral,
      notas: parsed.notas,
    };

    // Armazena os arquivos originais no Supabase Storage, vinculados ao analiseId
    const arquivosSalvos: NotaFiscalAnexo[] = [];
    for (let i = 0; i < arquivosValidados.length; i++) {
      const { file, buffer } = arquivosValidados[i];
      const caminho = `${analiseId}/${i}-${sanitizarNomeArquivo(file.name)}`;
      const { error: erroUpload } = await supabase.storage
        .from(BUCKET)
        .upload(caminho, buffer, { contentType: file.type || "application/octet-stream", upsert: true });

      if (!erroUpload) {
        arquivosSalvos.push({ nomeArquivo: file.name, caminho, tipo: file.type || "" });
      }
      // Se o upload falhar (ex.: bucket ainda não criado), seguimos sem bloquear
      // a entrega do parecer — o arquivo simplesmente não fica anexado ao lead.
    }

    return NextResponse.json({ sucesso: true, analiseId, resultado, arquivos: arquivosSalvos });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro interno.";
    return NextResponse.json({ erro: mensagem }, { status: 500 });
  }
}
