import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SENHA_ADMIN = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "bohac2024";
const BUCKET = "notas-fiscais";

// Gera uma URL assinada temporária (5 min) para download de uma nota fiscal
// armazenada no bucket privado, a partir do painel administrativo.
export async function POST(req: NextRequest) {
  try {
    const { caminho, senha } = await req.json();

    if (senha !== SENHA_ADMIN) {
      return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
    }
    if (!caminho || typeof caminho !== "string") {
      return NextResponse.json({ erro: "Caminho inválido." }, { status: 400 });
    }

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(caminho, 300);

    if (error || !data) {
      return NextResponse.json({ erro: error?.message ?? "Erro ao gerar link." }, { status: 500 });
    }

    return NextResponse.json({ url: data.signedUrl });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro interno.";
    return NextResponse.json({ erro: mensagem }, { status: 500 });
  }
}
