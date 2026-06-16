/**
 * WhatsApp Cloud API — Bohac Med
 *
 * Documentação Meta: https://developers.facebook.com/docs/whatsapp/cloud-api
 *
 * Variáveis necessárias no .env:
 *   WHATSAPP_PHONE_NUMBER_ID   — ID do número no Meta (ex: 123456789012345)
 *   WHATSAPP_ACCESS_TOKEN      — Token permanente do System User no Meta Business
 *   WHATSAPP_VERIFY_TOKEN      — String secreta para verificação do webhook (você define)
 *   WHATSAPP_NOTIFY_NUMBER     — Número do advogado para receber notificações (ex: 5518999999999)
 */

const BASE_URL = "https://graph.facebook.com/v20.0";
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TOKEN    = process.env.WHATSAPP_ACCESS_TOKEN;

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface MensagemTexto {
  to: string;
  body: string;
}

export interface PayloadCloudAPI {
  object: string;
  entry: Array<{
    changes: Array<{
      value: {
        messages?: Array<{
          from: string;
          type: string;
          text?: { body: string };
          id: string;
        }>;
        contacts?: Array<{ profile: { name: string } }>;
        statuses?: Array<{ id: string; status: string }>;
      };
    }>;
  }>;
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  };
}

function endpoint(path = "") {
  return `${BASE_URL}/${PHONE_ID}/messages${path}`;
}

// ─── Funções públicas ─────────────────────────────────────────────────────────

/**
 * Envia mensagem de texto simples.
 * Só funciona dentro da janela de 24h após o usuário ter escrito primeiro,
 * ou para responder a um webhook. Para iniciar conversa, use enviarTemplate().
 */
export async function enviarTexto(para: string, corpo: string): Promise<void> {
  if (!PHONE_ID || !TOKEN) {
    console.warn("[WhatsApp] Variáveis WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN não configuradas.");
    return;
  }

  const res = await fetch(endpoint(), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: para,
      type: "text",
      text: { preview_url: false, body: corpo },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[WhatsApp] Erro ao enviar texto:", err);
  }
}

/**
 * Envia template de mensagem (necessário para iniciar conversa fora da janela 24h).
 *
 * Para usar: crie um template em business.facebook.com → WhatsApp Manager → Message Templates
 * O template padrão de boas-vindas é "hello_world" (idioma en_US).
 * Você precisará criar um template próprio em português e aguardar aprovação da Meta.
 */
export async function enviarTemplate(
  para: string,
  nomeTemplate: string,
  idioma: string,
  componentes?: object[]
): Promise<void> {
  if (!PHONE_ID || !TOKEN) {
    console.warn("[WhatsApp] Variáveis não configuradas.");
    return;
  }

  const body: Record<string, unknown> = {
    messaging_product: "whatsapp",
    to: para,
    type: "template",
    template: {
      name: nomeTemplate,
      language: { code: idioma },
    },
  };

  if (componentes) {
    (body.template as Record<string, unknown>).components = componentes;
  }

  const res = await fetch(endpoint(), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[WhatsApp] Erro ao enviar template:", err);
  }
}

/**
 * Marca mensagem como lida (exibe o "✓✓ azul" para o usuário).
 */
export async function marcarComoLida(messageId: string): Promise<void> {
  if (!PHONE_ID || !TOKEN) return;

  await fetch(endpoint(), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    }),
  }).catch(() => {});
}

/**
 * Notifica o advogado (número em WHATSAPP_NOTIFY_NUMBER) quando um novo lead chega.
 * Usa template — crie o template "novo_lead_bohac" no Meta Business Manager.
 *
 * Enquanto o template não estiver aprovado, usa mensagem de texto simples
 * (funciona se o advogado tiver conversado com o número nas últimas 24h).
 */
export async function notificarNovoLead(dados: {
  nome: string;
  email: string;
  telefone: string;
  cnpj?: string;
  nivelViabilidade?: string;
  qtdNotasFiscais?: number;
}): Promise<void> {
  const numeroAdvogado = process.env.WHATSAPP_NOTIFY_NUMBER;
  if (!numeroAdvogado) return;

  const nivel = dados.nivelViabilidade ?? "—";
  const emoji = nivel === "ALTA" ? "🟢" : nivel === "MEDIA" ? "🟡" : nivel === "BAIXA" ? "🟠" : "⚪";

  const mensagem =
    `${emoji} *Novo lead — Bohac Med*\n\n` +
    `👤 *Nome:* ${dados.nome}\n` +
    `📧 *E-mail:* ${dados.email}\n` +
    `📱 *WhatsApp:* ${dados.telefone}\n` +
    (dados.cnpj ? `🏢 *CNPJ:* ${dados.cnpj}\n` : "") +
    `📊 *Viabilidade:* ${nivel}\n` +
    (dados.qtdNotasFiscais ? `📎 *Notas fiscais anexadas:* ${dados.qtdNotasFiscais}\n` : "") +
    `\n_Acesse o Supabase para detalhes completos._`;

  // Tenta texto simples primeiro (dentro da janela 24h após conversa recente)
  await enviarTexto(numeroAdvogado, mensagem);
}

/**
 * Extrai a mensagem de texto do payload do webhook da Cloud API.
 * Retorna null se não houver mensagem de texto nova.
 */
export function extrairMensagem(payload: PayloadCloudAPI): {
  de: string;
  texto: string;
  messageId: string;
  nomeContato: string;
} | null {
  const change = payload?.entry?.[0]?.changes?.[0]?.value;
  if (!change?.messages?.length) return null;

  const msg = change.messages[0];
  if (msg.type !== "text" || !msg.text?.body) return null;

  return {
    de: msg.from,
    texto: msg.text.body.trim(),
    messageId: msg.id,
    nomeContato: change.contacts?.[0]?.profile?.name ?? "Usuário",
  };
}
