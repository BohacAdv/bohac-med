import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { DadosLead } from "@/types";
import { notificarNovoLead } from "@/lib/whatsapp";

/* O cliente nasce dentro do handler, não no escopo do módulo.
   Se uma variável de ambiente faltar, `createClient` lança na importação e a
   rota devolve 500 com HTML — o visitante via "erro inesperado", sem PDF e sem
   saída pelo WhatsApp. Instanciando aqui dentro, a falha cai no mesmo catch da
   hibernação e o lead continua tendo para onde ir. */
function cliente() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  let body: DadosLead;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  const { nome, email, telefone } = body;

  // ── Validação: nome + AO MENOS UM meio de contato ────────────────────────
  // Antes exigia os três, o que barrava lead legítimo que só quer WhatsApp.
  const emailOk = typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const telOk = typeof telefone === "string" && telefone.replace(/\D/g, "").length >= 10;

  if (!nome || !nome.trim()) {
    return NextResponse.json({ erro: "Informe o nome." }, { status: 400 });
  }
  if (!emailOk && !telOk) {
    return NextResponse.json(
      { erro: "Informe um e-mail válido ou um WhatsApp com DDD." },
      { status: 400 }
    );
  }
  if (email && !emailOk) {
    return NextResponse.json({ erro: "E-mail inválido." }, { status: 400 });
  }

  const dados = {
    nome: nome.trim(),
    email: emailOk ? email!.trim() : null,
    telefone: telOk ? telefone! : null,
    cnpj: body.cnpj ?? null,
    mensagem: body.mensagem ?? null,
    origem: body.origem ?? "site",
    resultado_analise: body.resultadoAnalise ?? null,
    notas_fiscais: body.notasFiscais ?? null,
    parecer_nfe: body.parecerNfe ?? null,
    criado_em: new Date().toISOString(),
  };

  /* ── Notificação ANTES da gravação ──────────────────────────────────────
     Ordem deliberada. O Supabase no plano free hiberna após dias sem uso, e
     quando isso acontece o insert falha com "fetch failed". Se a notificação
     viesse depois, o escritório não ficaria sabendo do lead justamente nos
     casos em que o registro se perde. Notificar primeiro garante que o
     contato chegue por WhatsApp mesmo com o banco fora do ar. */
  const notificacao = notificarNovoLead({
    nome: dados.nome,
    email: dados.email ?? "—",
    telefone: dados.telefone ?? "—",
    cnpj: body.cnpj ?? undefined,
    nivelViabilidade: body.resultadoAnalise?.nivel ?? body.parecerNfe?.nivelViabilidadeGeral,
    qtdNotasFiscais: body.notasFiscais?.length,
  })
    .then(() => true)
    .catch(() => false);

  // ── Gravação ─────────────────────────────────────────────────────────────
  try {
    const { error } = await cliente().from("leads").insert([dados]);
    if (error) throw new Error(error.message);

    await notificacao;
    return NextResponse.json({ sucesso: true, mensagem: "Lead registrado." });
  } catch (error: unknown) {
    const detalhe = error instanceof Error ? error.message : "erro desconhecido";
    const notificou = await notificacao;

    console.error("[lead] falha ao gravar no Supabase:", detalhe, {
      notificacaoEnviada: notificou,
      nome: dados.nome,
    });

    /* 503, não 500: o serviço está indisponível, não houve erro de programação.
       O cliente usa este código para oferecer o WhatsApp como alternativa em
       vez de deixar o visitante achar que o envio deu certo. */
    return NextResponse.json(
      {
        erro: "Não foi possível registrar seu contato no momento.",
        codigo: "PERSISTENCIA_INDISPONIVEL",
        notificado: notificou,
      },
      { status: 503 }
    );
  }
}
