import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { DadosLead } from "@/types";
import { notificarNovoLead } from "@/lib/whatsapp";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body: DadosLead = await req.json();

    const { nome, email, telefone } = body;
    if (!nome || !email || !telefone) {
      return NextResponse.json(
        { erro: "Nome, e-mail e telefone são obrigatórios." },
        { status: 400 }
      );
    }

    // Salva no Supabase
    const { error } = await supabase.from("leads").insert([
      {
        nome: body.nome,
        email: body.email,
        telefone: body.telefone,
        cnpj: body.cnpj ?? null,
        mensagem: body.mensagem ?? null,
        origem: body.origem ?? "site",
        resultado_analise: body.resultadoAnalise ?? null,
        notas_fiscais: body.notasFiscais ?? null,
        parecer_nfe: body.parecerNfe ?? null,
        criado_em: new Date().toISOString(),
      },
    ]);

    if (error) throw new Error(error.message);

    // Notificação WhatsApp para o advogado (fire-and-forget)
    notificarNovoLead({
      nome: body.nome,
      email: body.email,
      telefone: body.telefone,
      cnpj: body.cnpj ?? undefined,
      nivelViabilidade: body.resultadoAnalise?.nivelViabilidade ?? body.parecerNfe?.nivelViabilidadeGeral,
      qtdNotasFiscais: body.notasFiscais?.length,
    }).catch(() => {});

    return NextResponse.json({ sucesso: true, mensagem: "Lead registrado com sucesso." });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro interno.";
    return NextResponse.json({ erro: mensagem }, { status: 500 });
  }
}
