import { ESCRITORIO } from "@/lib/verticais";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__top">
          <div className="footer__brand">
            <img src="/logo-inverted.png" alt="Bohac Med" width={180} height={52} />
            <p>
              Frente do {ESCRITORIO.razaoSocial} dedicada ao direito médico e da saúde.
              Atua no enquadramento de prestadores de serviços médicos ao regime de
              equiparação hospitalar (art. 15, §1º, III, &quot;a&quot; da Lei 9.249/1995,
              com a redação da Lei 11.727/2008) e nas demais frentes jurídicas da clínica.
            </p>
          </div>

          <div className="footer__col">
            <h4>Nesta página</h4>
            <a href="/#tese">A tese da equiparação</a>
            <a href="/#como-funciona">Como funciona</a>
            <a href="/#beneficiarios">Quem se beneficia</a>
            <a href="/areas">Atuação na clínica</a>
            <a href="/tese">Fundamento jurídico</a>
          </div>

          <div className="footer__col">
            <h4>Contato</h4>
            <a href={`tel:+55${ESCRITORIO.whatsapp.slice(2)}`}>{ESCRITORIO.telefone}</a>
            <a href={`mailto:${ESCRITORIO.email}`}>{ESCRITORIO.email}</a>
            <p>
              {ESCRITORIO.endereco[0]}
              <br />
              {ESCRITORIO.endereco[1]}
              <br />
              {ESCRITORIO.endereco[2]} — {ESCRITORIO.endereco[3]}
            </p>
          </div>

          <div className="footer__col">
            <h4>Institucional</h4>
            <a href={ESCRITORIO.sitePrincipal} target="_blank" rel="noopener noreferrer">
              Site principal
            </a>
            <a href="/privacidade">Política de privacidade</a>
            <a href="/termos">Termos de uso</a>
          </div>
        </div>

        <div className="footer__bottom">
          <span className="oab">
            © {new Date().getFullYear()} {ESCRITORIO.razaoSocial} · OAB/SP
          </span>
          <div className="footer__social">
            <a
              href={ESCRITORIO.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram do escritório"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r=".5" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>

        <p className="footer__aviso">
          Conteúdo de caráter exclusivamente informativo, nos termos do Provimento
          205/2021 do Conselho Federal da OAB e do Código de Ética e Disciplina.
          Não constitui oferta de serviços em relação a caso concreto nem substitui
          a análise individualizada.
        </p>
      </div>
    </footer>
  );
}
