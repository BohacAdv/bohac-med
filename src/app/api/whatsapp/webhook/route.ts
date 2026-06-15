/**
 * Webhook WhatsApp Cloud API — Bohac Med
 *
 * GET  /api/whatsapp/webhook  → verificação do webhook pela Meta
 * POST /api/whatsapp/webhook  → mensagens recebidas dos usuários
 *
 * Fluxo do chatbot:
 *   1. Usuário envia "oi" → bot apresenta e pede CNPJ
 *   2. Usuário envia CNPJ → bot analisa via Receita Federal e retorna resultado
 *   3. Bot convida para o site e coleta lead
 *
 * Para configurar no Meta:
 *   business.facebook.com → WhatsApp → Configuração → Webhooks
 *   URL: https://seu-dominio.com.br/api/whatsapp/webhook
 *   Token de verificação: valor de WHATSAPP_VERIFY_TOKEN no .env
 *   Campos: messages
 */

import { NextRequest, NextResponse } from "next/server";
import { consultarCNPJ, analisarViabilidade } from "@/lib/analisar-cnpj";
import {
  enviarTexto,
  marcarComoLida,
  extrairMensagem,
  type PayloadCloudAPI,
} from "@/lib/whatsapp";

// ─── Mensagens do bot ─────────────────────────────────────────────────────────

const MSG_BOAS_VINDAS = `👋 Olá! Sou o assistente virtual do *Bohac Med*.

Aqui você descobre em segundos se sua clínica ou empresa médica tem direito à *redução de impostos* pela tese de *equiparação hospitalar*.

Para começar, me envie o *CNPJ* da sua empresa (só os números está ótimo).

📋 Exemplo: _00000000000100_`;

const MSG_AGUARDAR = `⏳ Consultando a Receita Federal... só um instante!`;

const MSG_NAO_ENTENDI = `Não entendi 😅

Para analisar sua empresa, me envie o *CNPJ* (14 dígitos).

Exemplo: _00000000000100_

Ou acesse nosso site para a análise completa:
👉 ${process.env.NEXT_PUBLIC_SITE_URL ?? "https://bohacmed.com.br"}`;

// ─── GET — Verificação do webhook pela Meta ───────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode      = searchParams.get("hub.mode");
  const token     = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.WHATSAPP_VERIFY_TOKEN &&
    challenge
  ) {
    // Meta espera o challenge como plain text (não JSON)
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ erro: "Token inválido." }, { status: 403 });
}

// ─── POST — Mensagens recebidas ───────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const payload: PayloadCloudAPI = await req.json();

    // Ignora notificações que não são mensagens (status updates, etc.)
    const msg = extrairMensagem(payload);
    if (!msg) return NextResponse.json({ ok: true });

    const { de, texto, messageId } = msg;
    const textoLower = texto.toLowerCase();

    // Marca como lida (✓✓ azul)
    await marcarComoLida(messageId);

    // ── Gatilhos de início ──────────────────────────────────────────────────
    const ehSaudacao =
      textoLower.includes("oi") ||
      textoLower.includes("olá") ||
      textoLower.includes("ola") ||
      textoLower.includes("hello") ||
      textoLower.includes("analisar") ||
      textoLower.includes("equipar") ||
      textoLower.includes("imposto") ||
      textoLower.includes("start") ||
      texto === "1";

    if (ehSaudacao) {
      await enviarTexto(de, MSG_BOAS_VINDAS);
      return NextResponse.json({ ok: true });
    }

    // ── CNPJ (14 dígitos) ───────────────────────────────────────────────────
    const cnpjLimpo = texto.replace(/\D/g, "");
    if (cnpjLimpo.length === 14) {
      await enviarTexto(de, MSG_AGUARDAR);

      try {
        const dados    = await consultarCNPJ(cnpjLimpo);
        const resultado = analisarViabilidade(dados);

        const emoji = {
          ALTA:       "✅",
          MEDIA:      "⚠️",
          BAIXA:      "🔍",
          INELEGIVEL: "❌",
        }[resultado.nivelViabilidade];

        const nivelTexto = {
          ALTA:       "ALTA",
          MEDIA:      "MÉDIA",
          BAIXA:      "BAIXA",
          INELEGIVEL: "NÃO ELEGÍVEL",
        }[resultado.nivelViabilidade];

        const cnaesElegiveis = resultado.cnaesElegiveis
          .slice(0, 3)
          .map(c => `  • ${c.codigo} — ${c.descricao}`)
          .join("\n");

        const blocoElegiveis = cnaesElegiveis
          ? `\n🏥 *Atividades elegíveis:*\n${cnaesElegiveis}\n`
          : "";

        const bloCTA =
          resultado.nivelViabilidade !== "INELEGIVEL"
            ? `\n💡 *Próximo passo:*\n${resultado.proximosPasosRecomendados}\n\nPara receber o *cálculo do valor a recuperar*, acesse o site:\n👉 ${process.env.NEXT_PUBLIC_SITE_URL ?? "https://bohacmed.com.br"}\n\nOu responda com seu *nome completo* e *e-mail* que nossa equipe entra em contato.`
            : `\nMesmo assim, se quiser conversar com um especialista, responda com seu *nome completo* que entraremos em contato.`;

        const resposta =
          `${emoji} *Análise de Equiparação Hospitalar*\n\n` +
          `🏢 *Empresa:* ${resultado.razaoSocial}\n` +
          `📊 *Viabilidade:* ${nivelTexto} (${resultado.pontuacao}/100 pts)\n\n` +
          `${resultado.justificativa}` +
          blocoElegiveis +
          `\n---` +
          bloCTA;

        await enviarTexto(de, resposta);

        // Salva lead no Supabase (fire-and-forget)
        fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/lead`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nome: "Lead WhatsApp",
              email: "whatsapp@pendente.com",
              telefone: de,
              cnpj: cnpjLimpo,
              origem: "whatsapp",
              resultadoAnalise: resultado,
            }),
          }
        ).catch(() => {});

      } catch (err: unknown) {
        const descricao = err instanceof Error ? err.message : "Erro desconhecido.";
        await enviarTexto(
          de,
          `❌ Não consegui analisar esse CNPJ: ${descricao}\n\nVerifique se o número está correto e tente novamente.`
        );
      }

      return NextResponse.json({ ok: true });
    }

    // ── Mensagem não reconhecida ─────────────────────────────────────────────
    await enviarTexto(de, MSG_NAO_ENTENDI);
    return NextResponse.json({ ok: true });

  } catch {
    // Sempre retorna 200 — a Meta reage a erros desativando o webhook
    return NextResponse.json({ ok: true });
  }
}
