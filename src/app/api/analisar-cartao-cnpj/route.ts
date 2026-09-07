import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { consultarCNPJ, analisarViabilidade } from "@/lib/analisar-cnpj";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

const TIPOS_IMAGEM: Record<string, "image/jpeg" | "image/png"> = {
  "image/jpeg": "image/jpeg",
  "image/jpg":  "image/jpeg",
  "image/png":  "image/png",
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const arquivo = formData.get("cartao");

    if (!(arquivo instanceof File)) {
      return NextResponse.json(
        { erro: "Arquivo do Cartão CNPJ é obrigatório." },
        { status: 400 }
      );
    }

    if (arquivo.size > MAX_BYTES) {
      return NextResponse.json(
        { erro: "O arquivo excede o limite de 8MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await arquivo.arrayBuffer());
    const isPdf = arquivo.type === "application/pdf" ||
      arquivo.name.toLowerCase().endsWith(".pdf");
    const imgType = TIPOS_IMAGEM[arquivo.type];

    if (!isPdf && !imgType) {
      return NextResponse.json(
        { erro: "Formato não suportado. Envie o Cartão CNPJ em PDF, JPG ou PNG." },
        { status: 400 }
      );
    }

    // ── Extrai o CNPJ do documento via Claude ──────────────────────
    const conteudo: Anthropic.Messages.ContentBlockParam[] = [
      isPdf
        ? {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: buffer.toString("base64"),
            },
          }
        : {
            type: "image",
            source: {
              type: "base64",
              media_type: imgType!,
              data: buffer.toString("base64"),
            },
          },
      {
        type: "text",
        text: "Este é um Cartão CNPJ emitido pela Receita Federal do Brasil. Extraia SOMENTE o número do CNPJ (14 dígitos numéricos). Responda apenas com os 14 dígitos, sem pontos, barras, traços ou qualquer outro texto.",
      },
    ];

    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 32,
      messages: [{ role: "user", content: conteudo }],
    });

    const cnpjExtraido =
      msg.content[0].type === "text"
        ? msg.content[0].text.replace(/\D/g, "").slice(0, 14)
        : "";

    if (cnpjExtraido.length !== 14) {
      return NextResponse.json(
        {
          erro:
            "Não foi possível identificar o CNPJ no documento. Verifique se é um Cartão CNPJ emitido pela Receita Federal.",
        },
        { status: 422 }
      );
    }

    // ── Consulta Receita Federal e analisa viabilidade ─────────────
    const dados = await consultarCNPJ(cnpjExtraido);
    const resultado = analisarViabilidade(dados);

    return NextResponse.json({ sucesso: true, cnpjExtraido, resultado });
  } catch (error: unknown) {
    const mensagem =
      error instanceof Error ? error.message : "Erro interno do servidor.";
    return NextResponse.json({ erro: mensagem }, { status: 500 });
  }
}
