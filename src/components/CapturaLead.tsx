"use client";

import { useState } from "react";

/**
 * Captura de lead — as três modalidades.
 *
 * Antes existia só na modalidade de notas fiscais, e apenas quando o
 * resultado era favorável: as consultas por CNPJ e por Cartão CNPJ
 * entregavam parecer e não registravam contato nenhum.
 *
 * Exigia nome + e-mail + telefone, os três. Agora: nome e **ao menos um**
 * meio de contato. Menos atrito, mesma qualidade de lead.
 *
 * O parecer aparece na tela ANTES deste formulário. O visitante vê o valor
 * e então decide se quer o PDF.
 */

export function contatoValido(email: string, telefone: string) {
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const telOk = telefone.replace(/\D/g, "").length >= 10;
  return { emailOk, telOk, algum: emailOk || telOk };
}

function maskTel(v: string) {
  const n = v.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 10) return n.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  return n.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
}

export default function CapturaLead({
  payloadExtra,
  aoConcluir,
  titulo = "Receba este parecer em PDF",
  descricao = "Informe seu nome e um meio de contato. O documento fica disponível para download e uma via é encaminhada ao escritório.",
}: {
  payloadExtra: Record<string, unknown>;
  aoConcluir: () => void;
  titulo?: string;
  descricao?: string;
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!nome.trim()) { setErro("Informe seu nome."); return; }
    const { algum, emailOk } = contatoValido(email, telefone);
    if (!algum) { setErro("Informe um e-mail válido ou um número de WhatsApp com DDD."); return; }
    if (email.trim() && !emailOk) { setErro("O e-mail informado não parece válido."); return; }

    setEnviando(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, telefone, origem: "site", ...payloadExtra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro ?? "Não foi possível registrar.");
      setEnviado(true);
      aoConcluir();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally { setEnviando(false); }
  }

  if (enviado) {
    return (
      <div className="lead lead--ok print-hide">
        <p className="lead__ok-t">Parecer liberado</p>
        <p className="lead__ok-d">
          Use o botão acima para baixar o PDF. O escritório recebeu uma via e entrará em
          contato pelo meio informado.
        </p>
      </div>
    );
  }

  return (
    <form className="lead print-hide" onSubmit={enviar} noValidate>
      <h3 className="lead__t">{titulo}</h3>
      <p className="lead__d">{descricao}</p>

      <div className="lead__campos">
        <label>
          <span>Nome</span>
          <input value={nome} onChange={(e) => setNome(e.target.value)}
            placeholder="Dr. João da Silva" autoComplete="name" />
        </label>
        <label>
          <span>E-mail</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="contato@clinica.com.br" inputMode="email" autoComplete="email" />
        </label>
        <label>
          <span>WhatsApp</span>
          <input value={telefone} onChange={(e) => setTelefone(maskTel(e.target.value))}
            placeholder="(18) 99999-9999" inputMode="tel" autoComplete="tel" />
        </label>
      </div>

      <p className="lead__hint">E-mail ou WhatsApp — ao menos um dos dois.</p>
      {erro && <p className="lead__erro">{erro}</p>}

      <button type="submit" className="btn btn--gold" disabled={enviando}>
        {enviando ? "Registrando…" : "Liberar o parecer em PDF"}
      </button>

      <p className="lead__lgpd">
        Os dados informados são usados para o envio do parecer e para contato do escritório.
        Consulte a <a href="/privacidade">política de privacidade</a>.
      </p>
    </form>
  );
}
