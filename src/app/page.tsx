"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const WA_NUMBER = "5518999999999";

function NavLogo() {
  return (
    <a href="#topo" className="nav__logo" aria-label="Bohac Med — início">
      <svg
        viewBox="530 245 140 295"
        width="48"
        height="102"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M600 250 l70 40 v80 c0 90 -40 140 -70 160 c-30 -20 -70 -70 -70 -160 v-80 z"
          stroke="#BF9A57"
          strokeWidth="8"
        />
        <path
          d="M600 330 v90 M560 375 h80"
          stroke="#BF9A57"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
      <span style={{ fontFamily:"Cormorant Garamond, Georgia, serif", fontSize:20, fontWeight:600, letterSpacing:"0.14em", color:"#F6F2EA", lineHeight:1, marginTop:2 }}>
        BOHAC
      </span>
      <span style={{ fontFamily:"Cormorant Garamond, Georgia, serif", fontSize:13, fontWeight:600, letterSpacing:"0.32em", color:"#BF9A57", lineHeight:1, marginTop:4 }}>
        MED
      </span>
    </a>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [cnpj, setCnpj] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [showWa, setShowWa] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sticky header + WA float on scroll
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 40);
      setShowWa(y > 560);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reveal on scroll
  useEffect(() => {
    document.documentElement.classList.add("motion-ok");
    const reveals: Element[] = Array.from(document.querySelectorAll(".reveal"));
    function checkReveals() {
      const vh = window.innerHeight;
      for (let i = reveals.length - 1; i >= 0; i--) {
        const r = reveals[i].getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) {
          reveals[i].classList.add("in");
          reveals.splice(i, 1);
        }
      }
    }
    window.addEventListener("scroll", checkReveals, { passive: true });
    window.addEventListener("resize", checkReveals, { passive: true });
    checkReveals();
    const t = setTimeout(() => reveals.forEach(el => el.classList.add("in")), 2500);
    return () => {
      window.removeEventListener("scroll", checkReveals);
      window.removeEventListener("resize", checkReveals);
      clearTimeout(t);
    };
  }, []);

  // WebGL hero canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false }) as WebGL2RenderingContext | null;
    if (!gl) { canvas.style.display = "none"; return; }
    const hero = canvas.closest(".hero") as HTMLElement;
    if (!hero) { canvas.style.display = "none"; return; }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const vsSrc = `#version 300 es\nprecision highp float;\nin vec4 position;\nvoid main(){gl_Position=position;}`;
    const fsSrc = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)
float rnd(vec2 p){p=fract(p*vec2(12.9898,78.233));p+=dot(p,p+34.56);return fract(p.x*p.y);}
float noise(in vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);float a=rnd(i),b=rnd(i+vec2(1,0)),c=rnd(i+vec2(0,1)),d=rnd(i+1.);return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
float fbm(vec2 p){float t=.0,a=1.;mat2 m=mat2(1.,-.5,.2,1.2);for(int i=0;i<5;i++){t+=a*noise(p);p*=2.*m;a*=.5;}return t;}
float clouds(vec2 p){float d=1.,t=.0;for(float i=.0;i<3.;i++){float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);t=mix(t,d,a);d=a;p*=2./(i+1.);}return t;}
void main(void){
  vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
  vec3 col=vec3(0);
  float bg=clouds(vec2(st.x+T*.4,-st.y));
  uv*=1.-.3*(sin(T*.2)*.5+.5);
  for(float i=1.;i<12.;i++){
    uv+=.1*cos(i*vec2(.1+.01*i,.8)+i*i+T*.4+.1*uv.x);
    vec2 p=uv;
    float d=length(p);
    col+=.0012/d*vec3(1.0,0.76,0.42);
    float b=noise(i+p+bg*1.731);
    col+=.0016*b/length(max(p,vec2(b*p.x*.02,p.y)))*vec3(0.93,0.71,0.39);
    col=mix(col,vec3(bg*.03,bg*.065,bg*.13),d);
  }
  O=vec4(col,1.);
}`;
    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsSrc));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsSrc));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.style.display = "none"; return; }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,-1,-1,1,1,1,-1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "resolution");
    const uTime = gl.getUniformLocation(prog, "time");
    const dpr = Math.max(1, 0.5 * (window.devicePixelRatio || 1));
    function resize() {
      const w = hero.clientWidth || window.innerWidth;
      const h = hero.clientHeight || window.innerHeight;
      canvas!.width = Math.max(1, Math.floor(w * dpr));
      canvas!.height = Math.max(1, Math.floor(h * dpr));
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });
    function draw(t: number) {
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      gl!.uniform1f(uTime, t);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }
    if (reduce) { draw(8.0); return; }
    let raf: number;
    const start = performance.now();
    function loop(now: number) { draw((now - start) * 1e-3); raf = requestAnimationFrame(loop); }
    raf = requestAnimationFrame(loop);
    const onVis = () => { if (document.hidden) cancelAnimationFrame(raf); else { raf = requestAnimationFrame(loop); } };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);
    };
  }, []);

  function formatarCNPJ(valor: string) {
    const nums = valor.replace(/\D/g, "").slice(0, 14);
    return nums
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  async function handleAnalisar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const cnpjLimpo = cnpj.replace(/\D/g, "");
    if (cnpjLimpo.length !== 14) {
      setErro("Digite um CNPJ válido com 14 dígitos.");
      return;
    }
    setCarregando(true);
    try {
      const res = await fetch("/api/analisar-cnpj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cnpj: cnpjLimpo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro ?? "Erro ao analisar CNPJ.");
      sessionStorage.setItem("resultado", JSON.stringify(data.resultado));
      router.push("/resultado");
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      {/* ===== HEADER ===== */}
      <header className={`site-header${scrolled ? " scrolled" : ""}`}>
        <div className="wrap nav">
          <NavLogo />
          <nav className="nav__links" aria-label="Navegação principal">
            <a href="#tese">A tese</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#beneficia">Quem se beneficia</a>
            <a href="#areas">Outras áreas</a>
          </nav>
          <div className="nav__cta">
            <a className="btn btn--gold" href="#verificar">Verificar meu CNPJ</a>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="hero hero--eq" id="topo">
        <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />
        <div className="wrap">
          <div className="hero__grid">
            <div className="hero__copy">
              <div className="hero__tagrow reveal">
                <span className="kicker on-navy">Análise tributária gratuita</span>
              </div>
              <h1 className="reveal" data-d="1">
                Sua clínica pode estar pagando imposto <em>a mais.</em>
              </h1>
              <p className="hero__sub reveal" data-d="2">
                A tese da <strong style={{ color:"#f1ece1" }}>equiparação hospitalar</strong> permite que médicos e clínicas
                reduzam a base de cálculo do IRPJ e da CSLL sobre a receita bruta — de forma legal e reconhecida pelo STJ.
              </p>
              <div className="hero__highlight reveal" data-d="3">
                <span className="hero__pill">Base IRPJ <s>32%</s> <b>8%</b></span>
                <span className="hero__pill">Base CSLL <s>32%</s> <b>12%</b></span>
                <span className="hero__pill"><b>5 anos</b> retroativos</span>
              </div>
              <div className="legal-strip reveal" data-d="4">
                <span className="li">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 3h8l3 5-7 13L4 8z"/><path d="M8 3l4 5 4-5M4 8h16"/></svg>
                  <span><b>Arts. 15 e 20</b> · Lei 9.249/95</span>
                </span>
                <span className="li">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 21h18"/><path d="M5 21V8h14v13"/><path d="M9 21v-5h6v5"/><path d="M5 8l7-5 7 5"/></svg>
                  <span><b>STJ</b> · Repetitivo Tema 217</span>
                </span>
                <span className="li">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 2h9l3 3v17l-2-1-2 1-2-1-2 1-2-1-2 1V2z"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>
                  <span><b>Receita Federal</b> · IN RFB 1.700/2017</span>
                </span>
                <a className="li" href="/cnaes-elegiveis">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></svg>
                  <span><b>38 CNAEs</b> elegíveis →</span>
                </a>
              </div>
            </div>

            {/* VERIFICADOR */}
            <div className="hero__media reveal" data-d="2" id="verificar">
              <div className={`checker${erro ? " invalid" : ""}`}>
                <div className="checker__top">
                  <span className="checker__badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                  </span>
                  <div>
                    <h3>Verifique gratuitamente</h3>
                  </div>
                </div>
                <p className="checker__sub">Informe o CNPJ da sua clínica e descubra em segundos se você tem direito à redução.</p>
                <form onSubmit={handleAnalisar} noValidate>
                  <div className="checker__field">
                    <label htmlFor="cnpj">CNPJ da empresa</label>
                    <div className="checker__input-row">
                      <input
                        className="checker__input"
                        id="cnpj"
                        type="text"
                        inputMode="numeric"
                        placeholder="00.000.000/0000-00"
                        autoComplete="off"
                        value={cnpj}
                        onChange={e => { setCnpj(formatarCNPJ(e.target.value)); setErro(""); }}
                        disabled={carregando}
                      />
                    </div>
                    {erro && <span className="checker__err">{erro}</span>}
                  </div>
                  <button type="submit" className="btn btn--gold btn-lg checker__submit" disabled={carregando}>
                    {carregando ? "Analisando…" : <>Verificar agora — é grátis <span className="arrow">→</span></>}
                  </button>
                  <div className="checker__trust">
                    <span className="t">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>
                      Dados protegidos
                    </span>
                    <span className="t">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 3L4 14h7l-1 7 9-11h-7z"/></svg>
                      Resultado em segundos
                    </span>
                    <span className="t">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 6L9 17l-5-5"/></svg>
                      100% gratuito
                    </span>
                  </div>
                  <p className="checker__alt">
                    <a href="/analise">Analisar pela descrição de serviços →</a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ESTATÍSTICAS ===== */}
      <section className="stats section-pad">
        <div className="wrap">
          <div className="stats-grid">
            <div className="stat-cell reveal" data-d="1">
              <span className="big"><span className="from">32%</span> <span className="to">8%</span></span>
              <div className="lab">Redução da base do IRPJ</div>
              <div className="desc">A CSLL cai de 32% para 12% — sobre a receita bruta, não o lucro.</div>
            </div>
            <div className="stat-cell reveal" data-d="2">
              <span className="big">5 <span style={{ fontSize:".5em", color:"var(--gold-600)", alignSelf:"center" }}>anos</span></span>
              <div className="lab">Recuperação retroativa</div>
              <div className="desc">Prazo para reaver, na Justiça, os impostos pagos a mais no passado.</div>
            </div>
            <div className="stat-cell reveal" data-d="3">
              <span className="big">Tema <span className="to">217</span></span>
              <div className="lab">Jurisprudência do STJ</div>
              <div className="desc">Tese consolidada em recurso repetitivo pelo Superior Tribunal de Justiça.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== A TESE ===== */}
      <section className="tese section-pad" id="tese">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">A tese tributária</span>
            <h2>O que é a equiparação hospitalar?</h2>
            <p className="lede">Um direito previsto em lei e reconhecido pelos tribunais — que a maioria dos contadores ainda desconhece.</p>
          </div>
          <div className="tese-grid">
            <article className="tese-card reveal" data-d="1">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3v18"/><path d="M6 7h12"/><path d="M6 7l-3 6a3 3 0 006 0z"/><path d="M18 7l-3 6a3 3 0 006 0z"/><path d="M8 21h8"/></svg>
              </span>
              <h3>Base legal sólida</h3>
              <p>Prevista no art. 15, §1º, III, "a" da <b>Lei 9.249/95</b> e reconhecida pelo STJ no Tema 217. Não é artifício — é um direito seu.</p>
            </article>
            <article className="tese-card reveal" data-d="2">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6l6 6 4-4 7 7"/><path d="M21 15v-5h-5"/><path d="M3 20h18"/></svg>
              </span>
              <h3>Redução real de impostos</h3>
              <p>A base do IRPJ cai de 32% para 8% e a da CSLL de 32% para 12%. Para uma clínica com <b>R$ 500 mil/ano</b>, isso pode significar mais de <b>R$ 60 mil</b> de economia.</p>
            </article>
            <article className="tese-card reveal" data-d="3">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 21V8l8-5 8 5v13"/><path d="M4 21h16"/><path d="M12 11v6M9 14h6"/></svg>
              </span>
              <h3>Para quem se aplica</h3>
              <p>Clínicas médicas, laboratórios, diagnóstico por imagem, fisioterapia, cirurgia ambulatorial, hemodiálise e outros serviços de natureza hospitalar.</p>
            </article>
          </div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section className="how section-pad" id="como-funciona">
        <div className="wrap">
          <div className="section-head center reveal">
            <span className="kicker center">Como funciona</span>
            <h2>Análise em menos de 10 segundos.</h2>
            <p className="lede">Um diagnóstico inicial automático, gratuito e sem compromisso — antes mesmo de falar com a gente.</p>
          </div>
          <div className="steps">
            <div className="step reveal" data-d="1">
              <div className="step__n">1</div><div className="step__bar"></div>
              <h3>Informe o CNPJ</h3>
              <p>Digite o CNPJ da sua clínica ou empresa médica. Consultamos os dados na Receita Federal.</p>
            </div>
            <div className="step reveal" data-d="2">
              <div className="step__n">2</div><div className="step__bar"></div>
              <h3>Análise automática</h3>
              <p>Verificamos os CNAEs cadastrados e comparamos com a lista de atividades elegíveis para a tese.</p>
            </div>
            <div className="step reveal" data-d="3">
              <div className="step__n">3</div><div className="step__bar"></div>
              <h3>Resultado imediato</h3>
              <p>Você recebe um diagnóstico claro: viabilidade alta, média, baixa ou não elegível, em linguagem simples.</p>
            </div>
            <div className="step reveal" data-d="4">
              <div className="step__n">4</div><div className="step__bar"></div>
              <h3>Análise completa</h3>
              <p>Havendo viabilidade, nossa equipe calcula o valor exato recuperável e entra em contato.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== QUEM SE BENEFICIA ===== */}
      <section className="benef section-pad" id="beneficia">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker on-navy">Atividades elegíveis</span>
            <h2>Quem pode se beneficiar da tese.</h2>
            <p className="lede" style={{ color:"var(--muted-on-navy)" }}>Serviços de natureza hospitalar enquadrados na Divisão 86 do IBGE — são 38 CNAEs potencialmente elegíveis.</p>
            <a className="benef__cta reveal" data-d="1" href="/cnaes-elegiveis">Ver a lista completa de CNAEs elegíveis →</a>
          </div>
          <div className="benef-grid">
            {[
              { icon: <><path d="M6 3v6a4 4 0 008 0V3"/><path d="M6 3h0M14 3h0"/><path d="M10 17v2a3 3 0 006 0 3 3 0 013-3"/><circle cx="19" cy="11" r="2"/></>, label: "Clínicas médicas" },
              { icon: <><path d="M9 3h6"/><path d="M10 3v5l-5 9a3 3 0 003 4h8a3 3 0 003-4l-5-9V3"/><path d="M7 15h10"/></>, label: "Laboratórios" },
              { icon: <><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3.5"/><path d="M7 5V3h10v2"/></>, label: "Diagnóstico por imagem" },
              { icon: <><path d="M3 12h4l2 5 4-12 2 7h6"/></>, label: "Fisioterapia" },
              { icon: <><path d="M14 4l6 6"/><path d="M4 20l8.5-8.5 1.5 1.5L5.5 21.5z"/><path d="M14.5 6.5l3 3"/><path d="M17 3l4 4"/></>, label: "Cirurgia ambulatorial" },
              { icon: <><path d="M12 3c4 5 6 8 6 11a6 6 0 01-12 0c0-3 2-6 6-11z"/></>, label: "Hemodiálise" },
              { icon: <><path d="M3 12a9 9 0 0118 0"/><path d="M3 12l3 3 3-6 3 9 3-12 3 9 3-3"/></>, label: "Pronto atendimento" },
              { icon: <><path d="M4 21V8l8-5 8 5v13"/><path d="M4 21h16"/><path d="M12 10v6M9 13h6"/></>, label: "Day clinics & hospitais" },
            ].map(({ icon, label }, i) => (
              <div key={i} className="benef-item reveal" data-d={String((i % 4) + 1)}>
                <span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{icon}</svg></span>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <p className="benef__note reveal" data-d="2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>
            Não tem certeza se sua atividade se enquadra? O verificador analisa seu CNPJ específico em segundos.
          </p>
        </div>
      </section>

      {/* ===== OUTRAS ÁREAS ===== */}
      <section className="areas section-pad" id="areas">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">Além da tese tributária</span>
            <h2>A Bohac Med cuida de todo o jurídico do médico.</h2>
            <p className="lede">A equiparação hospitalar é só o começo. Somos um escritório dedicado ao setor da saúde, do consultório à gestão.</p>
          </div>
          <div className="areas-grid">
            <div className="area-item reveal" data-d="1">
              <span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z"/></svg></span>
              <h4>Direito Médico</h4>
              <p>Defesa em conselhos (CRM) e em ações por suposto erro médico.</p>
            </div>
            <div className="area-item reveal" data-d="2">
              <span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21h18"/><path d="M5 21V8l7-4 7 4v13"/><path d="M9 21v-6h6v6"/></svg></span>
              <h4>Direito Empresarial</h4>
              <p>Estruturação de clínicas, contratos e a operação jurídica do dia a dia.</p>
            </div>
            <div className="area-item reveal" data-d="3">
              <span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12l2 2 4-4"/><path d="M5 7h14v12a2 2 0 01-2 2H7a2 2 0 01-2-2z"/><path d="M9 3h6v4H9z"/></svg></span>
              <h4>Contratos &amp; Societário</h4>
              <p>Sociedades, holding, sucessão e acordos entre sócios.</p>
            </div>
            <div className="area-item reveal" data-d="4">
              <span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z"/><path d="M9 12l2 2 4-4"/></svg></span>
              <h4>Compliance &amp; LGPD</h4>
              <p>Governança de dados de pacientes e conformidade regulatória.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="final section-pad">
        <div className="wrap">
          <div className="final__inner reveal">
            <span className="kicker center on-navy">Comece agora</span>
            <h2>Verifique se sua clínica tem esse direito.</h2>
            <p>A análise é gratuita e leva menos de 10 segundos. Sem compromisso.</p>
            <div className="final__actions">
              <a className="btn btn--gold btn-lg" href="#verificar">Verificar meu CNPJ <span className="arrow">→</span></a>
              <a className="btn btn--ghost-light btn-lg" href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer">Falar com um advogado</a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer__top">
            <div className="footer__brand">
              <NavLogo />
              <p style={{ marginTop: 20 }}>Advogados associados · Setor médico. Bohac Med é um serviço da Bohac Sociedade de Advogados dedicado à advocacia para médicos, clínicas e empresas da saúde.</p>
            </div>
            <div className="footer__col">
              <h4>Navegação</h4>
              <a href="#tese">A tese tributária</a>
              <a href="#como-funciona">Como funciona</a>
              <a href="#beneficia">Quem se beneficia</a>
              <a href="#areas">Outras áreas</a>
              <a href="#verificar">Verificar CNPJ</a>
            </div>
            <div className="footer__col">
              <h4>Contato</h4>
              <a href="tel:+551832226245">(18) 3222-6245</a>
              <a href="mailto:contato@bohacadvocacia.com.br">contato@bohacadvocacia.com.br</a>
              <a href="https://www.instagram.com/bohac.advocacia/" target="_blank" rel="noopener noreferrer">@bohac.advocacia</a>
              <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
          </div>
          <div className="footer__bottom">
            <span className="oab">© {new Date().getFullYear()} Bohac Sociedade de Advogados — CNPJ 39.293.156/0001-43 · OAB/SP</span>
            <div className="footer__social">
              <a href="https://www.instagram.com/bohac.advocacia/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
              </a>
              <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1112 20z"/></svg>
              </a>
            </div>
          </div>
          <p style={{ marginTop:24, fontSize:12, color:"var(--muted-on-navy)", lineHeight:1.6, maxWidth:880 }}>
            Bohac Med é um serviço de triagem automatizada com fins informativos e não constitui parecer jurídico. As estimativas apresentadas pelo verificador são ilustrativas. A aplicação da tese depende de análise documental específica de cada caso.
          </p>
        </div>
      </footer>

      {/* ===== WHATSAPP FLOAT ===== */}
      <a
        className={`wa-float${showWa ? " show" : ""}`}
        href={`https://wa.me/${WA_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Fale no WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1112 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.6 6.6 0 01-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.1 0-.3 0-.4l-.7-1.7c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.7.7-.9 1.6-.6 2.6.6 2 2 3.4 3.9 4.4.6.3 1.6.6 2.3.5.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.1-.4-.2z"/></svg>
      </a>
    </>
  );
}
