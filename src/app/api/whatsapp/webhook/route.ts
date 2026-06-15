/**
 * Webhook da Z-API para o bot de WhatsApp do Bohac Med.
 *
 * Fluxo:
 * 1. Usuário envia "oi" ou "analisar" → bot apresenta e pede o CNPJ
 * 2. Usuário envia CNPJ → bot analisa e retorna resultado resumido
 * 3. Bot convida para acessar o site para resultado completo e captura lead
 */

import { NextRequest, NextResponse } from "next/server";
import { consultarCNPJ, analisarViabilidade } from "@/lib/analisar-cnpj";

const ZAPI_INSTANCE = process.env.ZAPI_INSTANCE_ID;
const ZAPI_TOKEN = process.env.ZAPI_TOKEN;
const ZAPI_CLIENT_TOKEN = process.env.ZAPI_CLIENT_TOKEN;

async function enviarMensagem(telefone: string, mensagem: string) {
  if (!ZAPI_INSTANCE || !ZAPI_TOKEN) {
    console.error("Z-API não configurada");
    return;
  }
  await fetch(
    `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}/send-text`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Token": ZAPI_CLIENT_TOKEN ?? "",
      },
      body: JSON.stringify({ phone: telefone, message: mensagem }),
    }
  );
}

const MENSAGEM_BOAS_VINDAS = `👋 Olá! Sou o assistente virtual do *Bohac Med*.

Aqui você descobre em segundos se sua clínica ou empresa médica tem direito à *redução de impostos* pela tese de *equiparação hospitalar*.

Para começar, me envie o *CNPJ* da sua empresa (só os números está ótimo).

📋 Exemplo: _00000000000100_`;

const MENSAGEM_AGUARDAR = `⏳ Estou consultando os dados da Receita Federal... só um instante!`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Estrutura básica do webhook da Z-API
    const telefone: string = body?.phone ?? body?.from ?? "";
    const texto: string = (body?.text?.message ?? body?.text ?? "").trim();

    if (!telefone || !texto) {
      return NextResponse.json({ ok: true });
    }

    const textoLower = texto.toLowerCase();

    // Gatilhos de início
    if (
      textoLower.includes("oi") ||
      textoLower.includes("olá") ||
      textoLower.includes("ola") ||
      textoLower.includes("analisar") ||
      textoLower.includes("equiparação") ||
      textoLower.includes("imposto") ||
      textoLower.includes("start") ||
      texto === "1"
    ) {
      await enviarMensagem(telefone, MENSAGEM_BOAS_VINDAS);
      return NextResponse.json({ ok: true });
    }

    // Detecta se o texto parece um CNPJ (14 dígitos ou formatado)
    const cnpjLimpo = texto.replace(/\D/g, "");
    if (cnpjLimpo.length === 14) {
      await enviarMensagem(telefone, MENSAGEM_AGUARDAR);

      try {
        const dados = await consultarCNPJ(cnpjLimpo);
        const resultado = analisarViabilidade(dados);

        const emoji =
          resultado.nivelViabilidade === "ALTA" ? "✅" :
          resultado.nivelViabilidade === "MEDIA" ? "⚠️" :
          resultado.nivelViabilidade === "BAIXA" ? "🔍" : "❌";

        const nivelTexto =
          resultado.nivelViabilidade === "ALTA" ? "ALTA" :
          resultado.nivelViabilidade === "MEDIA" ? "MÉDIA" :
          resultado.nivelViabilidade === "BAIXA" ? "BAIXA" : "NÃO ELEGÍVEL";

        const resposta = `${emoji} *Análise de Equiparação Hospitalar*

🏢 *Empresa:* ${resultado.razaoSocial}
📊 *Viabilidade:* ${nivelTexto} (${resultado.pontuacao}/100 pontos)

${resultado.justificativa}

---
${resultado.nivelViabilidade !== "INELEGIVEL"
  ? `💡 *Próximo passo:* ${resultado.proximosPasosRecomendados}\n\nPara receber a análise completa com o *valor estimado de recuperação*, acesse:\n👉 ${process.env.NEXT_PUBLIC_SITE_URL ?? "https://bohac-med.com.br"}\n\nOu responda com seu *nome completo* e *e-mail* que nossa equipe te contata em até 1 dia útil.`
  : `Mesmo assim, se quiser conversar com um especialista, responda com seu *nome completo* que entraremos em contato.`}`;

        await enviarMensagem(telefone, resposta);

        // Salva lead no Supabase (fire-and-forget)
        fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/lead`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: "Lead WhatsApp",
            email: "whatsapp@pendente.com",
            telefone,
            cnpj: cnpjLimpo,
            origem: "whatsapp",
            resultadoAnalise: resultado,
          }),
        }).catch(() => {});

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erro ao consultar.";
        await enviarMensagem(
          telefone,
          `❌ Não consegui analisar esse CNPJ: ${msg}\n\nVerifique se o número está correto e tente novamente.`
        );
      }

      return NextResponse.json({ ok: true });
    }

    // Mensagem não reconhecida
    await enviarMensagem(
      telefone,
      `Não entendi 😅\n\nPara analisar sua empresa, me envie o *CNPJ* (14 dígitos).\n\nExemplo: _00000000000100_`
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Sempre retorna 200 para o webhook
  }
}

// A Z-API também faz GET para verificar o webhook
export async function GET() {
  return NextResponse.json({ status: "Bohac Med WhatsApp Bot — online" });
}
