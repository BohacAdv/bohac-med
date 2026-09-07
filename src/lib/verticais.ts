/**
 * Verticais do grupo Bohac — espelha codigo-fonte/app/lib/verticals.js
 * do site principal. O Bohac Med é este site; as demais vivem em
 * bohac.com.br/<id>/.
 */
export type Vertical = {
  nome: string;
  area: string;
  accent: string;
  href: string | null; // null = é este site
};

export const VERTICAIS: Vertical[] = [
  { nome: "Bohac Med", area: "Direito Médico e da Saúde", accent: "#ae8167", href: null },
  { nome: "Bohac Odonto", area: "Direito Odontológico", accent: "#0f857d", href: "https://www.bohac.com.br/odonto/" },
  { nome: "Bohac Agro", area: "Agronegócio", accent: "#57952f", href: "https://www.bohac.com.br/agro/" },
  { nome: "Bohac Empresas", area: "Direito Empresarial", accent: "#b8783c", href: "https://www.bohac.com.br/empresas/" },
  { nome: "Bohac Imob", area: "Mercado Imobiliário", accent: "#c25a25", href: "https://www.bohac.com.br/imob/" },
  { nome: "Bohac Varejo", area: "Varejo e Serviços", accent: "#c99012", href: "https://www.bohac.com.br/varejo/" },
  { nome: "Bohac Família & Patrimônio", area: "Proteção Patrimonial", accent: "#a12a49", href: "https://www.bohac.com.br/familia/" },
];

/** Dados institucionais — espelha site.js do site principal. */
export const ESCRITORIO = {
  razaoSocial: "Bohac Sociedade de Advogados",
  nomeCurto: "Bohac Advocacia",
  sitePrincipal: "https://www.bohac.com.br",
  telefone: "(18) 3222-6245",
  email: "contato@bohac.com.br",
  whatsapp: "551832226245",
  cidade: "Presidente Prudente/SP",
  endereco: ["Rua Emílio Mori, 426", "Vila Machadinho", "19015-230", "Presidente Prudente/SP"],
  instagram: "https://instagram.com/bohac.advocacia",
} as const;

export function whatsappHref(msg: string) {
  return `https://wa.me/${ESCRITORIO.whatsapp}?text=${encodeURIComponent(msg)}`;
}
