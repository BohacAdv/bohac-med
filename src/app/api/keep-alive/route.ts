import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Keep-alive do Supabase.
 *
 * O plano free do Supabase hiberna o projeto após 7 dias sem nenhuma
 * requisição, e foi exatamente isso que derrubou a gravação de leads. Uma
 * leitura trivial por dia é suficiente para o projeto nunca chegar nesse
 * prazo — o cron do Vercel (vercel.json) chama esta rota.
 *
 * A rota não expõe dado nenhum: só conta as linhas e devolve o número.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 15;

export async function GET(req: NextRequest) {
  /* Se CRON_SECRET estiver definido no Vercel, ele manda o header
     automaticamente nas chamadas de cron. Sem a variável, a rota fica aberta
     — inofensiva, mas melhor fechar. */
  const segredo = process.env.CRON_SECRET;
  if (segredo && req.headers.get("authorization") !== `Bearer ${segredo}`) {
    return NextResponse.json({ erro: "não autorizado" }, { status: 401 });
  }

  const inicio = Date.now();
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { count, error } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true });
    if (error) throw new Error(error.message);

    return NextResponse.json({
      ok: true,
      leads: count ?? 0,
      ms: Date.now() - inicio,
      em: new Date().toISOString(),
    });
  } catch (e: unknown) {
    const detalhe = e instanceof Error ? e.message : "erro desconhecido";
    console.error("[keep-alive] Supabase inacessível:", detalhe);
    return NextResponse.json(
      { ok: false, erro: detalhe, ms: Date.now() - inicio },
      { status: 503 }
    );
  }
}
