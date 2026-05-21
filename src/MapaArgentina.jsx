import { useState, useRef } from "react";

const toX = lng => ((lng + 73.5) / 20.0) * 400;
const toY = lat => ((lat + 21.8) / (-33.7)) * 820;
const pt  = (lat, lng) => `${Math.round(toX(lng))},${Math.round(toY(lat))}`;

// Borde exterior de Argentina
const OUTER = [
  [-21.8,-69.6],[-21.8,-67.0],[-21.8,-65.1],[-21.8,-62.3],
  [-22.5,-60.0],[-24.0,-58.5],[-27.4,-58.2],[-27.5,-57.6],
  [-26.0,-53.6],[-27.0,-53.6],[-28.2,-54.2],
  [-30.5,-57.8],[-33.0,-58.2],[-34.0,-58.4],
  [-35.0,-56.7],[-36.5,-56.8],[-38.0,-57.5],
  [-39.5,-62.0],[-40.8,-62.3],[-41.2,-62.8],[-41.7,-65.0],
  [-43.5,-65.3],[-45.0,-66.5],[-47.0,-65.5],
  [-49.0,-67.5],[-51.5,-69.0],[-52.5,-68.8],
  [-54.0,-68.0],[-55.1,-68.5],[-55.1,-66.0],[-54.5,-65.5],[-53.5,-68.0],
  [-52.5,-73.5],[-50.0,-73.5],[-46.5,-73.5],
  [-44.0,-71.5],[-42.0,-71.5],[-40.5,-71.5],
  [-38.5,-70.9],[-36.0,-70.5],[-34.5,-70.0],
  [-32.0,-70.0],[-30.0,-70.0],[-28.0,-69.5],
  [-26.0,-68.0],[-24.5,-68.5],[-22.0,-67.5],[-21.8,-69.6],
].map(([a,b]) => pt(a,b)).join(" ");

const LINES = [
  [[-21.8,-65.1],[-26.0,-65.0]],
  [[-21.8,-62.3],[-27.4,-58.2]],
  [[-28.0,-69.5],[-28.0,-65.0],[-28.5,-61.0],[-30.5,-57.8]],
  [[-32.0,-70.0],[-32.0,-65.5],[-32.0,-62.0]],
  [[-34.0,-70.0],[-34.0,-65.0],[-34.0,-58.4]],
  [[-39.5,-70.5],[-39.5,-65.0],[-39.5,-62.0]],
  [[-45.0,-73.5],[-45.0,-70.0],[-45.0,-66.5]],
  [[-51.5,-72.0],[-51.5,-69.0]],
  [[-28.0,-65.0],[-34.0,-65.0],[-39.5,-65.0]],
  [[-28.0,-62.0],[-34.0,-62.0],[-39.5,-62.0]],
].map(c => "M"+c.map(([a,b])=>pt(a,b)).join(" L"));

export const mapaCss = `
.hmapa {
  min-height:100vh;
  background:radial-gradient(ellipse at 20% 50%, #180700 0%, #080300 60%, #000 100%);
  display:grid;
  grid-template-columns:1fr 1fr;
  align-items:center;
  padding:5.5rem 4rem 4rem;
  gap:3rem;
  position:relative;
  overflow:hidden;
}
.hmapa::before {
  content:'';position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(ellipse at 68% 45%,rgba(130,50,5,.1) 0%,transparent 55%);
}
.hm-l{z-index:2;}
.hm-r{z-index:2;display:flex;align-items:center;justify-content:center;position:relative;}

/* MAP — sin caja, sin borde, integrado */
.ar-map-outer {
  position:relative;
  width:100%;
  max-width:400px;
}
.ar-map-glow {
  position:absolute;
  inset:-15%;
  background:radial-gradient(ellipse,rgba(180,70,5,.18) 0%,transparent 65%);
  filter:blur(30px);
  pointer-events:none;
}
.ar-svg {
  display:block;
  width:100%;
  overflow:visible;
  filter:drop-shadow(0 0 28px rgba(192,106,34,.25));
}
.ar-bg { fill:#0e0600; }
.ar-fill { fill:#1a0c02; }
.ar-border { fill:none;stroke:#c06a22;stroke-width:.85;stroke-linejoin:round; }
.ar-glow-line { fill:none;stroke:#e8a84c;stroke-width:.3;stroke-linejoin:round;opacity:.45; }
.ar-div { fill:none;stroke:#c06a22;stroke-width:.45;stroke-linecap:round;opacity:.5; }

/* PINS */
@keyframes ro1 { 0%{r:9;opacity:.65;stroke-width:1.2} 100%{r:25;opacity:0;stroke-width:.2} }
@keyframes ro2 { 0%{r:9;opacity:.42;stroke-width:1} 100%{r:18;opacity:0;stroke-width:.2} }
@keyframes pp  { 0%,100%{opacity:1} 50%{opacity:.8} }
.p-r1{animation:ro1 2.5s ease-out infinite;}
.p-r2{animation:ro2 2.5s ease-out infinite .85s;}
.p-core{animation:pp 2.2s ease-in-out infinite;}

/* POPUP — flotante sobre el mapa, centrado */
.ar-popup {
  position:absolute;
  left:50%;
  top:50%;
  transform:translate(-50%,-120%);
  background:rgba(4,1,0,.98);
  border:1px solid rgba(232,168,76,.6);
  border-radius:12px;
  padding:1rem 1.2rem;
  min-width:260px;
  max-width:320px;
  z-index:100;
  box-shadow:0 12px 40px rgba(0,0,0,.85),0 0 20px rgba(192,106,34,.15);
  pointer-events:all;
  animation:pop-in .22s ease;
}
@keyframes pop-in{from{opacity:0;transform:translate(-50%,-110%)}to{opacity:1;transform:translate(-50%,-120%)}}
.pop-cod{color:#e8a84c;font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;font-weight:700;margin-bottom:.1rem;}
.pop-nom{font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:#f5ede0;margin-bottom:.15rem;font-weight:600;}
.pop-loc{color:rgba(245,237,224,.45);font-size:.7rem;margin-bottom:.6rem;}
.pop-btns{display:flex;gap:.4rem;flex-wrap:wrap;}
.pop-close{position:absolute;top:.5rem;right:.6rem;background:none;border:none;color:rgba(245,237,224,.4);cursor:pointer;font-size:.85rem;line-height:1;}
.pop-close:hover{color:#e8a84c;}
.btn-gm{background:#4285f4;color:#fff;border:none;padding:.35rem .8rem;border-radius:4px;font-family:'Jost',sans-serif;font-size:.7rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:.25rem;transition:all .18s;}
.btn-gm:hover{background:#2a72e8;transform:translateY(-1px);}
.btn-dr{background:linear-gradient(135deg,#a84010,#e8a84c);color:#fff;border:none;padding:.35rem .8rem;border-radius:4px;font-family:'Jost',sans-serif;font-size:.7rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:.25rem;transition:all .18s;box-shadow:0 2px 10px rgba(192,106,34,.4);}
.btn-dr:hover{transform:translateY(-1px);}
.btn-fi{background:transparent;color:#e8a84c;border:1px solid rgba(232,168,76,.35);padding:.35rem .8rem;border-radius:4px;font-family:'Jost',sans-serif;font-size:.7rem;font-weight:600;cursor:pointer;transition:all .18s;}
.btn-fi:hover{background:rgba(232,168,76,.1);}

/* HINT */
.ar-hint{position:absolute;bottom:.4rem;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.55);color:rgba(245,237,224,.4);padding:.18rem .6rem;border-radius:2rem;font-size:.6rem;font-family:'Jost',sans-serif;pointer-events:none;white-space:nowrap;}

/* TOOLTIP */
.ar-tip{position:absolute;background:rgba(4,1,0,.96);border:1px solid rgba(192,106,34,.5);border-radius:8px;padding:.45rem .78rem;color:#f5ede0;font-family:'Jost',sans-serif;font-size:.72rem;pointer-events:none;white-space:nowrap;box-shadow:0 4px 18px rgba(0,0,0,.7);z-index:50;transform:translate(-50%,-115%);}
.ar-tip::after{content:'';position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:rgba(192,106,34,.5);border-bottom:none;}
.tip-c{color:#e8a84c;font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;font-weight:700;}
.tip-n{font-weight:600;margin:.06rem 0;}
.tip-p{color:#c06a22;font-weight:700;}

/* LEFT */
.hm-tag{display:inline-flex;align-items:center;gap:.45rem;background:rgba(192,106,34,.1);border:1px solid rgba(192,106,34,.3);color:#e8a84c;padding:.28rem .8rem;border-radius:2rem;font-size:.68rem;letter-spacing:.15em;text-transform:uppercase;margin-bottom:1.4rem;width:fit-content;}
.hm-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(2.4rem,3.8vw,3.8rem);color:#f5ede0;line-height:1.1;margin-bottom:1rem;}
.hm-h1 em{color:#e8a84c;font-style:italic;}
.hm-d{color:rgba(245,237,224,.62);font-size:.9rem;line-height:1.85;margin-bottom:1.6rem;max-width:410px;}
.hm-ctas{display:flex;gap:.7rem;flex-wrap:wrap;margin-bottom:2rem;}
.hm-stats{display:flex;gap:2rem;margin-bottom:1.8rem;}
.hs-n{font-family:'Cormorant Garamond',serif;font-size:1.8rem;color:#e8a84c;font-weight:700;line-height:1;}
.hs-l{color:rgba(245,237,224,.4);font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;margin-top:.12rem;}
.hm-trust{display:flex;flex-direction:column;gap:.4rem;}
.ht-i{display:flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.035);border:1px solid rgba(192,106,34,.18);border-radius:6px;padding:.42rem .78rem;color:rgba(245,237,224,.7);font-size:.76rem;}
.ht-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}

/* DRONE */
.dov{position:fixed;inset:0;z-index:999;background:rgba(0,0,0,.95);display:flex;align-items:center;justify-content:center;padding:2rem;}
.dbox{position:relative;max-width:940px;width:100%;}
.dbox video{width:100%;border-radius:9px;max-height:82vh;}
.dx{position:absolute;top:-2.5rem;right:0;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;font-size:.83rem;padding:.32rem .8rem;border-radius:4px;cursor:pointer;font-family:'Jost',sans-serif;}

@media(max-width:850px){
  .hmapa{grid-template-columns:1fr;padding:5rem 1.4rem 5rem;min-height:auto;gap:2rem;}
  .hm-trust{display:none;}
  .ar-popup{min-width:230px;max-width:90vw;}
}
@media(max-width:420px){.hm-h1{font-size:2rem;}.hm-stats{gap:1.2rem;}}
`;

function hasVid(m){return m?.some(x=>x.tipo==="video");}
function getVid(m){return m?.find(x=>x.tipo==="video");}

export function MapaArgentina({terrenos=[],onVerFicha,lang,onGoCondominios}){
  const es=lang==="es";
  const [hov,setHov]=useState(null);
  const [sel,setSel]=useState(null);
  const [tipPos,setTipPos]=useState({x:0,y:0});
  const [zoom,setZoom]=useState({s:1,tx:0,ty:0});
  const [droneUrl,setDroneUrl]=useState(null);
  const svgRef=useRef();

  const wc=terrenos.filter(t=>t.coordenadas?.includes(","));
  function parsell(s){const p=s.split(",").map(v=>parseFloat(v.trim()));return{lat:p[0],lng:p[1]};}

  function onPinEnter(t,e){
    setHov(t);
    const r=svgRef.current?.getBoundingClientRect();
    if(r) setTipPos({x:e.clientX-r.left,y:e.clientY-r.top});
  }

  function onPinClick(t){
    if(sel?.id===t.id){setSel(null);setZoom({s:1,tx:0,ty:0});return;}
    setSel(t);
    const{lat,lng}=parsell(t.coordenadas);
    const px=toX(lng), py=toY(lat);
    const s=2.8;
    // Center pin at (200, 380) in SVG coords
    setZoom({s, tx:200-px*s, ty:380-py*s});
  }

  function resetView(){setSel(null);setZoom({s:1,tx:0,ty:0});}

  return(<>
    <section className="hmapa">
      <div className="hm-l">
        <div className="hm-tag">📍 {es?"Argentina · Condominio de Tierras · Todo escriturado":"Argentina · Land Condominiums · Fully titled"}</div>
        <h1 className="hm-h1">{es?<>Invertí en tierra.<br/><em>Con escritura real.</em></>:<>Invest in land.<br/><em>With real title.</em></>}</h1>
        <p className="hm-d">{es?"Vendemos fracciones de hectáreas en condominio, respaldadas por boleta de cesión firmada por el dueño original. Título vigente, impuestos al día.":"We sell hectare fractions as condominiums, backed by a legal assignment signed by the original titleholder. Valid deed, taxes paid."}</p>
        <div className="hm-ctas">
          <button className="bp" onClick={onGoCondominios}>{es?"Ver condominios":"Browse"}</button>
          <button className="bg">{es?"Consultar ahora":"Inquire"}</button>
        </div>
        <div className="hm-stats">
          <div><div className="hs-n">{terrenos.filter(t=>t.disponibilidad==="Disponible").length}</div><div className="hs-l">{es?"Disponibles":"Available"}</div></div>
          <div><div className="hs-n">{wc.length}</div><div className="hs-l">{es?"En mapa":"On map"}</div></div>
          <div><div className="hs-n">15+</div><div className="hs-l">{es?"Años":"Years"}</div></div>
        </div>
        <div className="hm-trust">
          {[["#888","📜",es?"Escritura pública vigente":"Valid deed"],["#2d6a3f","✅",es?"Impuestos al día":"Taxes paid"],["#e8a84c","🤝",es?"Cesión firmada":"Owner-signed"],["#4285f4","🌍","Argentina & el mundo"]].map(([col,ic,lb],i)=>(
            <div className="ht-i" key={i}><div className="ht-dot" style={{background:col}}/>{ic} {lb}</div>
          ))}
        </div>
      </div>

      <div className="hm-r">
        <div className="ar-map-outer">
          <div className="ar-map-glow"/>
          <svg ref={svgRef} viewBox="0 0 400 760" className="ar-svg">
            <defs>
              <radialGradient id="rbg2" cx="42%" cy="35%" r="58%">
                <stop offset="0%" stopColor="#200e02"/>
                <stop offset="100%" stopColor="#060200"/>
              </radialGradient>
              <radialGradient id="rpin2" cx="36%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#ffe07a"/>
                <stop offset="50%" stopColor="#e8a84c"/>
                <stop offset="100%" stopColor="#9a4208"/>
              </radialGradient>
              <filter id="pgf2" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="4" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            <g style={{
              transform:`translate(${zoom.tx}px,${zoom.ty}px) scale(${zoom.s})`,
              transformOrigin:"0 0",
              transition:"transform 0.55s cubic-bezier(.4,0,.2,1)"
            }}>
              {/* Fondo */}
              <polygon points={OUTER} fill="url(#rbg2)"/>
              {/* Relleno interior */}
              <polygon points={OUTER} className="ar-fill"/>
              {/* Líneas de provincias */}
              {LINES.map((d,i)=><path key={i} d={d} className="ar-div"/>)}
              {/* Borde glow */}
              <polygon points={OUTER} className="ar-glow-line"/>
              {/* Borde principal */}
              <polygon points={OUTER} className="ar-border"/>

              {/* Pins */}
              {wc.map(t=>{
                const{lat,lng}=parsell(t.coordenadas);
                const px=Math.round(toX(lng)), py=Math.round(toY(lat));
                const is=sel?.id===t.id, ih=hov?.id===t.id;
                return(
                  <g key={t.id} filter="url(#pgf2)" style={{cursor:"pointer"}}
                    onMouseEnter={e=>{e.stopPropagation();onPinEnter(t,e);}}
                    onMouseLeave={e=>{e.stopPropagation();setHov(null);}}
                    onClick={e=>{e.stopPropagation();onPinClick(t);}}>
                    <circle cx={px} cy={py} r="9" fill="none" stroke="#e8a84c" strokeWidth="1.2" className="p-r1"/>
                    <circle cx={px} cy={py} r="9" fill="none" stroke="#c06a22" strokeWidth=".8" className="p-r2"/>
                    {(is||ih)&&<circle cx={px} cy={py} r="13" fill="rgba(232,168,76,.1)" stroke="rgba(232,168,76,.25)" strokeWidth=".7"/>}
                    <circle cx={px} cy={py} r={is?7.5:ih?6.5:5.5}
                      fill="url(#rpin2)" stroke={is?"#fff5cc":"#f5ede0"}
                      strokeWidth={is?1.8:1.3}
                      className={is||ih?"":"p-core"}
                      style={{transition:"r .2s"}}/>
                    <circle cx={px-1} cy={py-1.5} r={is?2.5:2} fill="rgba(255,246,170,.88)"/>
                    {(is||ih)&&<text x={px+11} y={py-7} fontSize="5.5" fill="#f5ede0"
                      fontFamily="Jost,sans-serif" fontWeight="600"
                      style={{filter:"drop-shadow(0 1px 4px rgba(0,0,0,.95))"}}>
                      {(t.nombre||"").split("—")[0].trim().substring(0,20)}
                    </text>}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Tooltip */}
          {hov&&!sel&&(
            <div className="ar-tip" style={{left:tipPos.x,top:tipPos.y}}>
              <div className="tip-c">{hov.codigo}</div>
              <div className="tip-n">{hov.nombre}</div>
              <div className="tip-p">{hov.precio}</div>
            </div>
          )}

          {/* Popup card — centrado sobre el mapa */}
          {sel&&(
            <div className="ar-popup">
              <button className="pop-close" onClick={resetView}>✕</button>
              <div className="pop-cod">{sel.codigo}</div>
              <div className="pop-nom">{sel.nombre}</div>
              <div className="pop-loc">📍 {sel.ubicacion}</div>
              <div className="pop-btns">
                {sel.coordenadas&&(()=>{const{lat,lng}=parsell(sel.coordenadas);return(
                  <button className="btn-gm" onClick={()=>window.open(`https://www.google.com/maps?q=${lat},${lng}`,"_blank")}>🗺️ Google Maps</button>
                );})()}
                {hasVid(sel.media)&&<button className="btn-dr" onClick={()=>setDroneUrl(getVid(sel.media).url)}>🚁 {es?"Dron":"Drone"}</button>}
                <button className="btn-fi" onClick={()=>onVerFicha&&onVerFicha(sel)}>{es?"Ver ficha →":"Details →"}</button>
              </div>
            </div>
          )}

          {!sel&&wc.length>0&&<div className="ar-hint">📍 {es?"Tocá un pin para ver el terreno":"Click a pin to view"}</div>}
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
