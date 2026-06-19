"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* ── WebGL shader (golden flowing light) ── */
const VERT = `
attribute vec2 a_pos;
void main(){gl_Position=vec4(a_pos,0,1);}
`;
const FRAG = `
precision mediump float;
uniform float u_t;
uniform vec2  u_res;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
}
float fbm(vec2 p){
  float v=0.,a=.5;
  for(int i=0;i<5;i++){v+=a*noise(p);p*=2.1;a*=.5;}
  return v;
}
void main(){
  vec2 uv=gl_FragCoord.xy/u_res;
  uv.x*=u_res.x/u_res.y;
  float t=u_t*.04;
  vec2 q=vec2(fbm(uv+t),fbm(uv+vec2(1.4,3.7)+t*.7));
  float f=fbm(uv+1.8*q+vec2(1.7,9.2)+.15*t);
  vec3 gold=vec3(.75,.60,.34);
  vec3 deep=vec3(.04,.09,.15);
  vec3 mid=vec3(.07,.14,.22);
  vec3 col=mix(deep,mid,.7*f);
  col=mix(col,gold*.55,clamp(f*f*2.2,0.,1.));
  float vign=1.-dot(uv-.5,uv-.5)*1.8;
  col*=vign;
  gl_FragColor=vec4(col,1.);
}
`;

function initWebGL(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl");
  if (!gl) return null;
  function sh(type: number, src: string) {
    const s = gl!.createShader(type)!;
    gl!.shaderSource(s, src); gl!.compileShader(s); return s;
  }
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog); gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uT  = gl.getUniformLocation(prog, "u_t");
  const uRes= gl.getUniformLocation(prog, "u_res");
  return { gl, prog, uT, uRes };
}

/* ── CNPJ mask ── */
function maskCNPJ(v: string) {
  return v.replace(/\D/g,"").slice(0,14)
    .replace(/^(\d{2})(\d)/,"$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/,"$1.$2.$3")
    .replace(/\.(\d{3})(\d)/,".$1/$2")
    .replace(/(\d{4})(\d)/,"$1-$2");
}
function validCNPJ(c: string) {
  const n = c.replace(/\D/g,"");
  if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false;
  const calc = (s: string, w: number[]) =>
    w.reduce((a,b,i)=>a+parseInt(s[i])*b,0);
  const w1=[5,4,3,2,9,8,7,6,5,4,3,2];
  const w2=[6,5,4,3,2,9,8,7,6,5,4,3,2];
  const d1=calc(n,w1)%11; const r1=d1<2?0:11-d1;
  const d2=calc(n,w2)%11; const r2=d2<2?0:11-d2;
  return r1===parseInt(n[12])&&r2===parseInt(n[13]);
}

export default function HomePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const waRef     = useRef<HTMLAnchorElement>(null);
  const [cnpj, setCnpj] = useState("");
  const [err,  setErr]  = useState(false);

  /* WebGL */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = initWebGL(canvas);
    if (!ctx) return;
    const { gl, uT, uRes } = ctx;
    let raf: number, t = 0;
    function resize() {
      canvas!.width  = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
      gl.viewport(0,0,canvas!.width,canvas!.height);
    }
    resize();
    window.addEventListener("resize", resize);
    function loop() {
      t++;
      gl.uniform1f(uT, t);
      gl.uniform2f(uRes, canvas!.width, canvas!.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(loop);
    }
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  }, []);

  /* Header scroll + WA float + reveal */
  useEffect(() => {
    const hdr = headerRef.current;
    const wa  = waRef.current;
    const body = document.body;

    if (!window.matchMedia("(prefers-reduced-motion:reduce)").matches) {
      body.classList.add("motion-ok");
    }
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => e.target.classList.toggle("in", e.isIntersecting)),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));

    function onScroll() {
      const y = window.scrollY;
      hdr?.classList.toggle("scrolled", y > 60);
      wa?.classList.toggle("show", y > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); obs.disconnect(); };
  }, []);

  /* Form submit */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validCNPJ(cnpj)) { setErr(true); return; }
    setErr(false);
    router.push(`/resultado?cnpj=${cnpj.replace(/\D/g,"")}`);
  }

  return (
    <>
      {/* ── HEADER ── */}
      <header className="site-header" ref={headerRef}>
        <div className="wrap">
          <nav className="nav">
            <a className="nav__logo" href="#topo">
              <img src="/logo-inverted.png" alt="Bohac Med" />
            </a>
            <div className="nav__links">
              <a href="#tese">A Tese</a>
              <a href="#como-funciona">Como Funciona</a>
              <a href="#beneficiarios">Quem se Beneficia</a>
              <a href="#areas">Outras Áreas</a>
            </div>
            <div className="nav__cta">
              <a
                href="https://wa.me/5518996205555?text=Olá,%20gostaria%20de%20verificar%20minha%20elegibilidade%20para%20equiparação%20hospitalar"
                target="_blank"
                rel="noopener"
                className="btn btn--gold"
              >
                Fale com especialista
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="hero hero--eq section-pad" id="topo">
        <canvas className="hero__canvas" ref={canvasRef} />
        <div className="wrap">
          <div className="hero__grid">
            {/* Coluna esquerda */}
            <div>
              <div className="hero__tagrow reveal">
                <span className="kicker on-navy">Equiparação Hospitalar</span>
              </div>
              <h1 className="reveal" data-d="1">
                Reduza os impostos da sua clínica em até{" "}
                <em>60%</em> com amparo legal
              </h1>
              <div className="hero__highlight reveal" data-d="2">
                <span className="hero__pill">
                  <b>IRPJ</b> <s>32%</s> → <b>8%</b>
                </span>
                <span className="hero__pill">
                  <b>CSLL</b> <s>12%</s> → <b>3,08%</b>
                </span>
              </div>
              <div className="hero__actions reveal" data-d="3">
                <a
                  href="https://wa.me/5518996205555?text=Quero%20verificar%20minha%20elegibilidade"
                  target="_blank"
                  rel="noopener"
                  className="btn btn--gold btn-lg"
                >
                  Verificar elegibilidade
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
                <a href="#tese" className="btn btn--ghost-light btn-lg">
                  Entender a tese
                </a>
              </div>

              {/* Legal strip */}
              <div className="legal-strip reveal" data-d="4">
                <span className="li">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3h8l3 5-7 13L4 8z"/><path d="M8 3l4 5 4-5M4 8h16"/>
                  </svg>
                  <span><b>Arts. 15 e 20</b> do RIR</span>
                </span>
                <span className="li">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18"/><path d="M5 21V8h14v13"/><path d="M9 21v-5h6v5"/><path d="M5 8l7-5 7 5"/>
                  </svg>
                  <span><b>STJ</b> — jurisprudência consolidada</span>
                </span>
                <span className="li">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2h9l3 3v17l-2-1-2 1-2-1-2 1-2-1-2 1V2z"/><path d="M9 7h6M9 11h6M9 15h4"/>
                  </svg>
                  <span><b>Receita Federal</b> reconhece</span>
                </span>
                <span className="li">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>
                  </svg>
                  <span><b>CNAEs</b> específicos</span>
                </span>
              </div>
            </div>

            {/* Coluna direita — Checker */}
            <div className="reveal" data-d="2">
              <div className="checker">
                <form className="checker__form" onSubmit={handleSubmit}>
                  <div className="checker__top">
                    <div className="checker__badge">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z"/>
                        <path d="M9 12l2 2 4-4"/>
                      </svg>
                    </div>
                    <h3>Verificação de Elegibilidade</h3>
                  </div>
                  <p className="checker__sub">Análise gratuita em segundos. Sem compromisso.</p>
                  <div className={`checker__field${err ? " invalid" : ""}`}>
                    <label htmlFor="cnpj-input">CNPJ da sua empresa</label>
                    <div className="checker__input-row">
                      <input
                        id="cnpj-input"
                        className="checker__input"
                        type="text"
                        inputMode="numeric"
                        placeholder="00.000.000/0000-00"
                        value={cnpj}
                        onChange={e => { setCnpj(maskCNPJ(e.target.value)); setErr(false); }}
                        maxLength={18}
                        autoComplete="off"
                      />
                    </div>
                    <p className="checker__err">CNPJ inválido. Verifique e tente novamente.</p>
                  </div>
                  <button type="submit" className="btn btn--gold btn-lg checker__submit">
                    Verificar agora
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </button>
                  <div className="checker__trust">
                    <span className="t">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z"/></svg>
                      100% seguro
                    </span>
                    <span className="t">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                      Resultado em segundos
                    </span>
                    <span className="t">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>
                      Sem custo
                    </span>
                  </div>
                  <p className="checker__alt">
                    Prefere falar com um especialista?{" "}
                    <a
                      href="https://wa.me/5518996205555?text=Quero%20verificar%20elegibilidade%20para%20equiparação%20hospitalar"
                      target="_blank"
                      rel="noopener"
                    >
                      Clique aqui
                    </a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ESTATÍSTICAS ── */}
      <section className="stats section-pad">
        <div className="wrap">
          <div className="stats-grid reveal">
            <div className="stat-cell">
              <div className="big">
                <span className="from">32%</span>
                <span className="to">8%</span>
              </div>
              <p className="lab">IRPJ sobre receita bruta</p>
              <p className="desc">Redução de base de cálculo via equiparação hospitalar</p>
            </div>
            <div className="stat-cell">
              <div className="big">
                <span className="from">12%</span>
                <span className="to">3,08%</span>
              </div>
              <p className="lab">CSLL efetiva</p>
              <p className="desc">De 12% para 3,08% sobre o faturamento total</p>
            </div>
            <div className="stat-cell">
              <div className="big">
                <span>+60%</span>
              </div>
              <p className="lab">Economia tributária</p>
              <p className="desc">Média obtida pelos clientes atendidos pelo escritório</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── A TESE ── */}
      <section className="tese section-pad" id="tese">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">Fundamento jurídico</span>
            <h2>A tese que garante sua economia</h2>
            <p className="lede">
              A equiparação hospitalar é um direito previsto em lei federal e reconhecido pelos tribunais superiores. Clínicas e prestadores de serviços de saúde podem reduzir drasticamente sua carga tributária no Lucro Presumido.
            </p>
          </div>
          <div className="tese-grid">
            <div className="tese-card reveal" data-d="1">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v18"/><path d="M6 7h12"/>
                  <path d="M6 7l-3 6a3 3 0 006 0z"/>
                  <path d="M18 7l-3 6a3 3 0 006 0z"/>
                  <path d="M8 21h8"/>
                </svg>
              </div>
              <h3>Base legal sólida</h3>
              <p>
                Fundamento nos <b>Arts. 15 e 20 do RIR</b> e consolidada no STJ. A tese está pacificada nos tribunais superiores e reconhecida pela Receita Federal para CNAEs específicos.
              </p>
            </div>
            <div className="tese-card reveal" data-d="2">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6l6 6 4-4 7 7"/><path d="M21 15v-5h-5"/><path d="M3 20h18"/>
                </svg>
              </div>
              <h3>Redução real</h3>
              <p>
                IRPJ cai de <b>32% para 8%</b> e CSLL de 12% para 3,08% sobre receita bruta — resultado imediato já no próximo trimestre de apuração.
              </p>
            </div>
            <div className="tese-card reveal" data-d="3">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 21V8l8-5 8 5v13"/><path d="M4 21h16"/><path d="M12 11v6M9 14h6"/>
                </svg>
              </div>
              <h3>Para quem se aplica</h3>
              <p>
                Clínicas médicas, odontológicas, laboratórios, centros de diagnóstico por imagem e outros prestadores de <b>serviços hospitalares equiparados</b>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="how section-pad" id="como-funciona">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">Processo</span>
            <h2>Como funciona</h2>
            <p className="lede">
              Do diagnóstico fiscal à recuperação de créditos, nosso processo é estruturado para maximizar sua economia com total segurança jurídica.
            </p>
          </div>
          <div className="steps">
            <div className="step reveal" data-d="1">
              <div className="step__n">01</div>
              <div className="step__bar" />
              <h3>Verificação do CNPJ</h3>
              <p>Analisamos seu CNAE e regime tributário para confirmar a elegibilidade para a equiparação hospitalar.</p>
            </div>
            <div className="step reveal" data-d="2">
              <div className="step__n">02</div>
              <div className="step__bar" />
              <h3>Diagnóstico tributário</h3>
              <p>Levantamento dos últimos 5 anos de recolhimentos para calcular o potencial de recuperação de créditos.</p>
            </div>
            <div className="step reveal" data-d="3">
              <div className="step__n">03</div>
              <div className="step__bar" />
              <h3>Elaboração da tese</h3>
              <p>Preparação da documentação jurídica e contábil necessária para sustentar a equiparação perante a Receita Federal.</p>
            </div>
            <div className="step reveal" data-d="4">
              <div className="step__n">04</div>
              <div className="step__bar" />
              <h3>Implementação e acompanhamento</h3>
              <p>Aplicação do benefício no próximo trimestre e acompanhamento contínuo para garantir a manutenção da economia.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUEM SE BENEFICIA ── */}
      <section className="benef section-pad" id="beneficiarios">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker on-navy">Elegibilidade</span>
            <h2>Quem se beneficia</h2>
            <p className="lede">
              Se sua empresa presta serviços de saúde no Lucro Presumido, há grande chance de você ser elegível.
            </p>
          </div>
          <div className="benef-grid">
            {/* Clínicas médicas */}
            <div className="benef-item reveal" data-d="1">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3v6a4 4 0 008 0V3"/><path d="M6 3h0M14 3h0"/>
                  <path d="M10 17v2a3 3 0 006 0 3 3 0 013-3"/>
                  <circle cx="19" cy="11" r="2"/>
                </svg>
              </span>
              <span>Clínicas médicas</span>
            </div>
            {/* Laboratórios */}
            <div className="benef-item reveal" data-d="2">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 3h6"/><path d="M10 3v5l-5 9a3 3 0 003 4h8a3 3 0 003-4l-5-9V3"/>
                  <path d="M7 15h10"/>
                </svg>
              </span>
              <span>Laboratórios</span>
            </div>
            {/* Diagnóstico por imagem */}
            <div className="benef-item reveal" data-d="3">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2"/>
                  <circle cx="12" cy="12" r="3.5"/>
                  <path d="M7 5V3h10v2"/>
                </svg>
              </span>
              <span>Diagnóstico por imagem</span>
            </div>
            {/* Fisioterapia */}
            <div className="benef-item reveal" data-d="4">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h4l2 5 4-12 2 7h6"/>
                </svg>
              </span>
              <span>Fisioterapia</span>
            </div>
            {/* Cirurgia */}
            <div className="benef-item reveal" data-d="1">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 4l6 6"/>
                  <path d="M4 20l8.5-8.5 1.5 1.5L5.5 21.5z"/>
                  <path d="M14.5 6.5l3 3"/>
                  <path d="M17 3l4 4"/>
                </svg>
              </span>
              <span>Cirurgia ambulatorial</span>
            </div>
            {/* Hemodiálise */}
            <div className="benef-item reveal" data-d="2">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3c4 5 6 8 6 11a6 6 0 01-12 0c0-3 2-6 6-11z"/>
                </svg>
              </span>
              <span>Hemodiálise</span>
            </div>
            {/* Pronto atendimento */}
            <div className="benef-item reveal" data-d="3">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 0118 0"/>
                  <path d="M3 12l3 3 3-6 3 9 3-12 3 9 3-3"/>
                </svg>
              </span>
              <span>Pronto atendimento</span>
            </div>
            {/* Day clinics */}
            <div className="benef-item reveal" data-d="4">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 21V8l8-5 8 5v13"/><path d="M4 21h16"/>
                  <path d="M12 10v6M9 13h6"/>
                </svg>
              </span>
              <span>Day clinics</span>
            </div>
          </div>
          <p className="benef__note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><circle cx="12" cy="16" r=".5" fill="currentColor"/>
            </svg>
            Válido para empresas no regime de Lucro Presumido com CNAEs de serviços de saúde. Consulte nossos especialistas para confirmar sua elegibilidade.
          </p>
          <a
            href="https://wa.me/5518996205555?text=Quero%20verificar%20se%20minha%20empresa%20é%20elegível"
            target="_blank"
            rel="noopener"
            className="benef__cta reveal"
          >
            Verificar minha elegibilidade agora
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>
      </section>

      {/* ── OUTRAS ÁREAS ── */}
      <section className="areas section-pad" id="areas">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">Bohac Advogados</span>
            <h2>Outras áreas de atuação</h2>
            <p className="lede">
              Além da equiparação hospitalar, o escritório Bohac Advogados oferece assessoria jurídica completa para empresas e profissionais de saúde.
            </p>
          </div>
          <div className="areas-grid">
            <div className="area-item reveal" data-d="1">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z"/>
                </svg>
              </span>
              <h4>Direito Médico</h4>
              <p>Defesa de profissionais e instituições de saúde em processos administrativos e judiciais.</p>
            </div>
            <div className="area-item reveal" data-d="2">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18"/><path d="M5 21V8l7-4 7 4v13"/><path d="M9 21v-6h6v6"/>
                </svg>
              </span>
              <h4>Direito Empresarial</h4>
              <p>Constituição, reestruturação societária e planejamento jurídico para empresas do setor de saúde.</p>
            </div>
            <div className="area-item reveal" data-d="3">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4"/><path d="M5 7h14v12a2 2 0 01-2 2H7a2 2 0 01-2-2z"/><path d="M9 3h6v4H9z"/>
                </svg>
              </span>
              <h4>Contratos</h4>
              <p>Elaboração e revisão de contratos de prestação de serviços, convênios e parcerias no setor de saúde.</p>
            </div>
            <div className="area-item reveal" data-d="4">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </span>
              <h4>Compliance</h4>
              <p>Implementação de programas de conformidade regulatória para clínicas e hospitais.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="final section-pad">
        <div className="wrap">
          <div className="final__inner">
            <span className="kicker on-navy center reveal">Comece hoje</span>
            <h2 className="reveal" data-d="1">
              Sua clínica pode estar pagando impostos a mais agora mesmo
            </h2>
            <p className="reveal" data-d="2">
              Faça a verificação gratuita e descubra quanto você pode economizar com a equiparação hospitalar.
            </p>
            <div className="final__actions reveal" data-d="3">
              <a
                href="https://wa.me/5518996205555?text=Quero%20verificar%20minha%20elegibilidade%20para%20equiparação%20hospitalar"
                target="_blank"
                rel="noopener"
                className="btn btn--gold btn-lg"
              >
                Falar com especialista agora
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
              <a href="#topo" className="btn btn--ghost-light btn-lg">
                Verificar meu CNPJ
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer__top">
            <div className="footer__brand">
              <img src="/logo-inverted.png" alt="Bohac Med" />
              <p>
                Especialistas em direito tributário para o setor de saúde. Mais de 10 anos ajudando médicos e clínicas a reduzir sua carga fiscal com segurança jurídica.
              </p>
            </div>
            <div className="footer__col">
              <h4>Serviços</h4>
              <a href="#tese">Equiparação Hospitalar</a>
              <a href="#como-funciona">Como Funciona</a>
              <a href="#beneficiarios">Quem se Beneficia</a>
              <a href="#areas">Outras Áreas</a>
            </div>
            <div className="footer__col">
              <h4>Contato</h4>
              <a
                href="https://wa.me/5518996205555"
                target="_blank"
                rel="noopener"
              >
                (18) 99620-5555
              </a>
              <p>Álvares Machado — SP</p>
              <a href="mailto:contato@bohacadvogados.com.br">
                contato@bohacadvogados.com.br
              </a>
            </div>
          </div>
          <div className="footer__bottom">
            <span className="oab">
              © {new Date().getFullYear()} Bohac Advogados Associados · OAB/SP
            </span>
            <div className="footer__social">
              {/* Instagram */}
              <a
                href="https://instagram.com/bohacadvogados"
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="https://linkedin.com/company/bohacadvogados"
                target="_blank"
                rel="noopener"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── WhatsApp Float ── */}
      <a
        href="https://wa.me/5518996205555?text=Olá,%20gostaria%20de%20informações%20sobre%20equiparação%20hospitalar"
        target="_blank"
        rel="noopener"
        className="wa-float"
        ref={waRef}
        aria-label="Fale no WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </>
  );
}
