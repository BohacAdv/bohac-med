import { NextRequest, NextResponse } from "next/server";
import { consultarCNPJ, analisarViabilidade, cnpjValido } from "@/lib/analisar-cnpj";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cnpj } = body;

    if (!cnpj) {
      return NextResponse.json({ erro: "CNPJ é obrigatório." }, { status: 400 });
    }
    // Erro do usuário é 400, não 500 — antes um CNPJ malformado devolvia
    // "erro interno", que soa como falha do site.
    if (!cnpjValido(String(cnpj))) {
      return NextResponse.json(
        { erro: "CNPJ inválido — verifique os dígitos informados." },
        { status: 400 }
      );
    }

    const dados = await consultarCNPJ(cnpj);
    const resultado = analisarViabilidade(dados);

    return NextResponse.json({ sucesso: true, resultado });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro interno.";
    return NextResponse.json({ erro: mensagem }, { status: 500 });
  }
}
