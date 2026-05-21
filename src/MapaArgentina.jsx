import { useState, useRef, useEffect } from "react";

// ── Coordenadas reales → SVG (viewBox "0 0 400 820") ─────────────────────────
const toX = lng => ((lng + 73.5) / 20.0) * 400;
const toY = lat => ((lat + 21.8) / (-33.7)) * 820;
const pt  = (lat, lng) => `${Math.round(toX(lng))},${Math.round(toY(lat))}`;

// ── Borde exterior de Argentina (trazado con coordenadas geográficas reales) ──
const CONTINENTAL = [
  // Norte Bolivia
  [-21.8,-69.6],[-21.8,-67.0],[-21.8,-65.1],[-21.8,-62.3],
  // Paraguay
  [-22.5,-60.0],[-24.0,-58.5],[-27.4,-58.2],[-27.5,-57.6],
  // Misiones (punta NE)
  [-26.0,-53.6],[-27.0,-53.6],[-28.2,-54.2],
  // Uruguay / Entre Ríos
  [-30.5,-57.8],[-33.0,-58.2],[-34.0,-58.4],
  // Buenos Aires Atlántica
  [-35.0,-56.7],[-36.5,-56.8],[-38.0,-57.5],
  [-39.5,-62.0],[-40.8,-62.3],[-41.2,-62.8],[-41.7,-65.0],
  // Patagonia costa
  [-43.5,-65.3],[-45.0,-66.5],[-47.0,-65.5],
  [-49.0,-67.5],[-51.5,-69.0],[-52.5,-68.8],
  // Tierra del Fuego (simplificada adjunta)
  [-54.0,-68.0],[-55.1,-68.5],[-55.1,-66.0],[-54.5,-65.5],
  [-53.5,-68.0],
  // Cruce Magallanes y vuelta por Chile
  [-52.5,-73.5],[-50.0,-73.5],[-46.5,-73.5],
  // Chile border norte
  [-44.0,-71.5],[-42.0,-71.5],[-40.5,-71.5],
  [-38.5,-70.9],[-36.0,-70.5],[-34.5,-70.0],
  [-32.0,-70.0],[-30.0,-70.0],[-28.0,-69.5],
  [-26.0,-68.0],[-24.5,-68.5],[-22.0,-67.5],[-21.8,-69.6],
].map(([lat,lng]) => pt(lat,lng)).join(" ");

// ── Líneas internas (provincias simplificadas) ────────────────────────────────
const INTERNAL = [
  // Paralelos
  [[-22.0,-69.6],[-22.0,-62.3]],  // Bolivia border
  [[-26.0,-68.0],[-26.0,-64.0],[-26.5,-63.5],[-27.4,-58.2]],  // NOA/NEA
  [[-28.0,-69.5],[-28.0,-65.0],[-28.5,-63.5],[-28.5,-61.0],[-30.5,-57.8]],
  [[-32.0,-70.0],[-32.0,-65.5],[-32.0,-62.0]],
  [[-34.0,-70.0],[-34.0,-67.0],[-34.0,-64.0],[-34.0,-58.4]],
  [[-39.5,-70.5],[-39.5,-66.0],[-39.5,-62.0]],
  [[-45.0,-73.5],[-45.0,-70.0],[-45.0,-66.5]],
  [[-51.5,-72.0],[-51.5,-69.0]],
  // Meridianos
  [[-21.8,-65.1],[-24.5,-65.0],[-26.0,-65.0]],   // Jujuy E
  [[-21.8,-62.3],[-26.0,-62.5],[-28.0,-62.0]],   // Formosa/Chaco E
  [[-28.0,-65.0],[-32.0,-65.5],[-34.0,-65.0]],   // SJ/Mendoza/LP
  [[-30.5,-63.0],[-34.0,-63.0],[-37.0,-63.0]],   // Córdoba/SFe
  [[-34.0,-63.0],[-39.5,-63.5]],                  // LP/BA
  [[-39.5,-65.0],[-46.0,-66.0]],                  // RN/Chubut
].map(coords => "M" + coords.map(([lat,lng]) => pt(lat,lng)).join(" L"));

// ── Regiones coloreadas (relleno por bloques) ─────────────────────────────────
const REGIONS = [
  // NOA (Jujuy, Salta, Tucumán, Catamarca, La Rioja)
  { color:"#1f0e03", pts:[[-21.8,-69.6],[-21.8,-65.1],[-26.0,-65.0],[-28.0,-69.5],[-21.8,-69.6]] },
  // NEA (Formosa, Chaco, Misiones, Corrientes, SdE)
  { color:"#200f03", pts:[[-21.8,-62.3],[-26.0,-53.6],[-28.2,-54.2],[-34.0,-58.4],[-28.0,-62.0],[-21.8,-62.3]] },
  // Centro (Córdoba, SF, ER, SL, SJ, Mendoza)
  { color:"#1c0d02", pts:[[-28.0,-69.5],[-28.0,-62.0],[-34.0,-58.4],[-35.0,-56.7],[-34.0,-70.0],[-28.0,-69.5]] },
  // Buenos Aires + La Pampa
  { color:"#1e0e02", pts:[[-34.0,-70.0],[-35.0,-56.7],[-41.7,-65.0],[-39.5,-70.5],[-34.0,-70.0]] },
  // Patagonia N
  { color:"#190b01", pts:[[-39.5,-70.5],[-41.7,-65.0],[-46.0,-66.5],[-46.5,-73.5],[-39.5,-70.5]] },
  // Patagonia S
  { color:"#160a01", pts:[[-46.5,-73.5],[-46.0,-66.5],[-52.5,-68.8],[-52.5,-73.5],[-46.5,-73.5]] },
].map(r => ({ color: r.color, pts: r.pts.map(([lat,lng]) => pt(lat,lng)).join(" ") }));

export const mapaCss = `
.hmapa {
  min-height: 100vh;
  background: radial-gradient(ellipse at 20% 50%, #1a0800 0%, #080300 55%, #000 100%);
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  padding: 5.5rem 4rem 4rem;
  gap: 3rem;
  position: relative;
  overflow: hidden;
}
.hmapa::before {
  content:''; position:absolute; inset:0; pointer-events:none;
  background: radial-gradient(ellipse at 65% 48%, rgba(140,55,5,.09) 0%, transparent 55%);
}
.hm-l { z-index:2; }
.hm-r { z-index:2; display:flex; align-items:center; justify-content:center; position:relative; }

/* MAP CONTAINER */
.ar-map-wrap {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}
.ar-map-glow {
  position: absolute;
  inset: -8%;
  background: radial-gradient(ellipse, rgba(192,106,34,.22) 0%, transparent 68%);
  filter: blur(25px);
  pointer-events: none;
  z-index: 0;
}
.ar-map-svg {
  display: block;
  width: 100%;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 0 30px rgba(192,106,34,.22)) drop-shadow(0 8px 40px rgba(0,0,0,.7));
  overflow: visible;
}
/* Province fills */
.ar-reg { transition: filter .2s; }
.ar-border { fill: none; stroke: #c06a22; stroke-width: .8; stroke-linejoin: round; }
.ar-border-glow { fill: none; stroke: #e8a84c; stroke-width: .35; stroke-linejoin: round; opacity: .5; }
.ar-line { fill: none; stroke: #c06a22; stroke-width: .45; stroke-linecap: round; opacity: .55; }

/* PINS */
.pin-g { cursor: pointer; }
@keyframes ring-out { 0%{r:9;opacity:.65;stroke-width:1.2} 100%{r:26;opacity:0;stroke-width:.2} }
@keyframes ring-out2 { 0%{r:9;opacity:.45;stroke-width:1} 100%{r:20;opacity:0;stroke-width:.2} }
@keyframes pin-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.82;transform:scale(1.15)} }
.pin-r1 { animation: ring-out 2.5s ease-out infinite; transform-box: fill-box; transform-origin: center; }
.pin-r2 { animation: ring-out2 2.5s ease-out infinite .8s; transform-box: fill-box; transform-origin: center; }
.pin-core { animation: pin-pulse 2.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }

/* ZOOM — wraps the SVG content */
.ar-map-zoom {
  transition: transform .55s cubic-bezier(.4,0,.2,1);
  transform-origin: center center;
}

/* TOOLTIP */
.ar-tip {
  position: absolute;
  background: rgba(5,2,0,.97);
  border: 1px solid rgba(192,106,34,.52);
  border-radius: 9px;
  padding: .5rem .85rem;
  color: #f5ede0;
  font-family: 'Jost', sans-serif;
  font-size: .74rem;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 4px 22px rgba(0,0,0,.7), 0 0 14px rgba(192,106,34,.15);
  z-index: 30;
  transform: translate(-50%, -118%);
}
.ar-tip::after {
  content:''; position:absolute; bottom:-5px; left:50%; transform:translateX(-50%);
  border:5px solid transparent; border-top-color:rgba(192,106,34,.52); border-bottom:none;
}
.tip-cod { color:#e8a84c; font-size:.62rem; letter-spacing:.14em; text-transform:uppercase; font-weight:700; }
.tip-nom { font-weight:600; margin:.07rem 0; font-size:.79rem; }
.tip-pre { color:#c06a22; font-weight:700; }

/* PIN CARD */
.pin-card {
  position: absolute;
  left: 50%;
  bottom: -6rem;
  transform: translateX(-50%);
  background: rgba(4,1,0,.98);
  border: 1px solid rgba(232,168,76,.55);
  border-radius: 12px;
  padding: .95rem 1.15rem;
  min-width: 275px;
  max-width: 350px;
  z-index: 40;
  box-shadow: 0 12px 42px rgba(0,0,0,.85), 0 0 22px rgba(192,106,34,.12);
  animation: card-in .22s ease;
}
@keyframes card-in { from{opacity:0;transform:translateX(-50%) translateY(10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
.pc-cod { color:#e8a84c; font-size:.62rem; letter-spacing:.14em; text-transform:uppercase; font-weight:700; margin-bottom:.12rem; }
.pc-nom { font-family:'Cormorant Garamond',serif; font-size:1.12rem; color:#f5ede0; margin-bottom:.18rem; font-weight:600; }
.pc-loc { color:rgba(245,237,224,.48); font-size:.72rem; margin-bottom:.65rem; }
.pc-btns { display:flex; gap:.4rem; flex-wrap:wrap; }
.btn-gmap { background:#4285f4; color:#fff; border:none; padding:.38rem .85rem; border-radius:5px; font-family:'Jost',sans-serif; font-size:.72rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:.3rem; transition:all .18s; }
.btn-gmap:hover { background:#2a72e8; transform:translateY(-1px); }
.btn-drone { background:linear-gradient(135deg,#a84810,#e8a84c); color:#fff; border:none; padding:.38rem .85rem; border-radius:5px; font-family:'Jost',sans-serif; font-size:.72rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:.3rem; transition:all .18s; box-shadow:0 2px 10px rgba(192,106,34,.42); }
.btn-drone:hover { transform:translateY(-1px); }
.btn-detail { background:transparent; color:#e8a84c; border:1px solid rgba(232,168,76,.38); padding:.38rem .85rem; border-radius:5px; font-family:'Jost',sans-serif; font-size:.72rem; font-weight:600; cursor:pointer; transition:all .18s; }
.btn-detail:hover { background:rgba(232,168,76,.1); }
.btn-reset { position:absolute; top:.6rem; right:.6rem; background:rgba(3,1,0,.88); border:1px solid rgba(192,106,34,.4); color:#e8a84c; padding:.25rem .62rem; border-radius:4px; font-size:.67rem; font-family:'Jost',sans-serif; cursor:pointer; z-index:20; transition:all .18s; }
.btn-reset:hover { background:rgba(192,106,34,.18); }

/* LEFT CONTENT */
.hm-tag { display:inline-flex; align-items:center; gap:.45rem; background:rgba(192,106,34,.1); border:1px solid rgba(192,106,34,.3); color:#e8a84c; padding:.28rem .82rem; border-radius:2rem; font-size:.68rem; letter-spacing:.15em; text-transform:uppercase; margin-bottom:1.4rem; width:fit-content; }
.hm-h1 { font-family:'Cormorant Garamond',serif; font-size:clamp(2.5rem,3.9vw,3.9rem); color:#f5ede0; line-height:1.1; margin-bottom:1rem; }
.hm-h1 em { color:#e8a84c; font-style:italic; }
.hm-d { color:rgba(245,237,224,.62); font-size:.9rem; line-height:1.85; margin-bottom:1.65rem; max-width:410px; }
.hm-ctas { display:flex; gap:.7rem; flex-wrap:wrap; margin-bottom:2rem; }
.hm-stats { display:flex; gap:2rem; margin-bottom:1.8rem; }
.hs-n { font-family:'Cormorant Garamond',serif; font-size:1.8rem; color:#e8a84c; font-weight:700; line-height:1; }
.hs-l { color:rgba(245,237,224,.4); font-size:.62rem; letter-spacing:.12em; text-transform:uppercase; margin-top:.12rem; }
.hm-trust { display:flex; flex-direction:column; gap:.4rem; }
.ht-i { display:flex; align-items:center; gap:.5rem; background:rgba(255,255,255,.035); border:1px solid rgba(192,106,34,.18); border-radius:6px; padding:.42rem .78rem; color:rgba(245,237,224,.7); font-size:.76rem; }
.ht-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }

/* DRONE MODAL */
.dov { position:fixed; inset:0; z-index:999; background:rgba(0,0,0,.95); display:flex; align-items:center; justify-content:center; padding:2rem; }
.dbox { position:relative; max-width:940px; width:100%; }
.dbox video { width:100%; border-radius:9px; max-height:82vh; }
.dx { position:absolute; top:-2.5rem; right:0; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15); color:#fff; font-size:.83rem; padding:.32rem .8rem; border-radius:4px; cursor:pointer; font-family:'Jost',sans-serif; }

/* HINT */
.map-hint { position:absolute; bottom:.5rem; left:50%; transform:translateX(-50%); background:rgba(0,0,0,.6); color:rgba(245,237,224,.45); padding:.2rem .65rem; border-radius:2rem; font-size:.62rem; font-family:'Jost',sans-serif; pointer-events:none; white-space:nowrap; }

@media(max-width:850px) {
  .hmapa { grid-template-columns:1fr; padding:5rem 1.4rem 9rem; min-height:auto; gap:2rem; }
  .hm-r { min-height:320px; }
  .ar-map-wrap { max-width:260px; }
  .hm-trust { display:none; }
  .pin-card { bottom:-4.5rem; min-width:230px; }
}
@media(max-width:420px) { .hm-h1 { font-size:2rem; } .hm-stats { gap:1.2rem; } }
`;

function hasVid(m) { return m?.some(x => x.tipo === "video"); }
function getVid(m) { return m?.find(x => x.tipo === "video"); }

export function MapaArgentina({ terrenos = [], onVerFicha, lang, onGoCondominios }) {
  const es = lang === "es";
  const [hov, setHov] = useState(null);
  const [sel, setSel] = useState(null);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
  const [zoomStyle, setZoomStyle] = useState({});
  const [droneUrl, setDroneUrl] = useState(null);
  const wrapRef = useRef();
  const SVG_W = 400, SVG_H = 820;

  const wc = terrenos.filter(t => t.coordenadas?.includes(","));

  function parsell(s) { const p = s.split(",").map(v => parseFloat(v.trim())); return { lat: p[0], lng: p[1] }; }

  function onPinEnter(t, e) {
    setHov(t);
    const r = wrapRef.current?.getBoundingClientRect();
    const svgEl = wrapRef.current?.querySelector("svg");
    if (r && svgEl) {
      const svgR = svgEl.getBoundingClientRect();
      setTipPos({ x: e.clientX - svgR.left, y: e.clientY - svgR.top });
    }
  }

  function onPinClick(t) {
    if (sel?.id === t.id) { setSel(null); setZoomStyle({}); return; }
    setSel(t);
    const { lat, lng } = parsell(t.coordenadas);
    const px = toX(lng), py = toY(lat);
    // Zoom to pin: scale 2.8x, centered on pin
    const scale = 2.8;
    const tx = SVG_W / 2 - px * scale;
    const ty = SVG_H / 2 - py * scale - 30;
    setZoomStyle({ transform: `translate(${tx}px, ${ty}px) scale(${scale})` });
  }

  function resetView() { setSel(null); setZoomStyle({}); }

  return (<>
    <section className="hmapa">
      {/* LEFT */}
      <div className="hm-l">
        <div className="hm-tag">📍 {es ? "Argentina · Condominio de Tierras · Todo escriturado" : "Argentina · Land Condominiums · Fully titled"}</div>
        <h1 className="hm-h1">{es ? <><span>Invertí en tierra.</span><br /><em>Con escritura real.</em></> : <><span>Invest in land.</span><br /><em>With real title.</em></>}</h1>
        <p className="hm-d">{es ? "Vendemos fracciones de hectáreas en condominio, respaldadas por boleta de cesión firmada por el dueño original. Título vigente, impuestos al día." : "We sell hectare fractions as condominiums, backed by a legal assignment signed by the original titleholder. Valid deed, taxes paid."}</p>
        <div className="hm-ctas">
          <button className="bp" onClick={onGoCondominios}>{es ? "Ver condominios" : "Browse"}</button>
          <button className="bg">{es ? "Consultar ahora" : "Inquire"}</button>
        </div>
        <div className="hm-stats">
          <div><div className="hs-n">{terrenos.filter(t => t.disponibilidad === "Disponible").length}</div><div className="hs-l">{es ? "Disponibles" : "Available"}</div></div>
          <div><div className="hs-n">{wc.length}</div><div className="hs-l">{es ? "En mapa" : "On map"}</div></div>
          <div><div className="hs-n">15+</div><div className="hs-l">{es ? "Años" : "Years"}</div></div>
        </div>
        <div className="hm-trust">
          {[["#888","📜",es?"Escritura pública vigente":"Valid public deed"],["#2d6a3f","✅",es?"Impuestos al día":"Taxes paid"],["#e8a84c","🤝",es?"Cesión firmada":"Owner-signed"],["#4285f4","🌍",es?"Argentina y el mundo":"Worldwide"]].map(([col,ic,lb],i)=>(
            <div className="ht-i" key={i}><div className="ht-dot" style={{ background: col }} />{ic} {lb}</div>
          ))}
        </div>
      </div>

      {/* RIGHT — MAP */}
      <div className="hm-r">
        <div className="ar-map-wrap" ref={wrapRef}>
          <div className="ar-map-glow" />

          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="ar-map-svg" style={{ overflow: "visible" }}>
            <defs>
              <radialGradient id="m-bg" cx="45%" cy="38%" r="58%">
                <stop offset="0%" stopColor="#221005" />
                <stop offset="100%" stopColor="#080300" />
              </radialGradient>
              <radialGradient id="m-pin" cx="36%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#ffe07a" />
                <stop offset="52%" stopColor="#e8a84c" />
                <stop offset="100%" stopColor="#9a4208" />
              </radialGradient>
              <filter id="pin-gf" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="3.5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Zoom group */}
            <g className="ar-map-zoom" style={zoomStyle}>
              {/* Background */}
              <polygon points={CONTINENTAL} fill="url(#m-bg)" />

              {/* Region fills */}
              {REGIONS.map((r, i) => <polygon key={i} points={r.pts} fill={r.color} className="ar-reg" />)}

              {/* Internal province lines */}
              {INTERNAL.map((d, i) => <path key={i} d={d} className="ar-line" />)}

              {/* Outer border glow */}
              <polygon points={CONTINENTAL} className="ar-border-glow" />
              {/* Outer border */}
              <polygon points={CONTINENTAL} className="ar-border" />

              {/* Pins */}
              {wc.map(t => {
                const { lat, lng } = parsell(t.coordenadas);
                const px = Math.round(toX(lng)), py = Math.round(toY(lat));
                const is = sel?.id === t.id, ih = hov?.id === t.id;
                return (
                  <g key={t.id} className="pin-g" filter="url(#pin-gf)"
                    onMouseEnter={e => { e.stopPropagation(); onPinEnter(t, e); }}
                    onMouseLeave={e => { e.stopPropagation(); setHov(null); }}
                    onClick={e => { e.stopPropagation(); onPinClick(t); }}>
                    <circle cx={px} cy={py} r="9" fill="none" stroke="#e8a84c" strokeWidth="1.3" className="pin-r1" />
                    <circle cx={px} cy={py} r="9" fill="none" stroke="#c06a22" strokeWidth=".9" className="pin-r2" />
                    {(is || ih) && <circle cx={px} cy={py} r="14" fill="rgba(232,168,76,.1)" stroke="rgba(232,168,76,.28)" strokeWidth=".8" />}
                    <circle cx={px} cy={py} r={is ? 7.5 : ih ? 6.5 : 5.5}
                      fill="url(#m-pin)" stroke={is ? "#fff5cc" : "#f5ede0"} strokeWidth={is ? 1.8 : 1.3}
                      className={is || ih ? "" : "pin-core"} style={{ transition: "r .2s" }} />
                    <circle cx={px - 1} cy={py - 1.5} r={is ? 2.5 : 2} fill="rgba(255,246,170,.88)" />
                    {(is || ih) && (
                      <text x={px + 11} y={py - 7} fontSize="5.5" fill="#f5ede0"
                        fontFamily="Jost,sans-serif" fontWeight="600"
                        style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,.95))" }}>
                        {(t.nombre || "").split("—")[0].trim().substring(0, 20)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Tooltip */}
          {hov && !sel && (
            <div className="ar-tip" style={{ left: tipPos.x, top: tipPos.y }}>
              <div className="tip-cod">{hov.codigo}</div>
              <div className="tip-nom">{hov.nombre}</div>
              <div className="tip-pre">{hov.precio}</div>
            </div>
          )}

          {/* Reset button */}
          {sel && <button className="btn-reset" onClick={resetView}>↺ {es ? "Ver todo" : "Reset"}</button>}

          {/* Pin card */}
          {sel && (
            <div className="pin-card">
              <div className="pc-cod">{sel.codigo}</div>
              <div className="pc-nom">{sel.nombre}</div>
              <div className="pc-loc">📍 {sel.ubicacion}</div>
              <div className="pc-btns">
                {sel.coordenadas && (() => {
                  const { lat, lng } = parsell(sel.coordenadas);
                  return <button className="btn-gmap" onClick={() => window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank")}>🗺️ Google Maps</button>;
                })()}
                {hasVid(sel.media) && <button className="btn-drone" onClick={() => setDroneUrl(getVid(sel.media).url)}>🚁 {es ? "Ver dron" : "Drone"}</button>}
                <button className="btn-detail" onClick={() => onVerFicha && onVerFicha(sel)}>{es ? "Ver ficha →" : "Details →"}</button>
              </div>
            </div>
          )}

          {/* Hint */}
          {!sel && wc.length > 0 && (
            <div className="map-hint">📍 {es ? "Tocá un pin para ver el terreno" : "Click a pin to view the property"}</div>
          )}
        </div>
      </div>
    </section>

    {droneUrl && (
      <div className="dov" onClick={() => setDroneUrl(null)}>
        <div className="dbox" onClick={e => e.stopPropagation()}>
          <button className="dx" onClick={() => setDroneUrl(null)}>✕ {es ? "Cerrar" : "Close"}</button>
          <video src={droneUrl} controls autoPlay style={{ width: "100%", borderRadius: "9px", maxHeight: "82vh" }} />
        </div>
      </div>
    )}
  </>);
}
