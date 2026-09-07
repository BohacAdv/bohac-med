"use client";

import { useEffect, useId, useRef, useState } from "react";
import { VERTICAIS } from "@/lib/verticais";

/**
 * Padrão Disclosure da WAI-ARIA APG — não `role="menu"`.
 * São links de navegação: `role="menu"` obrigaria roving tabindex e
 * supressão do Tab, complexidade sem ganho. Disclosure dá teclado correto
 * de graça.
 *
 * O bug anterior: o menu abria só com `:hover` e havia um gap de 10px sem
 * ponte entre gatilho e menu — ao descer o mouse o `:hover` caía e o menu
 * sumia antes de ser clicável. Morto no touch e inacessível por teclado.
 */
export default function VerticaisMenu() {
  const [aberto, setAberto] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!aberto) return;

    // pointerdown, não click: dispara antes de o foco mudar, evitando que
    // um clique no gatilho feche e reabra no mesmo gesto.
    function onPointerDown(e: PointerEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setAberto(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAberto(false);
        triggerRef.current?.focus();
      }
    }
    function onFocusIn(e: FocusEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setAberto(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [aberto]);

  return (
    <div className="vert" ref={wrapRef} data-open={aberto ? "" : undefined}>
      <button
        ref={triggerRef}
        className="vert__trigger"
        type="button"
        aria-expanded={aberto}
        aria-controls={menuId}
        onClick={() => setAberto((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setAberto(true);
            requestAnimationFrame(() =>
              wrapRef.current?.querySelector<HTMLElement>(".vert__menu a")?.focus()
            );
          }
        }}
      >
        Outras verticais
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Sempre no DOM: `display` é controlado por [data-open]. Manter no DOM
          preserva a ordem de tabulação e evita reflow do header. */}
      <div className="vert__menu" id={menuId} role="group" aria-label="Verticais do grupo Bohac">
        {VERTICAIS.map((v) =>
          v.href ? (
            <a
              key={v.nome}
              href={v.href}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={aberto ? 0 : -1}
              onClick={() => setAberto(false)}
            >
              <span className="vert__dot" style={{ background: v.accent }} aria-hidden="true" />
              <span className="vert__nome">{v.nome}</span>
              <span className="vert__area">{v.area}</span>
            </a>
          ) : (
            <a
              key={v.nome}
              href="/"
              aria-current="page"
              tabIndex={aberto ? 0 : -1}
              onClick={() => setAberto(false)}
            >
              <span className="vert__dot" style={{ background: v.accent }} aria-hidden="true" />
              <span className="vert__nome">{v.nome}</span>
              <span className="vert__tag">atual</span>
            </a>
          )
        )}
      </div>
    </div>
  );
}
