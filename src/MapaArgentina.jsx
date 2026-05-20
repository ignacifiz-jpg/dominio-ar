import { useState, useRef, useEffect } from "react";

// ── GPS → SVG coords (viewBox 0 0 400 820) ───────────────────────────────────
// Argentina: lng -73.5→-53.5 (20°), lat -21.8→-55.5 (33.7°)
function toX(lng) { return ((lng + 73.5) / 20) * 400; }
function toY(lat) { return ((lat + 21.8) / (-33.7)) * 820; }

// ── Silhoueta de Argentina (trazada a mano con coords geográficas reales) ─────
// Borde exterior continental — sentido horario desde NW
const OUTER = [
  // Norte — frontera con Bolivia
  [toX(-69.6), toY(-22.0)], // NW tripoint Jujuy/Bolivia/Chile
  [toX(-66.3), toY(-22.0)],
  [toX(-63.7), toY(-22.0)],
  [toX(-62.3), toY(-22.0)],
  // NE — frontera con Paraguay
  [toX(-60.0), toY(-23.5)],
  [toX(-58.2), toY(-25.0)],
  [toX(-57.6), toY(-27.5)],
  // Misiones (punta NE)
  [toX(-53.6), toY(-26.0)],
  [toX(-53.6), toY(-28.2)],
  // Borde con Uruguay/Brasil
  [toX(-55.7), toY(-28.5)],
  [toX(-58.2), toY(-30.5)],
  [toX(-58.0), toY(-34.0)],
  // Costa Atlántica — Buenos Aires
  [toX(-57.0), toY(-34.5)],
  [toX(-56.5), toY(-37.0)],
  [toX(-57.5), toY(-38.5)],
  [toX(-60.0), toY(-39.5)],
  [toX(-62.0), toY(-41.0)],
  // Patagonia costa E
  [toX(-63.5), toY(-42.0)],
  [toX(-65.0), toY(-43.0)],
  [toX(-65.5), toY(-45.5)],
  [toX(-66.0), toY(-47.5)],
  [toX(-65.5), toY(-51.5)],
  // Santa Cruz / Estrecho de Magallanes
  [toX(-68.5), toY(-52.5)],
  [toX(-69.0), toY(-52.5)],
  // Tierra del Fuego (simplificada, adjunta)
  [toX(-69.0), toY(-55.0)],
  [toX(-66.5), toY(-55.1)],
  [toX(-65.0), toY(-54.5)],
  [toX(-68.0), toY(-52.5)],
  // Volver W por Magallanes
  [toX(-72.5), toY(-52.0)],
  // Frontera con Chile — de S a N
  [toX(-73.5), toY(-46.5)],
  [toX(-71.5), toY(-42.0)],
  [toX(-71.5), toY(-40.5)],
  [toX(-70.5), toY(-37.5)],
  [toX(-70.0), toY(-35.5)],
  [toX(-69.5), toY(-33.0)],
  [toX(-69.5), toY(-28.5)],
  [toX(-69.0), toY(-24.0)],
  [toX(-68.0), toY(-22.5)],
].map(([x,y]) => `${Math.round(x)},${Math.round(y)}`).join(" ");

// Líneas divisorias internas de provincias (aproximadas)
const PROV_LINES = [
  // Paralelos interiores
  [[toX(-69.6),toY(-26.0)],[toX(-62.3),toY(-26.0)]],   // Tucumán/SdE N
  [[toX(-69.5),toY(-30.0)],[toX(-58.0),toY(-30.0)]],   // Córdoba N
  [[toX(-70.0),toY(-35.5)],[toX(-57.0),toY(-34.5)]],   // BA N / Pampa
  [[toX(-70.0),toY(-39.5)],[toX(-62.0),toY(-41.0)]],   // Neuquén/RN
  [[toX(-73.5),toY(-46.5)],[toX(-65.5),toY(-45.5)]],   // Chubut N
  [[toX(-72.5),toY(-52.0)],[toX(-65.5),toY(-51.5)]],   // SC/TdF
  // Meridianos interiores
  [[toX(-63.7),toY(-22.0)],[toX(-63.5),toY(-26.0)]],   // Jujuy/Salta E
  [[toX(-62.3),toY(-22.0)],[toX(-62.3),toY(-25.0)]],   // Formosa/Chaco N
  [[toX(-65.0),toY(-26.0)],[toX(-65.5),toY(-30.0)]],   // Tucumán/SdE
  [[toX(-62.0),toY(-30.0)],[toX(-62.0),toY(-35.0)]],   // Santa Fe/Córdoba
  [[toX(-65.5),toY(-30.0)],[toX(-65.5),toY(-35.5)]],   // SL/Córdoba
  [[toX(-68.5),toY(-30.0)],[toX(-68.5),toY(-33.0)]],   // Mendoza/SJ
  [[toX(-65.0),toY(-39.5)],[toX(-65.5),toY(-45.5)]],   // LP/BA
  [[toX(-69.5),toY(-39.5)],[toX(-71.5),toY(-42.0)]],   // Neuquén/RN W
  // Misiones/Corrientes
  [[toX(-57.6),toY(-27.5)],[toX(-55.7),toY(-28.5)]],
  [[toX(-55.7),toY(-28.5)],[toX(-58.2),toY(-30.5)]],
].map(([[x1,y1],[x2,y2]]) => `M${Math.round(x1)},${Math.round(y1)} L${Math.round(x2)},${Math.round(y2)}`);

export const mapaCss = `
.hmapa {
  min-height:100vh;
  background:radial-gradient(ellipse at 22% 55%,#1e0a01 0%,#0a0400 55%,#000 100%);
  display:grid;
  grid-template-columns:1fr 1fr;
  align-items:center;
  padding:5.5rem 3.5rem 3.5rem;
  gap:2.5rem;
  position:relative;
  overflow:hidden;
}
.hmapa::before{
  content:'';position:absolute;inset:0;pointer-events:none;
  background:
    radial-gradient(ellipse at 68% 45%,rgba(160,70,10,.1) 0%,transparent 55%),
    radial-gradient(ellipse at 15% 65%,rgba(80,25,0,.14) 0%,transparent 45%);
}
.hm-l{z-index:2;}
.hm-r{z-index:2;display:flex;align-items:center;justify-content:center;}
.persp{perspective:1100px;width:100%;max-width:420px;margin:0 auto;}
.tilt{
  transform:rotateX(22deg) rotateY(-8deg);
  transform-style:preserve-3d;
  transition:transform .5s ease;
  position:relative;
}
.tilt:hover{transform:rotateX(14deg) rotateY(-4deg);}
.tilt-shad{
  position:absolute;inset:-15% -5%;
  background:radial-gradient(ellipse,rgba(180,80,10,.38) 0%,transparent 65%);
  filter:blur(30px);
  transform:translateY(18%) translateZ(-60px);
  pointer-events:none;
}
.mwrap{
  position:relative;
  filter:drop-shadow(0 0 40px rgba(192,106,34,.3)) drop-shadow(0 18px 55px rgba(0,0,0,.85));
  cursor:default;
}
.ar-bg{fill:#100700;}
.ar-prov{fill:#1c0e02;stroke:#c06a22;stroke-width:.7;stroke-linejoin:round;transition:fill .2s;}
.ar-line{fill:none;stroke:#c06a22;stroke-width:.5;stroke-linecap:round;opacity:.6;}
.ar-glow{fill:none;stroke:#e8a84c;stroke-width:.25;opacity:.4;stroke-linejoin:round;}
/* Pins */
@keyframes pr{0%,100%{r:5;opacity:1}50%{r:6.2;opacity:.85}}
@keyframes r1{0%{r:8;opacity:.7;stroke-width:1.2}100%{r:22;opacity:0;stroke-width:.2}}
@keyframes r2{0%{r:8;opacity:.5;stroke-width:1}100%{r:17;opacity:0;stroke-width:.2}}
.pa{animation:pr 2.3s ease-in-out infinite;}
.ra{animation:r1 2.3s ease-out infinite;}
.rb{animation:r2 2.3s ease-out infinite .75s;}
/* Tooltip */
.mtip{
  position:absolute;background:rgba(6,2,0,.97);border:1px solid rgba(192,106,34,.5);
  border-radius:8px;padding:.5rem .8rem;color:#f5ede0;font-family:'Jost',sans-serif;
  font-size:.73rem;pointer-events:none;white-space:nowrap;
  box-shadow:0 4px 20px rgba(0,0,0,.7),0 0 12px rgba(192,106,34,.15);
  z-index:30;transform:translate(-50%,-115%);
}
.mtip::after{content:'';position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:rgba(192,106,34,.5);border-bottom:none;}
.mtip-c{color:#e8a84c;font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;font-weight:700;}
.mtip-n{font-weight:600;margin:.08rem 0;}
.mtip-p{color:#c06a22;font-weight:700;}
/* Pin card */
.pcard{
  position:absolute;bottom:-5.5rem;left:50%;transform:translateX(-50%);
  background:rgba(5,2,0,.97);border:1px solid rgba(232,168,76,.5);
  border-radius:11px;padding:.9rem 1.1rem;min-width:270px;max-width:340px;
  z-index:40;box-shadow:0 10px 35px rgba(0,0,0,.8),0 0 20px rgba(192,106,34,.1);
  animation:ci .2s ease;
}
@keyframes ci{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
.pc-c{color:#e8a84c;font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;font-weight:700;margin-bottom:.12rem;}
.pc-n{font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:#f5ede0;margin-bottom:.18rem;font-weight:600;}
.pc-l{color:rgba(245,237,224,.48);font-size:.72rem;margin-bottom:.6rem;}
.pc-a{display:flex;gap:.4rem;flex-wrap:wrap;}
.bgm{background:#4285f4;color:#fff;border:none;padding:.35rem .8rem;border-radius:4px;font-family:'Jost',sans-serif;font-size:.71rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:.28rem;transition:all .18s;}
.bgm:hover{background:#2a72e8;transform:translateY(-1px);}
.bdr{background:linear-gradient(135deg,#b05010,#e8a84c);color:#fff;border:none;padding:.35rem .8rem;border-radius:4px;font-family:'Jost',sans-serif;font-size:.71rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:.28rem;transition:all .18s;box-shadow:0 2px 10px rgba(192,106,34,.4);}
.bdr:hover{transform:translateY(-1px);}
.bfp{background:transparent;color:#e8a84c;border:1px solid rgba(232,168,76,.35);padding:.35rem .8rem;border-radius:4px;font-family:'Jost',sans-serif;font-size:.71rem;font-weight:600;cursor:pointer;transition:all .18s;}
.bfp:hover{background:rgba(232,168,76,.1);}
.zrst{position:absolute;top:.7rem;right:.7rem;background:rgba(4,1,0,.85);border:1px solid rgba(192,106,34,.38);color:#e8a84c;padding:.28rem .65rem;border-radius:4px;font-size:.68rem;font-family:'Jost',sans-serif;cursor:pointer;z-index:20;}
/* Left */
.hm-tag{display:inline-flex;align-items:center;gap:.45rem;background:rgba(192,106,34,.1);border:1px solid rgba(192,106,34,.3);color:#e8a84c;padding:.28rem .8rem;border-radius:2rem;font-size:.68rem;letter-spacing:.15em;text-transform:uppercase;margin-bottom:1.4rem;width:fit-content;}
.hm-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(2.4rem,3.8vw,3.8rem);color:#f5ede0;line-height:1.1;margin-bottom:1rem;}
.hm-h1 em{color:#e8a84c;font-style:italic;}
.hm-d{color:rgba(245,237,224,.62);font-size:.9rem;line-height:1.85;margin-bottom:1.6rem;max-width:400px;}
.hm-c{display:flex;gap:.7rem;flex-wrap:wrap;margin-bottom:2rem;}
.hm-s{display:flex;gap:2rem;margin-bottom:1.8rem;}
.hs-n{font-family:'Cormorant Garamond',serif;font-size:1.8rem;color:#e8a84c;font-weight:700;line-height:1;}
.hs-l{color:rgba(245,237,224,.4);font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;margin-top:.12rem;}
.hm-t{display:flex;flex-direction:column;gap:.4rem;}
.ht-i{display:flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.035);border:1px solid rgba(192,106,34,.18);border-radius:6px;padding:.42rem .75rem;color:rgba(245,237,224,.7);font-size:.76rem;}
.ht-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.dov{position:fixed;inset:0;z-index:999;background:rgba(0,0,0,.95);display:flex;align-items:center;justify-content:center;padding:2rem;}
.dbox{position:relative;max-width:940px;width:100%;}
.dbox video{width:100%;border-radius:9px;max-height:82vh;}
.dx{position:absolute;top:-2.5rem;right:0;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;font-size:.83rem;padding:.32rem .8rem;border-radius:4px;cursor:pointer;font-family:'Jost',sans-serif;}
.dx:hover{background:rgba(192,106,34,.4);}
@media(max-width:850px){
  .hmapa{grid-template-columns:1fr;padding:5rem 1.4rem 9rem;min-height:auto;gap:2rem;}
  .hm-r{min-height:300px;}
  .persp{max-width:260px;}
  .hm-t{display:none;}
  .pcard{bottom:-4.5rem;min-width:220px;}
  .tilt{transform:rotateX(12deg) rotateY(-4deg);}
  .tilt:hover{transform:rotateX(8deg) rotateY(-2deg);}
}
`;

function hasVid(m){ return m?.some(x=>x.tipo==="video"); }
function getVid(m){ return m?.find(x=>x.tipo==="video"); }

export function MapaArgentina({ terrenos=[], onVerFicha, lang, onGoCondominios }){
  const es = lang==="es";
  const [hov,setHov]=useState(null);
  const [sel,setSel]=useState(null);
  const [tipPos,setTipPos]=useState({x:0,y:0});
  const [zoom,setZoom]=useState(1);
  const [pan,setPan]=useState({x:0,y:0});
  const [drag,setDrag]=useState(false);
  const [ds,setDs]=useState(null);
  const [droneUrl,setDroneUrl]=useState(null);
  const wrapRef=useRef();

  const wc = terrenos.filter(t=>t.coordenadas?.includes(","));

  function parsell(s){ const p=s.split(",").map(v=>parseFloat(v.trim())); return{lat:p[0],lng:p[1]}; }

  function onPinEnter(t,e){
    setHov(t);
    const r=wrapRef.current?.getBoundingClientRect();
    if(r) setTipPos({x:e.clientX-r.left,y:e.clientY-r.top});
  }
  function onPinMove(e){
    if(!hov)return;
    const r=wrapRef.current?.getBoundingClientRect();
    if(r) setTipPos({x:e.clientX-r.left,y:e.clientY-r.top});
  }
  function onPinClick(t,e){
    e.stopPropagation();
    if(sel?.id===t.id){setSel(null);resetView();return;}
    setSel(t);
    const {lat,lng}=parsell(t.coordenadas);
    const px=toX(lng), py=toY(lat);
    const z=3.2;
    setZoom(z);
    const cw=wrapRef.current?.clientWidth||400;
    const ch=wrapRef.current?.clientHeight||820;
    setPan({x:cw/2-px*(cw/400)*z,y:ch/2-py*(ch/820)*z-20});
  }
  function resetView(e){ e?.stopPropagation(); setZoom(1);setPan({x:0,y:0});setSel(null); }
  function onMD(e){ setDrag(true);setDs({x:e.clientX-pan.x,y:e.clientY-pan.y}); }
  function onMM(e){ onPinMove(e); if(drag&&ds) setPan({x:e.clientX-ds.x,y:e.clientY-ds.y}); }
  function onMU(){ setDrag(false); }
  useEffect(()=>{
    const el=wrapRef.current; if(!el)return;
    const h=e=>{e.preventDefault();setZoom(z=>Math.max(1,Math.min(6,z+(e.deltaY<0?.4:-.4))));};
    el.addEventListener("wheel",h,{passive:false});
    return()=>el.removeEventListener("wheel",h);
  },[]);

  // Scale pins from SVG space to actual render size
  const svgW=400, svgH=820;

  return(<>
    <section className="hmapa">
      <div className="hm-l">
        <div className="hm-tag">📍 {es?"Argentina · Condominio de Tierras · Todo escriturado":"Argentina · Land Condominiums · Fully titled"}</div>
        <h1 className="hm-h1">{es?<>Invertí en tierra.<br/><em>Con escritura real.</em></>:<>Invest in land.<br/><em>With real title.</em></>}</h1>
        <p className="hm-d">{es?"Vendemos fracciones de hectáreas en condominio, respaldadas por boleta de cesión firmada por el dueño original. Título vigente, impuestos al día, sin riesgos.":"We sell hectare fractions as condominiums, backed by a legal assignment signed by the original titleholder. Valid deed, taxes paid."}</p>
        <div className="hm-c">
          <button className="bp" onClick={onGoCondominios}>{es?"Ver condominios":"Browse properties"}</button>
          <button className="bg">{es?"Consultar ahora":"Inquire now"}</button>
        </div>
        <div className="hm-s">
          <div><div className="hs-n">{terrenos.filter(t=>t.disponibilidad==="Disponible").length}</div><div className="hs-l">{es?"Disponibles":"Available"}</div></div>
          <div><div className="hs-n">{wc.length}</div><div className="hs-l">{es?"En el mapa":"On map"}</div></div>
          <div><div className="hs-n">15+</div><div className="hs-l">{es?"Años":"Years"}</div></div>
        </div>
        <div className="hm-t">
          {[["#888","📜",es?"Escritura pública vigente":"Valid public deed"],["#2d6a3f","✅",es?"Impuestos al día":"Taxes paid"],["#e8a84c","🤝",es?"Cesión firmada":"Owner-signed"],["#4285f4","🌍",es?"Argentina y el mundo":"Worldwide"]].map(([col,ic,lb],i)=>(
            <div className="ht-i" key={i}><div className="ht-dot" style={{background:col}}/>{ic} {lb}</div>
          ))}
        </div>
      </div>

      <div className="hm-r">
        <div className="persp">
          <div className="tilt">
            <div className="tilt-shad"/>
            <div className="mwrap" ref={wrapRef}
              onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={()=>{onMU();setHov(null);}}
              onClick={zoom>1?resetView:undefined}
              style={{cursor:drag?"grabbing":zoom>1?"zoom-out":"default"}}>

              <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%"
                style={{
                  display:"block",
                  transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
                  transformOrigin:"center",
                  transition:drag?"none":"transform 0.42s cubic-bezier(.25,.46,.45,.94)"
                }}>
                <defs>
                  <filter id="pglow" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation="4" result="b"/>
                    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <radialGradient id="rpin" cx="38%" cy="32%" r="62%">
                    <stop offset="0%" stopColor="#ffe080"/>
                    <stop offset="50%" stopColor="#e8a84c"/>
                    <stop offset="100%" stopColor="#a04810"/>
                  </radialGradient>
                  <radialGradient id="rbg" cx="40%" cy="35%" r="60%">
                    <stop offset="0%" stopColor="#1e0d02"/>
                    <stop offset="100%" stopColor="#060200"/>
                  </radialGradient>
                  {/* Subtle grid */}
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M40,0 L0,0 0,40" fill="none" stroke="rgba(192,106,34,0.04)" strokeWidth="0.5"/>
                  </pattern>
                </defs>

                {/* Background */}
                <rect width={svgW} height={svgH} fill="url(#rbg)"/>
                <rect width={svgW} height={svgH} fill="url(#grid)"/>

                {/* Argentina - capa glow exterior */}
                <polygon points={OUTER} className="ar-glow"/>
                {/* Argentina - relleno principal */}
                <polygon points={OUTER} className="ar-prov"/>
                {/* Líneas de provincias */}
                {PROV_LINES.map((d,i)=><path key={i} d={d} className="ar-line"/>)}

                {/* Pins */}
                {wc.map(t=>{
                  const {lat,lng}=parsell(t.coordenadas);
                  const px=Math.round(toX(lng)), py=Math.round(toY(lat));
                  const is=sel?.id===t.id, ih=hov?.id===t.id;
                  return(
                    <g key={t.id} filter="url(#pglow)"
                      onMouseEnter={e=>{e.stopPropagation();onPinEnter(t,e);}}
                      onMouseLeave={e=>{e.stopPropagation();setHov(null);}}
                      onClick={e=>onPinClick(t,e)}
                      style={{cursor:"pointer"}}>
                      <circle cx={px} cy={py} r="8" fill="none" stroke="#e8a84c" strokeWidth="1.2" className="ra"/>
                      <circle cx={px} cy={py} r="8" fill="none" stroke="#c06a22" strokeWidth=".8" className="rb"/>
                      {(is||ih)&&<circle cx={px} cy={py} r="13" fill="rgba(232,168,76,.08)" stroke="rgba(232,168,76,.28)" strokeWidth=".7"/>}
                      <circle cx={px} cy={py} r={is?7.5:ih?6.5:5.5} fill="url(#rpin)" stroke={is?"#fff8d0":"#f5ede0"} strokeWidth={is?1.8:1.3} className={is||ih?"":"pa"} style={{transition:"r .2s"}}/>
                      <circle cx={px-1} cy={py-1.5} r={is?2.5:2} fill="rgba(255,248,180,.85)"/>
                      {(is||ih)&&<text x={px+10} y={py-7} fontSize="5.2" fill="#f5ede0" fontFamily="Jost,sans-serif" fontWeight="600" style={{filter:"drop-shadow(0 1px 3px rgba(0,0,0,.95))"}}>{(t.nombre||"").split("—")[0].trim().substring(0,20)}</text>}
                    </g>
                  );
                })}
              </svg>

              {hov&&!sel&&(
                <div className="mtip" style={{left:tipPos.x,top:tipPos.y}}>
                  <div className="mtip-c">{hov.codigo}</div>
                  <div className="mtip-n">{hov.nombre}</div>
                  <div className="mtip-p">{hov.precio}</div>
                </div>
              )}

              {zoom>1.3&&<button className="zrst" onClick={resetView}>↺ {es?"Ver todo":"Reset"}</button>}

              {sel&&(
                <div className="pcard" onClick={e=>e.stopPropagation()}>
                  <div className="pc-c">{sel.codigo}</div>
                  <div className="pc-n">{sel.nombre}</div>
                  <div className="pc-l">📍 {sel.ubicacion}</div>
                  <div className="pc-a">
                    {sel.coordenadas&&(()=>{const{lat,lng}=parsell(sel.coordenadas);return(
                      <button className="bgm" onClick={()=>window.open(`https://www.google.com/maps?q=${lat},${lng}`,"_blank")}>🗺️ Google Maps</button>
                    );})()}
                    {hasVid(sel.media)&&<button className="bdr" onClick={()=>setDroneUrl(getVid(sel.media).url)}>🚁 {es?"Ver dron":"Drone"}</button>}
                    <button className="bfp" onClick={()=>onVerFicha&&onVerFicha(sel)}>{es?"Ver ficha →":"Details →"}</button>
                  </div>
                </div>
              )}

              {!sel&&wc.length>0&&zoom===1&&(
                <div style={{position:"absolute",bottom:".5rem",left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,.6)",color:"rgba(245,237,224,.45)",padding:".2rem .65rem",borderRadius:"2rem",fontSize:".62rem",fontFamily:"Jost,sans-serif",pointerEvents:"none",whiteSpace:"nowrap"}}>
                  {es?"📍 Tocá un pin · Rueda = zoom":"📍 Click a pin · Scroll = zoom"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>

    {droneUrl&&(
      <div className="dov" onClick={()=>setDroneUrl(null)}>
        <div className="dbox" onClick={e=>e.stopPropagation()}>
          <button className="dx" onClick={()=>setDroneUrl(null)}>✕ {es?"Cerrar":"Close"}</button>
          <video src={droneUrl} controls autoPlay style={{width:"100%",borderRadius:"9px",maxHeight:"82vh"}}/>
        </div>
      </div>
    )}
  </>);
}
