import { redirect } from "next/navigation";

/**
 * A /resultado era o destino do checker da home, mas lia o parecer de
 * `sessionStorage["resultado"]` — chave que nenhum ponto do projeto escrevia.
 * Resultado: a rota sempre caía no `router.replace("/")` e o visitante era
 * devolvido à landing sem nunca ver o parecer.
 *
 * A análise foi consolidada na /analise, que já executava a consulta
 * corretamente. Esta rota permanece apenas para não quebrar links antigos:
 * repassa o CNPJ, quando houver, para a página que funciona.
 */
export default async function ResultadoRedirect({
  searchParams,
}: {
  searchParams: Promise<{ cnpj?: string }>;
}) {
  const { cnpj } = await searchParams;
  const limpo = (cnpj ?? "").replace(/\D/g, "");
  redirect(limpo.length === 14 ? `/analise?cnpj=${limpo}` : "/analise");
}
