"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import VerticaisMenu from "./VerticaisMenu";
import { VERTICAIS, ESCRITORIO, whatsappHref } from "@/lib/verticais";

const LINKS = [
  { href: "#tese", label: "A Tese" },
  { href: "#como-funciona", label: "Como Funciona" },
  { href: "#beneficiarios", label: "Quem se Beneficia" },
  { href: "/areas", label: "Atuação na Clínica" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [drawer, setDrawer] = useState(false);

  // Âncoras (#tese) só existem na home; fora dela precisam de prefixo.
  const resolve = (href: string) =>
    href.startsWith("#") && pathname !== "/" ? `/${href}` : href;

  useEffect(() => {
    const hdr = headerRef.current;
    function onScroll() {
      hdr?.classList.toggle("scrolled", window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Trava o scroll do corpo enquanto o drawer está aberto e fecha no Escape.
  useEffect(() => {
    if (!drawer) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawer(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [drawer]);

  // Fecha o drawer ao trocar de rota.
  useEffect(() => setDrawer(false), [pathname]);

  /* O header é transparente por desenho, para dissolver no hero navy da home.
     Nas demais rotas o fundo é claro e o texto branco ficaria ilegível — ali
     ele nasce sólido. */
  const soltoSobreHero = pathname === "/";

  return (
    <header
      className={`site-header${soltoSobreHero ? "" : " site-header--solid"}`}
      ref={headerRef}
    >
      <div className="wrap">
        <nav className="nav" aria-label="Principal">
          <a className="nav__logo" href="/">
            <img src="/logo-inverted.png" alt="Bohac Med" width={220} height={64} />
          </a>

          <div className="nav__links">
            {LINKS.map((l) => (
              <a key={l.href} href={resolve(l.href)}>
                {l.label}
              </a>
            ))}

            {/* A antiga faixa superior vive aqui agora: o link do site
                principal e as verticais são itens do próprio menu, como em
                bohac.com.br. Sem faixa, não há costura entre faixa e hero. */}
            <span className="nav__sep" aria-hidden="true" />
            <a
              className="nav__vertical"
              href={ESCRITORIO.sitePrincipal}
              target="_blank"
              rel="noopener noreferrer"
            >
              bohac.com.br
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17 17 7" /><path d="M8 7h9v9" />
              </svg>
            </a>
            <VerticaisMenu />
          </div>

          <div className="nav__cta">
            <a
              href={whatsappHref("Olá! Vim pelo site do Bohac Med e gostaria de falar com o escritório.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--gold"
            >
              Falar com o escritório
            </a>
          </div>

          <button
            className="nav__burger"
            type="button"
            aria-expanded={drawer}
            aria-controls="nav-drawer"
            aria-label={drawer ? "Fechar menu" : "Abrir menu"}
            onClick={() => setDrawer((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </nav>
      </div>

      {/* Drawer mobile — antes deste componente o site não tinha navegação
          nenhuma abaixo de 760px. */}
      <div className="drawer" id="nav-drawer" data-open={drawer ? "" : undefined}>
        <div className="drawer__inner">
          <div className="drawer__group">
            {LINKS.map((l) => (
              <a key={l.href} href={resolve(l.href)} onClick={() => setDrawer(false)}>
                {l.label}
              </a>
            ))}
          </div>

          <div className="drawer__label">Grupo Bohac</div>
          <div className="drawer__group">
            <a href={ESCRITORIO.sitePrincipal} target="_blank" rel="noopener noreferrer">
              bohac.com.br — Site Principal
            </a>
            {VERTICAIS.map((v) =>
              v.href ? (
                <a key={v.nome} href={v.href} target="_blank" rel="noopener noreferrer">
                  <span className="vert__dot" style={{ background: v.accent }} aria-hidden="true" />
                  {v.nome}
                </a>
              ) : (
                <a key={v.nome} href="/" aria-current="page" onClick={() => setDrawer(false)}>
                  <span className="vert__dot" style={{ background: v.accent }} aria-hidden="true" />
                  {v.nome}
                  <span className="vert__tag">atual</span>
                </a>
              )
            )}
          </div>

          <a
            href={whatsappHref("Olá! Vim pelo site do Bohac Med e gostaria de falar com o escritório.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--gold btn-lg drawer__cta"
          >
            Falar com o escritório
          </a>
        </div>
      </div>
    </header>
  );
}
