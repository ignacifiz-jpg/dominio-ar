import { useState, useEffect } from "react";
import { AuthModal, UserNavBtn, authCss } from "./Auth.jsx";
import { MediaUpload, mediaCss } from "./MediaUpload.jsx";
import { MapaArgentina, mapaCss } from "./MapaArgentina.jsx";
import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "./firebase.js";

const T = {
  es: {
    navInicio:"Inicio",navCondominios:"Condominios",navOfrecer:"Ofrecé tu terreno",navValoracion:"Valoración",navAveriguaciones:"Averiguaciones",navDesarrollo:"Desarrollo",navContacto:"Contacto",navPanel:"Panel",
    heroTag:"Argentina · Condominio de Tierras · Todo escriturado",heroTitle1:"Invertí en tierra.",heroTitle2:"Con escritura real.",
    heroDesc:"Vendemos fracciones de hectáreas en condominio, respaldadas por boleta de cesión firmada por el dueño original. Título de propiedad vigente, impuestos al día. Sin riesgos, sin letras chicas.",
    heroCta1:"Ver condominios",heroCta2:"Consultar ahora",
    statDisp:"Disponibles",statCartera:"En cartera",statAnios:"Años experiencia",
    howTitle:"¿Cómo",howTitleEm:"funciona?",
    how1T:"1. Elegís tu fracción",how1D:"Seleccionás la cantidad de hectáreas o fracción que querés adquirir dentro del predio de tu elección.",
    how2T:"2. Firmamos la cesión",how2D:"El dueño original firma la boleta de cesión de derechos. El terreno tiene escritura pública vigente e impuestos al día.",
    how3T:"3. Sos condómino",how3D:"Pasás a ser copropietario de tu fracción (Art. 1983 CCCN). Podés usar, construir, vender o ceder tu parte en cualquier momento.",
    how4T:"4. Asistencia completa",how4D:"Te acompañamos en todo el proceso, desde la firma hasta la gestión registral si lo necesitás.",
    whatTitle:"¿Qué es un",whatTitleEm:"condominio de tierras?",
    whatDesc:"A diferencia de los derechos posesorios, acá el terreno ya tiene escritura pública. El dueño original cede formalmente sus derechos sobre una fracción mediante boleta legal, similar al modelo que usan los barrios privados en Argentina.",
    condTitle:"Fracciones",condTitleEm:"Disponibles",
    ofrecerTitle:"Ofrecé tu",ofrecerTitleEm:"Terreno",
    ofrecerDesc:"¿Tenés tierras y querés venderlas? Nos encargamos de todo: tasación, publicación, gestión y cierre. Sin esfuerzo de tu parte.",
    valorTitle:"Valoración de",valorTitleEm:"Terrenos",
    averTitle:"Averiguaciones y",averTitleEm:"Gestiones",
    desTitle:"Desarrollo de",desTitleEm:"Proyectos",
    contactTitle:"Hablemos",contactTitleEm:"sin compromiso",
    termTitle:"Términos de Uso",privTitle:"Política de Privacidad",
    footer:"Dominio AR · Cesión de derechos en condominio · Argentina y el mundo",langBtn:"🌐 English",
  },
  en: {
    navInicio:"Home",navCondominios:"Condominiums",navOfrecer:"List your land",navValoracion:"Valuation",navAveriguaciones:"Inquiries",navDesarrollo:"Development",navContacto:"Contact",navPanel:"Panel",
    heroTag:"Argentina · Land Condominiums · Fully titled",heroTitle1:"Invest in land.",heroTitle2:"With real title.",
    heroDesc:"We sell fractions of hectares as condominiums, backed by a legal assignment signed by the original titleholder. Valid public deed, taxes up to date. No risks, no fine print.",
    heroCta1:"Browse condominiums",heroCta2:"Inquire now",
    statDisp:"Available",statCartera:"In portfolio",statAnios:"Years experience",
    howTitle:"How it",howTitleEm:"works",
    how1T:"1. Choose your fraction",how1D:"Select the number of hectares or fraction you want to acquire within your chosen property.",
    how2T:"2. We sign the assignment",how2D:"The original owner signs the legal assignment deed. The land has a valid public title and taxes paid up to date.",
    how3T:"3. You become a co-owner",how3D:"You become a co-owner of your fraction (Art. 1983 Argentine Civil Code). You can use, build, sell or transfer your share at any time.",
    how4T:"4. Full assistance",how4D:"We guide you through the entire process, from signing to registration if needed.",
    whatTitle:"What is a",whatTitleEm:"land condominium?",
    whatDesc:"Unlike possessory rights, here the land already has a public deed. The original owner formally assigns rights over a fraction through a legal document, similar to how private neighborhoods work in Argentina.",
    condTitle:"Available",condTitleEm:"Fractions",
    ofrecerTitle:"List your",ofrecerTitleEm:"Land",
    ofrecerDesc:"Do you own land and want to sell? We handle everything: valuation, listing, management and closing. No effort on your part.",
    valorTitle:"Land",valorTitleEm:"Valuation",
    averTitle:"Inquiries &",averTitleEm:"Management",
    desTitle:"Project",desTitleEm:"Development",
    contactTitle:"Let us talk",contactTitleEm:"no commitment",
    termTitle:"Terms of Use",privTitle:"Privacy Policy",
    footer:"Dominio AR · Land condominium assignments · Argentina & worldwide",langBtn:"🌐 Español",
  },
};

const css = `
${authCss}
${mediaCss}
${mapaCss}

@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{font-family:'Jost',sans-serif;background:#faf6f0;color:#0f0a06;min-height:100vh;}
h1,h2,h3,h4{font-family:'Cormorant Garamond',serif;}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 1.5rem;height:64px;background:rgba(15,10,6,0.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(192,106,34,0.3);gap:0.5rem;}
.nav-logo{font-family:'Cormorant Garamond',serif;font-size:1.3rem;font-weight:700;color:#e8a84c;cursor:pointer;flex-shrink:0;}
.nav-logo span{color:#f5ede0;font-weight:400;}
.nav-links{display:flex;gap:0.6rem;align-items:center;flex-wrap:wrap;} .ham-btn{display:none;}
.nl{color:#f5ede0;font-size:0.7rem;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;font-weight:500;opacity:0.75;transition:opacity 0.2s,color 0.2s;background:none;border:none;font-family:'Jost',sans-serif;white-space:nowrap;padding:0.2rem 0.4rem;}
.nl:hover,.nl.active{opacity:1;color:#e8a84c;}
.nl-admin{background:#c06a22;color:white;border:none;padding:0.35rem 0.8rem;border-radius:4px;font-size:0.7rem;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;font-family:'Jost',sans-serif;font-weight:600;transition:background 0.2s;white-space:nowrap;}
.nl-admin:hover{background:#e8a84c;color:#0f0a06;}
.nl-lang{background:transparent;border:1px solid rgba(232,168,76,0.4);color:#e8a84c;padding:0.3rem 0.6rem;border-radius:2rem;font-size:0.68rem;cursor:pointer;font-family:'Jost',sans-serif;transition:all 0.2s;white-space:nowrap;}
.nl-lang:hover{background:rgba(232,168,76,0.1);}
.hero{min-height:100vh;background:linear-gradient(160deg,#0f0a06 0%,#3d2010 55%,#1a0d05 100%);display:flex;flex-direction:column;justify-content:center;padding:7rem 2.5rem 4rem;position:relative;overflow:hidden;}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 70% 40%,rgba(192,106,34,0.18) 0%,transparent 60%);pointer-events:none;}
.hero-tag{display:inline-flex;align-items:center;gap:0.5rem;background:rgba(192,106,34,0.15);border:1px solid rgba(192,106,34,0.4);color:#e8a84c;padding:0.35rem 0.9rem;border-radius:2rem;font-size:0.7rem;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:1.8rem;width:fit-content;}
.hero h1{font-size:clamp(2.6rem,5.5vw,4.8rem);color:#f5ede0;line-height:1.1;max-width:680px;margin-bottom:1.4rem;}
.hero h1 em{color:#e8a84c;font-style:italic;}
.hero-desc{color:rgba(245,237,224,0.7);max-width:520px;line-height:1.8;font-size:0.98rem;margin-bottom:2.5rem;}
.hero-ctas{display:flex;gap:1rem;flex-wrap:wrap;}
.hero-trust{position:absolute;right:2.5rem;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:0.8rem;}
.trust-b{background:rgba(255,255,255,0.05);border:1px solid rgba(192,106,34,0.3);border-radius:8px;padding:0.7rem 1.1rem;color:#f5ede0;font-size:0.78rem;display:flex;align-items:center;gap:0.6rem;}
.hero-stats{position:absolute;right:2.5rem;bottom:2.5rem;display:flex;gap:2rem;}
.sn{font-family:'Cormorant Garamond',serif;font-size:2rem;color:#e8a84c;font-weight:700;line-height:1;}
.sl{color:rgba(245,237,224,0.5);font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;margin-top:0.2rem;}
.bp{background:#c06a22;color:white;border:none;padding:0.8rem 1.8rem;border-radius:4px;cursor:pointer;font-family:'Jost',sans-serif;font-size:0.82rem;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;transition:all 0.2s;}
.bp:hover{background:#e8a84c;color:#0f0a06;transform:translateY(-1px);}
.bg{background:transparent;color:#f5ede0;border:1px solid rgba(245,237,224,0.35);padding:0.8rem 1.8rem;border-radius:4px;cursor:pointer;font-family:'Jost',sans-serif;font-size:0.82rem;letter-spacing:0.1em;text-transform:uppercase;font-weight:500;transition:all 0.2s;}
.bg:hover{border-color:#e8a84c;color:#e8a84c;}
.bd{background:#0f0a06;color:white;border:none;padding:0.8rem 1.8rem;border-radius:4px;cursor:pointer;font-family:'Jost',sans-serif;font-size:0.82rem;letter-spacing:0.08em;text-transform:uppercase;font-weight:600;transition:background 0.2s;}
.bd:hover{background:#c06a22;}
.sec{padding:5rem 2.5rem;}
.sc{background:#f5ede0;}
.sd{background:#0f0a06;}
.sb{background:#3d2010;}
.sw{background:white;}
.sh{text-align:center;margin-bottom:3rem;}
.stag{display:inline-block;font-size:0.7rem;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;margin-bottom:0.8rem;color:#c06a22;}
.stag-l{color:#e8a84c;}
.stit{font-size:clamp(1.9rem,3.8vw,3rem);color:#0f0a06;line-height:1.2;}
.stit em{color:#c06a22;font-style:italic;}
.stit-l{color:#f5ede0;}
.stit-l em{color:#e8a84c;}
.sdesc{color:#8a6a4a;max-width:560px;margin:0.8rem auto 0;line-height:1.8;font-size:0.92rem;}
.sdesc-l{color:rgba(245,237,224,0.6);}
.mw{max-width:1100px;margin:0 auto;}
.steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.5rem;max-width:1100px;margin:0 auto;}
.step{background:white;border:1px solid rgba(192,106,34,0.2);border-radius:10px;padding:1.8rem;position:relative;transition:box-shadow 0.2s;}
.step:hover{box-shadow:0 8px 32px rgba(192,106,34,0.12);}
.step-n{font-family:'Cormorant Garamond',serif;font-size:3rem;color:rgba(192,106,34,0.15);font-weight:700;position:absolute;top:0.8rem;right:1rem;line-height:1;}
.step-i{font-size:1.8rem;margin-bottom:1rem;}
.step h3{font-size:1.08rem;color:#0f0a06;margin-bottom:0.5rem;}
.step p{color:#8a6a4a;font-size:0.86rem;line-height:1.7;}
.wg{display:grid;grid-template-columns:1fr 1fr;gap:3rem;max-width:980px;margin:0 auto;align-items:center;}
.wl{list-style:none;display:flex;flex-direction:column;gap:0.8rem;}
.wl li{display:flex;align-items:flex-start;gap:0.8rem;color:#3d2010;font-size:0.9rem;line-height:1.6;}
.wl li::before{content:'✓';color:#c06a22;font-weight:700;flex-shrink:0;margin-top:0.1rem;}
.wb{background:#0f0a06;border-radius:12px;padding:2rem;}
.wb h3{font-size:1.3rem;color:#e8a84c;margin-bottom:1rem;}
.wb p{color:rgba(245,237,224,0.7);font-size:0.86rem;line-height:1.8;}
.lr{display:inline-block;background:rgba(232,168,76,0.15);color:#e8a84c;border-radius:4px;padding:0.2rem 0.5rem;font-size:0.72rem;margin-top:0.6rem;font-weight:600;}
.sg{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.2rem;max-width:1100px;margin:0 auto;}
.sc2{background:rgba(255,255,255,0.05);border:1px solid rgba(192,106,34,0.3);border-radius:10px;padding:1.6rem;cursor:pointer;transition:all 0.2s;}
.sc2:hover{background:rgba(192,106,34,0.1);border-color:rgba(192,106,34,0.6);transform:translateY(-2px);}
.sc2-i{font-size:1.8rem;margin-bottom:0.8rem;}
.sc2 h3{font-size:1.15rem;color:#f5ede0;margin-bottom:0.4rem;}
.sc2 p{color:rgba(245,237,224,0.6);font-size:0.82rem;line-height:1.6;}
.sc2-cta{color:#e8a84c;font-size:0.75rem;margin-top:0.8rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;}
.cg{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.5rem;max-width:1100px;margin:0 auto;}
.pc{background:white;border-radius:10px;overflow:hidden;border:1px solid rgba(192,106,34,0.2);transition:box-shadow 0.25s,transform 0.25s;cursor:pointer;}
.pc:hover{box-shadow:0 12px 40px rgba(192,106,34,0.15);transform:translateY(-3px);}
.ci{width:100%;height:190px;background:linear-gradient(135deg,#c8d4b8,#a0b888);display:flex;align-items:center;justify-content:center;position:relative;}
.cb-badge{position:absolute;top:0.7rem;left:0.7rem;padding:0.22rem 0.65rem;border-radius:2rem;font-size:0.68rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;}
.bd-disp{background:#d4edda;color:#2d6a3f;}
.bd-res{background:#fff3cd;color:#856404;}
.bd-vend{background:#f8d7da;color:#721c24;}
.cb{padding:1.1rem 1.3rem 1.3rem;}
.cc{font-size:0.68rem;color:#c06a22;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;margin-bottom:0.3rem;}
.cn{font-size:1.2rem;font-family:'Cormorant Garamond',serif;color:#0f0a06;font-weight:600;margin-bottom:0.2rem;}
.cl{color:#8a6a4a;font-size:0.8rem;margin-bottom:0.7rem;}
.cs{display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:0.7rem;}
.sp{background:#f5ede0;color:#3d2010;border-radius:2rem;padding:0.18rem 0.6rem;font-size:0.72rem;font-weight:500;}
.cp{font-family:'Cormorant Garamond',serif;font-size:1.4rem;color:#c06a22;font-weight:700;}
.cp span{font-size:0.8rem;color:#8a6a4a;font-family:'Jost',sans-serif;font-weight:400;}
.cf{display:flex;justify-content:space-between;align-items:center;margin-top:0.8rem;padding-top:0.8rem;border-top:1px solid rgba(192,106,34,0.15);}
.bv{background:#0f0a06;color:white;border:none;padding:0.42rem 0.9rem;border-radius:4px;cursor:pointer;font-family:'Jost',sans-serif;font-size:0.76rem;font-weight:600;transition:background 0.2s;}
.bv:hover{background:#c06a22;}
.bw{background:#25d366;color:white;border:none;padding:0.42rem 0.85rem;border-radius:4px;cursor:pointer;font-family:'Jost',sans-serif;font-size:0.76rem;font-weight:600;display:flex;align-items:center;gap:0.3rem;transition:background 0.2s;}
.bw:hover{background:#1da851;}
.tb{max-width:1100px;margin:0 auto 2rem;display:flex;gap:1rem;flex-wrap:wrap;align-items:center;justify-content:space-between;}
.sb2{display:flex;align-items:center;gap:0.5rem;background:white;border:1px solid rgba(192,106,34,0.25);border-radius:6px;padding:0.45rem 0.9rem;flex:1;max-width:340px;}
.sb2 input{border:none;outline:none;font-family:'Jost',sans-serif;font-size:0.88rem;color:#0f0a06;background:transparent;width:100%;}
.fs{background:white;border:1px solid rgba(192,106,34,0.25);border-radius:6px;padding:0.48rem 0.9rem;font-family:'Jost',sans-serif;font-size:0.82rem;color:#0f0a06;cursor:pointer;outline:none;}
.ov{position:fixed;inset:0;z-index:200;background:rgba(15,10,6,0.85);backdrop-filter:blur(4px);display:flex;align-items:flex-start;justify-content:center;padding:2rem;overflow-y:auto;}
.mo{background:white;border-radius:12px;max-width:760px;width:100%;margin:auto;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,0.4);}
.mh{background:#0f0a06;padding:1.3rem 1.8rem;display:flex;justify-content:space-between;align-items:flex-start;}
.mh h2{font-size:1.6rem;color:#f5ede0;}
.mh .mc{color:#e8a84c;font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;}
.mx{background:rgba(255,255,255,0.1);border:none;color:#f5ede0;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background 0.2s;}
.mx:hover{background:#c06a22;}
.mi{width:100%;height:230px;background:linear-gradient(135deg,#c8d4b8,#a0b888);display:flex;align-items:center;justify-content:center;position:relative;}
.mb{padding:1.8rem;}
.mg{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.4rem;}
.fl{font-size:0.68rem;color:#c06a22;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;margin-bottom:0.2rem;}
.fv{font-size:0.9rem;color:#0f0a06;font-weight:500;}
.mob{background:#f5ede0;border-radius:8px;padding:1rem 1.2rem;margin-bottom:1.4rem;border-left:3px solid #c06a22;}
.mob p{color:#3d2010;font-size:0.86rem;line-height:1.7;}
.ma{display:flex;gap:1rem;flex-wrap:wrap;}
.fc{background:white;border:1px solid rgba(192,106,34,0.25);border-radius:12px;padding:2rem;}
.fc h3{font-size:1.4rem;color:#0f0a06;margin-bottom:1.4rem;}
.fr{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
.fg{margin-bottom:1rem;}
.lb{display:block;font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:0.35rem;font-weight:600;}
.lb-d{color:#c06a22;}
.lb-l{color:#e8a84c;}
.fi,.fta,.fse{width:100%;border-radius:6px;font-family:'Jost',sans-serif;font-size:0.88rem;padding:0.65rem 0.9rem;outline:none;transition:border-color 0.2s;}
.fi-l,.fta-l,.fse-l{background:#faf6f0;border:1px solid rgba(192,106,34,0.25);color:#0f0a06;}
.fi-l:focus,.fta-l:focus,.fse-l:focus{border-color:#c06a22;}
.fi-l::placeholder,.fta-l::placeholder{color:#8a6a4a;}
.fi-dk,.fta-dk,.fse-dk{background:rgba(255,255,255,0.07);border:1px solid rgba(192,106,34,0.35);color:#f5ede0;}
.fi-dk:focus,.fta-dk:focus,.fse-dk:focus{border-color:#e8a84c;}
.fi-dk::placeholder,.fta-dk::placeholder{color:rgba(245,237,224,0.3);}
.fse-l option,.fse-dk option{background:white;color:#0f0a06;}
.fta{resize:vertical;min-height:96px;}
.bsub{width:100%;background:#c06a22;color:white;border:none;padding:0.85rem;border-radius:6px;cursor:pointer;font-family:'Jost',sans-serif;font-size:0.82rem;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;transition:background 0.2s;margin-top:0.4rem;}
.bsub:hover{background:#e8a84c;color:#0f0a06;}
.ctg{display:grid;grid-template-columns:1fr 1.3fr;gap:4rem;max-width:980px;margin:0 auto;}
.cti h2{font-size:2rem;color:#f5ede0;margin-bottom:1rem;}
.cti p{color:rgba(245,237,224,0.6);line-height:1.8;margin-bottom:1.4rem;font-size:0.9rem;}
.cdat{display:flex;align-items:center;gap:0.7rem;margin-bottom:0.6rem;color:#f5ede0;font-size:0.86rem;}
.cdat .ic{color:#e8a84c;}
.sh2{background:linear-gradient(160deg,#0f0a06,#3d2010);padding:6rem 2.5rem 3rem;text-align:center;}
.sb3{max-width:840px;margin:0 auto;}
.ig{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:1.1rem;margin:2rem 0;}
.ic2{background:white;border:1px solid rgba(192,106,34,0.2);border-radius:8px;padding:1.4rem;}
.ic2 h4{font-size:1rem;color:#0f0a06;margin-bottom:0.4rem;}
.ic2 p{color:#8a6a4a;font-size:0.83rem;line-height:1.6;}
.faq-i{border-bottom:1px solid rgba(192,106,34,0.2);padding:1.1rem 0;}
.faq-q{font-weight:600;color:#0f0a06;margin-bottom:0.4rem;font-size:0.92rem;cursor:pointer;display:flex;justify-content:space-between;gap:1rem;}
.faq-a{color:#8a6a4a;font-size:0.86rem;line-height:1.7;}
.lb2{max-width:800px;margin:0 auto;padding:6rem 2rem 4rem;}
.lb2 h1{font-size:2.3rem;color:#0f0a06;margin-bottom:0.5rem;}
.ld{color:#8a6a4a;font-size:0.8rem;margin-bottom:2rem;border-bottom:1px solid rgba(192,106,34,0.2);padding-bottom:1rem;}
.lb2 h2{font-size:1.35rem;color:#3d2010;margin:2rem 0 0.7rem;}
.lb2 p{color:#3d2010;font-size:0.9rem;line-height:1.8;margin-bottom:1rem;}
.lb2 ul{color:#3d2010;font-size:0.9rem;line-height:1.8;margin-bottom:1rem;padding-left:1.5rem;}
.lb2 li{margin-bottom:0.3rem;}
.lrb{background:rgba(192,106,34,0.08);border:1px solid rgba(192,106,34,0.2);border-radius:8px;padding:0.9rem 1.1rem;margin:1rem 0;}
.lrb p{margin:0;color:#8a6a4a;font-size:0.83rem;}
.aw{padding-top:64px;background:#f5ede0;min-height:100vh;}
.ai{max-width:960px;margin:0 auto;padding:3rem 2rem;}
.ahd{display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;flex-wrap:wrap;gap:1rem;}
.at{width:100%;border-collapse:collapse;background:white;border-radius:10px;overflow:hidden;}
.at th{background:#0f0a06;color:#e8a84c;padding:0.7rem 0.9rem;text-align:left;font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;}
.at td{padding:0.75rem 0.9rem;border-bottom:1px solid rgba(192,106,34,0.15);font-size:0.83rem;}
.at tr:last-child td{border-bottom:none;}
.at tr:hover td{background:rgba(192,106,34,0.03);}
.aa{display:flex;gap:0.4rem;}
.bsm{padding:0.28rem 0.6rem;border-radius:4px;font-size:0.7rem;cursor:pointer;font-family:'Jost',sans-serif;font-weight:600;border:none;transition:opacity 0.2s;}
.bsm:hover{opacity:0.8;}
.be{background:#c06a22;color:white;}
.bde{background:#dc3545;color:white;}
.toast{position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#0f0a06;color:#f5ede0;padding:0.75rem 1.4rem;border-radius:2rem;font-size:0.83rem;z-index:999;box-shadow:0 8px 24px rgba(0,0,0,0.3);border:1px solid #c06a22;opacity:0;transition:opacity 0.3s;pointer-events:none;}
.toast.show{opacity:1;}
.waf{position:fixed;bottom:2rem;right:2rem;z-index:150;background:#25d366;color:white;border:none;width:56px;height:56px;border-radius:50%;cursor:pointer;font-size:1.6rem;box-shadow:0 4px 20px rgba(37,211,102,0.4);display:flex;align-items:center;justify-content:center;transition:transform 0.2s;}
.waf:hover{transform:scale(1.1);}
.foot{background:#0f0a06;border-top:1px solid rgba(192,106,34,0.2);padding:1.8rem 2.5rem;}
.fg2{max-width:1100px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;}
.foot p{color:rgba(245,237,224,0.4);font-size:0.78rem;}
.foot strong{color:#e8a84c;}
.fls{display:flex;gap:1.2rem;flex-wrap:wrap;}
.flink{color:rgba(245,237,224,0.4);font-size:0.75rem;cursor:pointer;transition:color 0.2s;background:none;border:none;font-family:'Jost',sans-serif;}
.flink:hover{color:#e8a84c;}

/* ── HAMBURGER MENU ── */
.ham-btn{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:8px;z-index:201;margin-left:auto;}
.ham-btn span{display:block;width:24px;height:2px;background:#f5ede0;border-radius:2px;transition:all 0.3s;}
.ham-btn.open span:nth-child(1){transform:translateY(7px) rotate(45deg);}
.ham-btn.open span:nth-child(2){opacity:0;}
.ham-btn.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}
.mob-menu{display:none;position:fixed;inset:0;z-index:200;background:rgba(15,10,6,0.98);backdrop-filter:blur(12px);flex-direction:column;justify-content:center;align-items:center;gap:0;padding:5rem 2rem 2rem;}
.mob-menu.open{display:flex;}
.mob-link{color:#f5ede0;font-size:1.6rem;font-family:'Cormorant Garamond',serif;font-weight:600;cursor:pointer;background:none;border:none;padding:0.9rem 0;width:100%;text-align:center;border-bottom:1px solid rgba(192,106,34,0.15);transition:color 0.2s;}
.mob-link:last-child{border-bottom:none;}
.mob-link:hover,.mob-link.active{color:#e8a84c;}
.mob-actions{display:flex;gap:0.8rem;margin-top:1.5rem;width:100%;}
.mob-actions button{flex:1;}

/* ── MOBILE BASE ── */
@media(max-width:768px){
  /* Nav */
  .nav{padding:0 1.2rem;height:58px;}
  .nav-logo{font-size:1.15rem;}
  .nav-links{display:none !important;}
  .ham-btn{display:flex !important;}

  /* Hero */
  .hero{padding:5.5rem 1.4rem 2.5rem;min-height:100svh;}
  .hero-tag{font-size:0.62rem;padding:0.28rem 0.75rem;}
  .hero h1{font-size:2.4rem;margin-bottom:1.2rem;}
  .hero-desc{font-size:0.92rem;margin-bottom:2rem;}
  .hero-ctas{flex-direction:column;gap:0.7rem;}
  .hero-ctas .bp,.hero-ctas .bg{width:100%;text-align:center;padding:0.9rem;}
  .hero-trust,.hero-stats{display:none;}

  /* Sections */
  .sec{padding:2.5rem 1.2rem;}
  .sh2{padding:4.5rem 1.2rem 2rem;}
  .stit{font-size:1.8rem;}

  /* Steps */
  .steps{grid-template-columns:1fr;gap:1rem;}
  .step{padding:1.4rem;}

  /* What grid */
  .wg{grid-template-columns:1fr;gap:1.5rem;}
  .wb{padding:1.4rem;}

  /* Services grid */
  .sg{grid-template-columns:1fr 1fr;gap:0.8rem;}
  .sc2{padding:1.2rem;}
  .sc2-i{font-size:1.4rem;margin-bottom:0.5rem;}
  .sc2 h3{font-size:0.95rem;}
  .sc2 p{display:none;}

  /* Cards */
  .cg{grid-template-columns:1fr;gap:1.2rem;}
  .ci{height:160px;}
  .cb{padding:1rem 1.1rem 1.1rem;}
  .cn{font-size:1.1rem;}
  .cp{font-size:1.2rem;}

  /* Toolbar */
  .tb{flex-direction:column;align-items:stretch;gap:0.7rem;}
  .sb2{max-width:100%;}

  /* Modal */
  .ov{padding:0;align-items:flex-end;}
  .mo{border-radius:16px 16px 0 0;max-height:92vh;overflow-y:auto;}
  .mh{padding:1.2rem 1.4rem;}
  .mh h2{font-size:1.4rem;}
  .mi{height:180px;}
  .mb{padding:1.4rem;}
  .mg{grid-template-columns:1fr 1fr;gap:0.8rem;}

  /* What list */
  .wl li{font-size:0.86rem;}

  /* Info grid */
  .ig{grid-template-columns:1fr;gap:1rem;}
  .ic2{padding:1.2rem;}

  /* Contact */
  .ctg{grid-template-columns:1fr;gap:2rem;}
  .cti h2{font-size:1.7rem;}

  /* Forms */
  .fr{grid-template-columns:1fr;}
  .fc{padding:1.4rem;}
  .fc h3{font-size:1.2rem;}

  /* Legal */
  .lb2{padding:4.5rem 1.4rem 3rem;}
  .lb2 h1{font-size:1.8rem;}

  /* Admin */
  .ai{padding:2rem 1rem;}
  .ahd{flex-direction:column;align-items:stretch;}
  .ahd .bp{width:100%;}
  .at th:nth-child(3),.at td:nth-child(3),.at th:nth-child(4),.at td:nth-child(4){display:none;}

  /* Auth modal */
  .auth-overlay{align-items:flex-end;padding:0;}
  .auth-box{border-radius:16px 16px 0 0;max-height:92vh;overflow-y:auto;}

  /* Footer */
  .fg2{flex-direction:column;text-align:center;gap:1rem;}
  .fls{justify-content:center;}

  /* User dropdown */
  .user-dropdown{right:-1rem;min-width:200px;}

  /* Hide old hero if still present */
  .hero{padding:5rem 1.2rem 2.5rem;min-height:100svh;}
  .hero-tag{font-size:.62rem;}
  .hero h1{font-size:2.2rem;}
  .hero-ctas{flex-direction:column;gap:.6rem;}
  .hero-ctas .bp,.hero-ctas .bg{width:100%;text-align:center;}
  .hero-trust,.hero-stats{display:none;}
}

/* ── SMALL MOBILE ── */
@media(max-width:380px){
  .hero h1{font-size:2rem;}
  .sg{grid-template-columns:1fr;}
  .mg{grid-template-columns:1fr;}
}
`;

const INIT = [
  {id:1,codigo:"COND-001",emoji:"🌿",nombre:"Fracción Norte — El Impenetrable",ubicacion:"Ruta Provincial 3, km 18 — Chaco",zona:"NEA",superficie:"5.000 m² (½ ha)",precio:"USD 9.500",estadoLegal:"Cesión de derechos · Escritura pública vigente",disponibilidad:"Disponible",coordenadas:"-26.8231, -60.4412",observaciones:"Terreno llano con monte nativo. Impuestos al día. Escritura registrada en el Registro Inmobiliario del Chaco. Camino consolidado de acceso. Ideal para construcción o inversión.",contacto:"Roberto Fernández",telefono:"+5493625551234"},
  {id:2,codigo:"COND-002",emoji:"🌾",nombre:"Fracción Campo Grande",ubicacion:"Ruta Nacional 16, km 48 — Santiago del Estero",zona:"NOA",superficie:"1 Ha completa",precio:"USD 14.000",estadoLegal:"Cesión de derechos · Escritura pública vigente",disponibilidad:"Disponible",coordenadas:"-27.6812, -63.2518",observaciones:"Hectárea completa en condominio. Dueño original con escritura al día. Zona con crecimiento rural. Excelente acceso por ruta pavimentada.",contacto:"Roberto Fernández",telefono:"+5493625551234"},
  {id:3,codigo:"COND-003",emoji:"💧",nombre:"Fracción Río Dulce Vista",ubicacion:"Paraje El Simbolar — Santiago del Estero",zona:"NOA",superficie:"2.500 m²",precio:"USD 6.800",estadoLegal:"Cesión de derechos · Escritura pública vigente",disponibilidad:"Reservado",coordenadas:"-28.1234, -63.9123",observaciones:"Terreno con vista al río. Escritura inscripta y vigente. Ideal para cabaña o retiro. Posesión tranquila con vecinos consolidados.",contacto:"Roberto Fernández",telefono:"+5493625551234"},
];
const EF={codigo:"",nombre:"",ubicacion:"",zona:"",superficie:"",precio:"",estadoLegal:"Cesión de derechos · Escritura pública vigente",disponibilidad:"Disponible",coordenadas:"",observaciones:"",contacto:"",telefono:"",emoji:"🌿",media:[]};
const WA="5493625551234";

function useToast(){const[m,setM]=useState(null);const show=(t)=>{setM(t);setTimeout(()=>setM(null),2800);};return{m,show};}

function Wa({phone,msg,full,lbl}){const url=`https://wa.me/${phone.replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`;return <button className="bw" style={full?{flex:1}:{}} onClick={()=>window.open(url,"_blank")}>💬 {lbl||"WhatsApp"}</button>;}
function Bdg({s}){const c=s==="Disponible"||s==="Available"?"bd-disp":s==="Reservado"||s==="Reserved"?"bd-res":"bd-vend";return <span className={`cb-badge ${c}`}>{s}</span>;}

export default function App(){
  const[lang,setLang]=useState("es");
  const[mobOpen,setMobOpen]=useState(false);
  const goPage=(p)=>{go(p);setMobOpen(false);};
  const[showAuth,setShowAuth]=useState(false);
  const[user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem("dominioar_user"));}catch{return null;}});
  function handleLogin(u){setUser(u);}
  function handleLogout(){setUser(null);localStorage.removeItem("dominioar_user");}
  const[auth,setAuth]=useState(false);
  const[pw,setPw]=useState("");const[pwErr,setPwErr]=useState(false);
  const ADMIN_PW="Fraccion$2025!";
  function tryLogin(){if(pw===ADMIN_PW){setAuth(true);setPwErr(false);}else{setPwErr(true);setPw("");}}
  const t=T[lang];
  const[page,setPage]=useState("inicio");
  const[data,setData]=useState([]);
  const[loadingData,setLoadingData]=useState(true);

  // Load fracciones from Firestore on mount

// Geocoding: convierte ubicacion/zona a coordenadas aproximadas via Nominatim
const geocodeCache = {};
async function geocodeTerrain(t) {
  if (t.coordenadas && t.coordenadas.trim()) return t; // ya tiene coords exactas
  const key = t.ubicacion + t.zona;
  if (geocodeCache[key]) return { ...t, coordenadasAprox: geocodeCache[key] };
  try {
    // Extraer ciudad/provincia de ubicacion
    const parts = (t.ubicacion || "").split("—");
    const lugar = (parts[parts.length - 1] || t.zona || "Argentina").trim();
    const q = encodeURIComponent(lugar + ", Argentina");
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=ar`);
    const data = await res.json();
    if (data && data[0]) {
      const coords = `${data[0].lat}, ${data[0].lon}`;
      geocodeCache[key] = coords;
      return { ...t, coordenadasAprox: coords };
    }
  } catch(e) { console.warn("Geocode error:", e); }
  return t;
}

  useEffect(()=>{
    async function initData(){
      try{
        const snap = await getDocs(collection(db,"fracciones"));
        if(snap.empty){
          for(const item of INIT){
            const {id,...rest}=item;
            await addDoc(collection(db,"fracciones"),rest);
          }
        }
      }catch(e){ console.error(e); }
    }
    initData().then(()=>{
      // Escucha en tiempo real — se actualiza solo cuando hay cambios
      const unsub = onSnapshot(collection(db,"fracciones"), async (snap)=>{
        const items = snap.docs.map(d=>({...d.data(),id:d.id}));
        // Geocodificar los que no tienen coordenadas exactas
        const withCoords = await Promise.all(items.map(t=>geocodeTerrain(t)));
        setData(withCoords);
        setLoadingData(false);
      }, (e)=>{ console.error(e); setData(INIT); setLoadingData(false); });
      return ()=>unsub();
    });
  },[]);
  const[sel,setSel]=useState(null);
  const[srch,setSrch]=useState("");const[filt,setFilt]=useState("Todos");
  const toast=useToast();
  const[form,setForm]=useState(EF);const[eid,setEid]=useState(null);const[sf,setSf]=useState(false);
  const[of,setOf]=useState({nombre:"",email:"",tel:"",prov:"",sup:"",desc:""});
  const[vf,setVf]=useState({nombre:"",email:"",tel:"",prov:"",sup:"",tipo:""});
  const[cf,setCf]=useState({nombre:"",email:user?.email||"",tel:"",prop:"",msg:""});
  const[faq,setFaq]=useState(null);

  // Detección de región para moneda
  const [moneda, setMoneda] = useState(()=>{
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const lang = navigator.language || '';
      if(tz.startsWith('America/Argentina') || tz.startsWith('America/Buenos_Aires') || lang.includes('es-AR')) return 'USD';
      return 'EUR';
    } catch(e) { return 'EUR'; }
  });

  // Stripe links - Valoración
  const STRIPE = {
    estandar: { EUR: 'https://buy.stripe.com/eVqaEWcrpaJY5tffng6Ri00', USD: 'https://buy.stripe.com/eVqaEW0IH7xMaNz0sm6Ri03' },
    premium:  { EUR: 'https://buy.stripe.com/9B6fZgbnl7xM6xj7UO6Ri01', USD: 'https://buy.stripe.com/00w4gy4YXf0ecVHgrk6Ri04' },
  };
  // Stripe links - Averiguaciones
  const STRIPE_AVER = {
    estandar: { EUR: 'https://buy.stripe.com/9B67sK77505kbRD5MG6Ri05', USD: 'https://buy.stripe.com/5kQcN4ajhbO2f3P1wq6Ri06' },
    premium:  { EUR: 'https://buy.stripe.com/8x2fZgdvt5pEdZL4IC6Ri07', USD: 'https://buy.stripe.com/8x2cN41ML4lA1cZdf86Ri08' },
  };
  // Precios Valoración
  const PRECIOS = { estandar: { EUR: '€45', USD: 'USD 49' }, premium: { EUR: '€89', USD: 'USD 99' } };
  // Precios Averiguaciones
  const PRECIOS_AVER = { estandar: { EUR: '€35', USD: 'USD 39' }, premium: { EUR: '€120', USD: 'USD 130' } };
  const go=(p)=>{setPage(p);setSel(null);window.scrollTo(0,0);};
  const fil=data.filter(p=>{const q=srch.toLowerCase();const ms=p.nombre.toLowerCase().includes(q)||p.ubicacion.toLowerCase().includes(q)||p.zona.toLowerCase().includes(q);const mf=filt==="Todos"||p.disponibilidad===filt;return ms&&mf;});
  async function save(){
    if(!form.nombre||!form.precio){toast.show("⚠️ Completá nombre y precio.");return;}
    try{
      if(eid){
        const {id,...rest}=form;
        await updateDoc(doc(db,"fracciones",eid),rest);
        setData(d=>d.map(x=>x.id===eid?{...form,id:eid}:x));
        toast.show("✅ Fracción actualizada");
      } else {
        const {id,...rest}=form;
        const docRef = await addDoc(collection(db,"fracciones"),rest);
        setData(d=>[...d,{...form,id:docRef.id}]);
        toast.show("✅ Fracción guardada");
      }
      setForm(EF);setEid(null);setSf(false);if(page!=="admin")go("admin");
    }catch(e){
      toast.show("❌ Error al guardar. Revisá la conexión.");
      console.error(e);
    }
  }
  const sub=(e,n)=>{e.preventDefault();toast.show(`✅ ${n} enviado. Te contactamos pronto.`);};
  const es=lang==="es";

  return(<>
    <style>{css}</style>
    <nav className="nav">
      <div className="nav-logo" onClick={()=>go("inicio")}>DOMINIO<span> AR</span></div>
      <div className="nav-links">
        <button className={`nl${page==="inicio"?" active":""}`} onClick={()=>go("inicio")}>{t.navInicio}</button>
        <button className={`nl${page==="condominios"?" active":""}`} onClick={()=>go("condominios")}>{t.navCondominios}</button>
        <button className={`nl${page==="ofrecer"?" active":""}`} onClick={()=>go("ofrecer")}>{t.navOfrecer}</button>
        <button className={`nl${page==="valoracion"?" active":""}`} onClick={()=>go("valoracion")}>{t.navValoracion}</button>
        <button className={`nl${page==="averiguaciones"?" active":""}`} onClick={()=>go("averiguaciones")}>{t.navAveriguaciones}</button>
        <button className={`nl${page==="desarrollo"?" active":""}`} onClick={()=>go("desarrollo")}>{t.navDesarrollo}</button>
        <button className={`nl${page==="contacto"?" active":""}`} onClick={()=>go("contacto")}>{t.navContacto}</button>
        <button className="nl-lang" onClick={()=>setLang(l=>l==="es"?"en":"es")}>{t.langBtn}</button>
        <UserNavBtn user={user} onOpenAuth={()=>setShowAuth(true)} onLogout={handleLogout} onAdmin={()=>go("admin")} lang={lang}/>
        {user?.isAdmin&&<button className="nl-admin" onClick={()=>go("admin")}>⚙ {t.navPanel}</button>}
      </div>
      <button className={`ham-btn${mobOpen?" open":""}`} onClick={()=>setMobOpen(o=>!o)} aria-label="Menú">
        <span/><span/><span/>
      </button>
    </nav>
    <div className={`mob-menu${mobOpen?" open":""}`}>
      {[[t.navInicio,"inicio"],[t.navCondominios,"condominios"],[t.navOfrecer,"ofrecer"],
        [t.navValoracion,"valoracion"],[t.navAveriguaciones,"averiguaciones"],
        [t.navDesarrollo,"desarrollo"],[t.navContacto,"contacto"]
      ].map(([lb,pg])=>(
        <button key={pg} className={`mob-link${page===pg?" active":""}`} onClick={()=>{go(pg);setMobOpen(false);}}>{lb}</button>
      ))}
      {user?.isAdmin&&<button className="mob-link" style={{color:"#e8a84c"}} onClick={()=>{go("admin");setMobOpen(false);}}>⚙ {t.navPanel}</button>}
      <div className="mob-actions">
        <button className="nl-lang" style={{flex:1,textAlign:"center"}} onClick={()=>setLang(l=>l==="es"?"en":"es")}>{t.langBtn}</button>
        {!user
          ?<button className="bp" style={{flex:2}} onClick={()=>{setShowAuth(true);setMobOpen(false);}}>👤 {es?"Registrarse":"Sign up"}</button>
          :<button className="bg" style={{flex:2,color:"#f5ede0",borderColor:"rgba(245,237,224,0.3)"}} onClick={()=>{handleLogout();setMobOpen(false);}}>🚪 {es?"Salir":"Log out"}</button>
        }
      </div>
    </div>

    {page==="inicio"&&<>
      <MapaArgentina terrenos={data} lang={lang} onVerFicha={(t)=>{setPage("condominios");setSel(t);window.scrollTo(0,0);}} onGoCondominios={()=>go("condominios")}/>

      <section className="sec sc">
        <div className="sh"><div className="stag">{es?"Proceso claro y transparente":"Clear & transparent process"}</div>
        <h2 className="stit">{t.howTitle} <em>{t.howTitleEm}</em></h2></div>
        <div className="steps">
          {[[t.how1T,t.how1D,"🔍","1"],[t.how2T,t.how2D,"📝","2"],[t.how3T,t.how3D,"🏡","3"],[t.how4T,t.how4D,"🤝","4"]].map(([ti,de,ic,nu],i)=>(
            <div className="step" key={i}><div className="step-n">{nu}</div><div className="step-i">{ic}</div><h3>{ti}</h3><p>{de}</p></div>
          ))}
        </div>
      </section>

      <section className="sec sw">
        <div className="sh"><div className="stag">{es?"Marco legal":"Legal framework"}</div>
        <h2 className="stit">{t.whatTitle} <em>{t.whatTitleEm}</em></h2></div>
        <div className="wg">
          <div>
            <p style={{color:"#8a6a4a",lineHeight:1.8,marginBottom:"1.4rem",fontSize:"0.93rem"}}>{t.whatDesc}</p>
            <ul className="wl">
              {(es?["El terreno tiene escritura pública inscripta y vigente","El dueño original firma una boleta de cesión de derechos","El comprador adquiere una fracción indivisa (condominio)","Puede usar, construir, vender o ceder su parte libremente","Proceso similar al de los barrios privados y countries"]:["The land has a valid registered public deed","The original owner signs a legal assignment document","The buyer acquires an undivided fraction (condominium)","Can use, build, sell or transfer their share freely","Similar process to private neighborhoods and gated communities"]).map((item,i)=><li key={i}>{item}</li>)}
            </ul>
          </div>
          <div className="wb">
            <h3>{es?"Respaldo Legal":"Legal Backing"}</h3>
            <p>{es?"El condominio está regulado por el Art. 1983 del CCCN: el condómino puede enajenar y gravar su parte sin necesidad del asentimiento de los restantes (Art. 1989 CCCN). La cesión de derechos la firma el titular registral, garantizando la validez de la operación.":"Condominiums are regulated by Art. 1983 of the Argentine Civil Code. Each co-owner can sell or encumber their share without the other owners' consent (Art. 1989). The assignment is signed by the registered owner, guaranteeing the validity of the transaction."}</p>
            <span className="lr">Art. 1983-1989 CCCN</span><br/>
            <span className="lr" style={{marginTop:"0.4rem"}}>Ley 24.240 Defensa del Consumidor</span>
          </div>
        </div>
      </section>

      <section className="sec sd">
        <div className="sh"><div className="stag stag-l">{es?"Lo que hacemos":"What we do"}</div>
        <h2 className="stit stit-l">{es?"Servicios":"Services"} <em>{es?"completos":"& solutions"}</em></h2></div>
        <div className="sg">
          {[{ic:"🏞️",t:"Condominios",te:"Condominiums",d:"Fracciones de hectáreas con escritura respaldada.",de:"Hectare fractions backed by full title.",p:"condominios"},
            {ic:"📋",t:"Ofrecé tu terreno",te:"List your land",d:"Tasamos y vendemos tu propiedad.",de:"We value and sell your property.",p:"ofrecer"},
            {ic:"📊",t:"Valoración",te:"Valuation",d:"Tasación profesional de tierras rurales.",de:"Professional rural land valuation.",p:"valoracion"},
            {ic:"🔍",t:"Averiguaciones",te:"Inquiries",d:"Estado registral, dominio y asesoramiento.",de:"Title search, registry status and legal guidance.",p:"averiguaciones"},
            {ic:"🏘️",t:"Desarrollo",te:"Development",d:"Barrios privados y ecológicos.",de:"Private neighborhoods and eco-villages.",p:"desarrollo"},
          ].map((s,i)=>(
            <div className="sc2" key={i} onClick={()=>go(s.p)}>
              <div className="sc2-i">{s.ic}</div><h3>{es?s.t:s.te}</h3><p>{es?s.d:s.de}</p>
              <div className="sc2-cta">{es?"Ver más →":"Learn more →"}</div>
            </div>
          ))}
        </div>
      </section>
    </>}

    {page==="condominios"&&<div style={{paddingTop:64}}>
      <div className="sh2"><div className="stag stag-l">{es?"Cartera actual":"Current portfolio"}</div>
      <h2 className="stit stit-l">{t.condTitle} <em>{t.condTitleEm}</em></h2></div>
      <section className="sec sc">
        <div className="tb">
          <div className="sb2"><span>🔍</span><input placeholder={es?"Buscar...":"Search..."} value={srch} onChange={e=>setSrch(e.target.value)}/></div>
          <select className="fs" value={filt} onChange={e=>setFilt(e.target.value)}>
            <option value="Todos">{es?"Todos":"All"}</option>
            <option value="Disponible">{es?"Disponibles":"Available"}</option>
            <option value="Reservado">{es?"Reservados":"Reserved"}</option>
            <option value="Vendido">{es?"Vendidos":"Sold"}</option>
          </select>
          <span style={{color:"#8a6a4a",fontSize:"0.82rem"}}>{fil.length} {es?"resultado(s)":"result(s)"}</span>
        </div>
        {loadingData&&<div style={{textAlign:"center",padding:"3rem",color:"#8a6a4a"}}><div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>⏳</div><p>Cargando fracciones...</p></div>}
        <div className="cg">
          {fil.map(p=>(
            <div className="pc" key={p.id}>
              <div className="ci" onClick={()=>setSel(p)} style={{background:p.media&&p.media[0]?"#c8d4b8":"linear-gradient(135deg,#c8d4b8,#a0b888)",overflow:"hidden"}}>
                {p.media&&p.media[0]
                  ?<>
                    <img src={p.media[0].url} alt={p.nombre} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center",transition:"transform 0.3s"}}
                      onMouseEnter={e=>e.target.style.transform="scale(1.04)"}
                      onMouseLeave={e=>e.target.style.transform="scale(1)"}/>
                    <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(15,10,6,0.35) 0%,transparent 50%)",pointerEvents:"none"}}/>
                  </>
                  :<span style={{fontSize:"3.2rem"}}>{p.emoji||"🌿"}</span>
                }
                <Bdg s={p.disponibilidad}/>
              </div>
              <div className="cb">
                <div className="cc">{p.codigo}</div>
                <div className="cn" onClick={()=>setSel(p)}>{p.nombre}</div>
                <div className="cl">📍 {p.ubicacion}</div>
                <div className="cs">
                  <span className="sp">📐 {p.superficie}</span>
                  <span className="sp">🗺️ {p.zona}</span>
                  <span className="sp">📜 {es?"Escritura vigente":"Valid deed"}</span>
                </div>
                <div className="cp">{p.precio} <span>· {es?"Cesión de derechos":"Rights assignment"}</span></div>
                <div className="cf">
                  <button className="bv" onClick={()=>setSel(p)}>{es?"Ver ficha →":"View detail →"}</button>
                  <Wa phone={p.telefono||WA} msg={`Hola! Me interesa la fracción ${p.codigo} — ${p.nombre}. ¿Me podés dar más información?`}/>
                </div>
              </div>
            </div>
          ))}
          {fil.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:"4rem",color:"#8a6a4a"}}><div style={{fontSize:"3rem",marginBottom:"1rem"}}>🔍</div><p>{es?"No se encontraron resultados.":"No results found."}</p></div>}
        </div>
      </section>
    </div>}

    {page==="ofrecer"&&<div style={{paddingTop:64}}>
      {/* HERO BANNER */}
      <div style={{background:"linear-gradient(135deg,#1a0d02 0%,#2d1708 50%,#1a0d02 100%)",padding:"4rem 2rem",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%,rgba(192,106,34,.15) 0%,transparent 65%)",pointerEvents:"none"}}/>
        <div className="stag stag-l" style={{marginBottom:"1rem",display:"inline-flex"}}>{es?"Para propietarios de tierra":"For landowners"}</div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(2.2rem,4vw,3.5rem)",color:"#f5ede0",lineHeight:1.1,marginBottom:"1.2rem"}}>
          {es?"Convertí tu terreno en":"Turn your land into"}<br/><em style={{color:"#e8a84c",fontStyle:"italic"}}>{es?"dinero, sin complicaciones":"money, hassle-free"}</em>
        </h2>
        <p style={{color:"rgba(245,237,224,.65)",fontSize:"1rem",lineHeight:1.8,maxWidth:560,margin:"0 auto 2rem"}}>
          {es?"Nos encargamos de todo: tasación, publicación, gestión y cierre. Vos solo esperás el resultado. Sin costos iniciales, sin burocracia.":"We handle everything: appraisal, listing, management and closing. You just wait for the result. No upfront costs, no bureaucracy."}
        </p>
        <div style={{display:"flex",gap:"1.5rem",justifyContent:"center",flexWrap:"wrap"}}>
          {(es?[["🏡","Propiedades escrituradas"],["🌍","Compradores internacionales"],["💰","Sin costo inicial"]]:[["🏡","Titled properties"],["🌍","International buyers"],["💰","No upfront cost"]]).map(([ic,lb],i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:".5rem",background:"rgba(192,106,34,.12)",border:"1px solid rgba(192,106,34,.3)",borderRadius:"2rem",padding:".35rem 1rem",color:"#e8a84c",fontSize:".78rem",fontWeight:600}}>{ic} {lb}</div>
          ))}
        </div>
      </div>

      {/* CÓMO FUNCIONA */}
      <section className="sec" style={{background:"#faf6f0"}}>
        <div className="sb3">
          <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
            <div className="stag stag-l">{es?"El proceso":"The process"}</div>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2rem",color:"#0f0a06",marginTop:".5rem"}}>{es?"Así de simple":"That simple"}</h3>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"1.5rem"}}>
            {(es?[["01","Nos contactás","Completás el formulario con los datos básicos de tu terreno.","📋"],["02","Tasamos","Analizamos el mercado y determinamos el valor real.","📊"],["03","Publicamos","Tu terreno aparece en nuestra plataforma y llega a miles de compradores.","🌍"],["04","Cerramos","Coordinamos la cesión y recibís el pago. Nosotros cobramos solo al vender.","✅"]]:[["01","Contact us","Fill the form with your land details.","📋"],["02","We appraise","We analyze the market and determine fair value.","📊"],["03","We list","Your land reaches thousands of buyers on our platform.","🌍"],["04","We close","We coordinate the transfer and you get paid.","✅"]]).map(([num,ti,de,ic],i)=>(
              <div key={i} style={{background:"white",borderRadius:12,padding:"1.5rem",boxShadow:"0 2px 16px rgba(0,0,0,.06)",border:"1px solid rgba(192,106,34,.12)",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:"-.5rem",right:"-.5rem",fontFamily:"'Cormorant Garamond',serif",fontSize:"4rem",color:"rgba(192,106,34,.08)",fontWeight:700,lineHeight:1}}>{num}</div>
                <div style={{fontSize:"1.8rem",marginBottom:".7rem"}}>{ic}</div>
                <div style={{fontSize:".65rem",letterSpacing:".14em",textTransform:"uppercase",color:"#c06a22",fontWeight:700,marginBottom:".3rem"}}>Paso {num}</div>
                <h4 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.15rem",color:"#0f0a06",marginBottom:".4rem"}}>{ti}</h4>
                <p style={{color:"#6b5240",fontSize:".83rem",lineHeight:1.7,margin:0}}>{de}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="sec" style={{background:"#0f0a06",padding:"4rem 2rem"}}>
        <div className="sb3">
          <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2rem",color:"#f5ede0"}}>{es?"¿Por qué elegirnos?":"Why choose us?"}</h3>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"1rem"}}>
            {(es?[["📸","Publicación premium","Fotos profesionales, mapa interactivo y ficha completa en nuestra plataforma.","#e8a84c"],["📣","Alcance real","Compradores en Argentina, España, EEUU y el exterior.","#4285f4"],["💼","Gestión completa","Visitas, consultas, negociación y proceso de cesión. Todo lo hacemos nosotros.","#2d6a3f"],["⚡","Rapidez","La mayoría de los terrenos se venden en menos de 90 días.","#c06a22"],["🔒","Seguridad jurídica","Solo trabajamos con escrituras vigentes e impuestos al día.","#8a4db5"],["💰","Sin costo inicial","Comisión solo al concretarse la venta. Cero riesgo para vos.","#e8a84c"]]:[["📸","Premium listing","Pro photos, interactive map and full specs on our platform.","#e8a84c"],["📣","Real reach","Buyers in Argentina, Spain, USA and abroad.","#4285f4"],["💼","Full management","Visits, inquiries, negotiation and transfer. We do it all.","#2d6a3f"],["⚡","Speed","Most properties sell in under 90 days.","#c06a22"],["🔒","Legal security","We only work with valid deeds and paid taxes.","#8a4db5"],["💰","No upfront cost","Commission only when the sale closes. Zero risk for you.","#e8a84c"]]).map(([ic,ti,de,col],i)=>(
              <div key={i} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(192,106,34,.18)",borderRadius:10,padding:"1.4rem",transition:"all .2s"}}>
                <div style={{fontSize:"1.6rem",marginBottom:".6rem"}}>{ic}</div>
                <h4 style={{color:col,fontSize:".88rem",fontWeight:700,marginBottom:".35rem",letterSpacing:".02em"}}>{ti}</h4>
                <p style={{color:"rgba(245,237,224,.55)",fontSize:".8rem",lineHeight:1.7,margin:0}}>{de}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORMULARIO */}
      <section className="sec" style={{background:"#faf6f0"}}>
        <div className="sb3">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3rem",alignItems:"start"}}>
            {/* Left info */}
            <div>
              <div className="stag stag-l" style={{marginBottom:"1rem"}}>{es?"Contacto directo":"Direct contact"}</div>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2rem",color:"#0f0a06",lineHeight:1.2,marginBottom:"1.2rem"}}>
                {es?"Contanos sobre tu terreno":"Tell us about your land"}
              </h3>
              <p style={{color:"#6b5240",fontSize:".9rem",lineHeight:1.8,marginBottom:"2rem"}}>
                {es?"Completá el formulario y nos ponemos en contacto en menos de 24 horas. Sin compromiso.":"Fill the form and we'll get back to you within 24 hours. No commitment."}
              </p>
              <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
                {(es?[["📞","Respondemos en menos de 24hs"],["🤝","Sin compromisos ni contratos iniciales"],["📍","Operamos en todo el país"]]:[["📞","We respond within 24h"],["🤝","No initial commitments"],["📍","We operate nationwide"]]).map(([ic,lb],i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:".75rem",color:"#3d2010",fontSize:".85rem",fontWeight:500}}>
                    <span style={{fontSize:"1.1rem"}}>{ic}</span>{lb}
                  </div>
                ))}
              </div>
            </div>
            {/* Form */}
            <div className="fc">
              <h3 style={{marginBottom:"1.5rem"}}>{es?"Cargá tu terreno":"Submit your land"}</h3>
              <form onSubmit={e=>sub(e,es?"Oferta de terreno":"Land offer")}>
                <div className="fr">
                  <div className="fg"><label className="lb lb-d">{es?"Tu nombre":"Your name"}</label><input className="fi fi-l" placeholder={es?"Nombre completo":"Full name"} value={of.nombre} onChange={e=>setOf({...of,nombre:e.target.value})}/></div>
                  <div className="fg"><label className="lb lb-d">Email</label><input className="fi fi-l" type="email" placeholder="tu@email.com" value={of.email} onChange={e=>setOf({...of,email:e.target.value})}/></div>
                </div>
                <div className="fr">
                  <div className="fg"><label className="lb lb-d">{es?"Teléfono":"Phone"}</label><input className="fi fi-l" placeholder="+54 9 ..." value={of.tel} onChange={e=>setOf({...of,tel:e.target.value})}/></div>
                  <div className="fg"><label className="lb lb-d">{es?"Provincia":"Province"}</label><input className="fi fi-l" placeholder="Chaco, Salta..." value={of.prov} onChange={e=>setOf({...of,prov:e.target.value})}/></div>
                </div>
                <div className="fg"><label className="lb lb-d">{es?"Superficie aproximada":"Approx. surface"}</label><input className="fi fi-l" placeholder="2 Ha / 5.000 m²" value={of.sup} onChange={e=>setOf({...of,sup:e.target.value})}/></div>
                <div className="fg"><label className="lb lb-d">{es?"Descripción del terreno":"Land description"}</label><textarea className="fta fta-l" placeholder={es?"Accesos, servicios, estado legal, precio esperado...":"Access, services, legal status, expected price..."} value={of.desc} onChange={e=>setOf({...of,desc:e.target.value})}/></div>
                <button type="submit" className="bsub">{es?"Enviar oferta →":"Submit offer →"}</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>}

    {page==="valoracion"&&<div style={{paddingTop:64}}>
      {/* HERO */}
      <div style={{background:"linear-gradient(135deg,#1a0d02 0%,#2d1708 50%,#1a0d02 100%)",padding:"4rem 2rem",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%,rgba(192,106,34,.15) 0%,transparent 65%)",pointerEvents:"none"}}/>
        <div className="stag stag-l" style={{marginBottom:"1rem",display:"inline-flex"}}>{es?"Tasación profesional":"Professional appraisal"}</div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(2.2rem,4vw,3.5rem)",color:"#f5ede0",lineHeight:1.1,marginBottom:"1.2rem"}}>
          {es?"Conocé el valor real de":"Know the real value of"}<br/><em style={{color:"#e8a84c",fontStyle:"italic"}}>{es?"tu terreno":"your land"}</em>
        </h2>
        <p style={{color:"rgba(245,237,224,.65)",fontSize:"1rem",lineHeight:1.8,maxWidth:540,margin:"0 auto"}}>
          {es?"Determinamos el valor de mercado con criterios actualizados, comparables reales y análisis documental. Tres niveles según tu necesidad.":"We determine market value with up-to-date criteria, real comparables and document analysis. Three levels to suit your needs."}
        </p>
      </div>

      {/* PACKS */}
      <section className="sec" style={{background:"#faf6f0"}}>
        <div className="sb3">
          <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
            <div className="stag stag-l">{es?"Elegí tu plan":"Choose your plan"}</div>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2rem",color:"#0f0a06",marginTop:".5rem",marginBottom:"1rem"}}>{es?"Planes de valoración":"Valuation plans"}</h3>
            {/* Currency toggle */}
            <div style={{display:"inline-flex",background:"#f0ebe4",borderRadius:"2rem",padding:".25rem",gap:".25rem",border:"1px solid rgba(192,106,34,.2)"}}>
              {["EUR","USD"].map(c=>(
                <button key={c} onClick={()=>setMoneda(c)}
                  style={{padding:".35rem 1.1rem",borderRadius:"2rem",border:"none",cursor:"pointer",fontFamily:"'Jost',sans-serif",fontWeight:600,fontSize:".78rem",transition:"all .2s",
                    background:moneda===c?"#c06a22":"transparent",color:moneda===c?"white":"#6b5240"}}>
                  {c==="EUR"?"🇪🇺 EUR":"🇦🇷 USD"}
                </button>
              ))}
            </div>
            <p style={{color:"#8a6a4a",fontSize:".75rem",marginTop:".5rem"}}>{moneda==="EUR"?es?"Precios para Europa":"Prices for Europe":es?"Precios para Argentina":"Prices for Argentina"}</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1.2rem",alignItems:"stretch"}}>
            {(es?[
              {plan:"Básico",precio:"Gratis",plazo:"48 hs",icon:"📋",color:"#6b5240",bg:"white",border:"rgba(107,82,64,.2)",desc:"Estimación orientativa del valor de tu terreno.",items:["Análisis de zona general","Rango de precio estimado","Respuesta por WhatsApp","Sin informe escrito"],cta:"Solicitar gratis",highlight:false},
              {plan:"Estándar",precio:PRECIOS.estandar[moneda],plazo:"5 días",icon:"📊",color:"#c06a22",bg:"#fff9f4",border:"rgba(192,106,34,.4)",desc:"Tasación completa con informe escrito y fundamentos.",items:["Todo lo del plan Básico","Análisis documental (escritura, impuestos)","Comparables de ventas reales","Informe escrito PDF","Valor de mercado justificado"],cta:"Solicitar",highlight:true,stripe:STRIPE.estandar[moneda]},
              {plan:"Premium",precio:PRECIOS.premium[moneda],plazo:"7 días",icon:"🏆",color:"#8a4db5",bg:"#0f0a06",border:"rgba(138,77,181,.5)",desc:"Informe completo con visita técnica y asesoramiento legal.",items:["Todo lo del plan Estándar","Visita al terreno","Análisis catastral y registral","Asesoramiento jurídico","Informe premium sellado","Seguimiento post-valoración"],cta:"Solicitar Premium",highlight:false,dark:true,stripe:STRIPE.premium[moneda]}
            ]:[
              {plan:"Basic",precio:"Free",plazo:"48 hrs",icon:"📋",color:"#6b5240",bg:"white",border:"rgba(107,82,64,.2)",desc:"Indicative estimate of your land's value.",items:["General area analysis","Estimated price range","WhatsApp response","No written report"],cta:"Request free",highlight:false},
              {plan:"Standard",precio:PRECIOS.estandar[moneda],plazo:"5 days",icon:"📊",color:"#c06a22",bg:"#fff9f4",border:"rgba(192,106,34,.4)",desc:"Full appraisal with written report and rationale.",items:["Everything in Basic","Document analysis (deed, taxes)","Real sales comparables","PDF written report","Justified market value"],cta:"Request",highlight:true,stripe:STRIPE.estandar[moneda]},
              {plan:"Premium",precio:PRECIOS.premium[moneda],plazo:"7 days",icon:"🏆",color:"#8a4db5",bg:"#0f0a06",border:"rgba(138,77,181,.5)",desc:"Full report with site visit and legal advisory.",items:["Everything in Standard","On-site visit","Cadastral & registry analysis","Legal advisory","Sealed premium report","Post-valuation follow-up"],cta:"Request Premium",highlight:false,dark:true,stripe:STRIPE.premium[moneda]}
            ]).map((p,i)=>(
              <div key={i} style={{background:p.bg,border:`2px solid ${p.highlight?"#c06a22":p.border}`,borderRadius:14,padding:"1.8rem",position:"relative",display:"flex",flexDirection:"column",boxShadow:p.highlight?"0 8px 32px rgba(192,106,34,.2)":"0 2px 12px rgba(0,0,0,.06)"}}>
                {p.highlight&&<div style={{position:"absolute",top:"-1px",left:"50%",transform:"translateX(-50%)",background:"#c06a22",color:"white",fontSize:".62rem",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",padding:".25rem .9rem",borderRadius:"0 0 6px 6px"}}>{es?"Más elegido":"Most popular"}</div>}
                <div style={{fontSize:"2rem",marginBottom:".7rem"}}>{p.icon}</div>
                <div style={{fontSize:".65rem",letterSpacing:".14em",textTransform:"uppercase",color:p.color,fontWeight:700,marginBottom:".3rem"}}>{p.plan}</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.8rem",color:p.dark?"#f5ede0":"#0f0a06",fontWeight:700,marginBottom:".2rem"}}>{p.precio}</div>
                <div style={{fontSize:".75rem",color:p.dark?"rgba(245,237,224,.45)":"#8a6a4a",marginBottom:"1rem"}}>⏱ {es?"Entrega en":"Delivery in"} {p.plazo}</div>
                <p style={{fontSize:".82rem",color:p.dark?"rgba(245,237,224,.6)":"#6b5240",lineHeight:1.6,marginBottom:"1.2rem"}}>{p.desc}</p>
                <ul style={{listStyle:"none",padding:0,margin:"0 0 1.5rem",display:"flex",flexDirection:"column",gap:".5rem",flex:1}}>
                  {p.items.map((it,j)=>(
                    <li key={j} style={{display:"flex",alignItems:"flex-start",gap:".5rem",fontSize:".8rem",color:p.dark?"rgba(245,237,224,.7)":"#3d2010"}}>
                      <span style={{color:p.color,flexShrink:0,marginTop:".05rem"}}>✓</span>{it}
                    </li>
                  ))}
                </ul>
                <button onClick={()=>p.stripe ? window.open(p.stripe,'_blank') : document.getElementById("val-form").scrollIntoView({behavior:"smooth"})}
                  style={{background:p.highlight?"#c06a22":p.dark?"rgba(138,77,181,.25)":"transparent",color:p.highlight?"white":p.color,border:`1.5px solid ${p.color}`,borderRadius:7,padding:".7rem",fontFamily:"'Jost',sans-serif",fontWeight:700,fontSize:".82rem",cursor:"pointer",transition:"all .2s",letterSpacing:".04em"}}>
                  {p.stripe ? (es?"💳 Pagar ahora →":"💳 Pay now →") : (es?"Solicitar gratis →":"Request free →")}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUÉ INCLUYE */}
      <section className="sec" style={{background:"#0f0a06",padding:"4rem 2rem"}}>
        <div className="sb3">
          <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2rem",color:"#f5ede0"}}>{es?"Nuestro proceso de valoración":"Our valuation process"}</h3>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"1rem"}}>
            {(es?[["📍","Análisis de zona","Mercado local, accesos, servicios e infraestructura disponible.","#e8a84c"],["📄","Estado documental","Escritura, impuestos, mensura, estado registral e inhibiciones.","#4285f4"],["💹","Comparables reales","Ventas recientes en la zona para determinar el precio justo.","#2d6a3f"],["📋","Informe escrito","Documento formal con fundamentos y valor de mercado justificado.","#c06a22"]]:[["📍","Zone analysis","Local market, access, services and infrastructure.","#e8a84c"],["📄","Doc status","Deed, taxes, survey and registry status.","#4285f4"],["💹","Real comparables","Recent sales in the area to determine fair price.","#2d6a3f"],["📋","Written report","Formal document with rationale and justified market value.","#c06a22"]]).map(([ic,ti,de,col],i)=>(
              <div key={i} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(192,106,34,.18)",borderRadius:10,padding:"1.4rem"}}>
                <div style={{fontSize:"1.6rem",marginBottom:".6rem"}}>{ic}</div>
                <h4 style={{color:col,fontSize:".88rem",fontWeight:700,marginBottom:".35rem"}}>{ti}</h4>
                <p style={{color:"rgba(245,237,224,.55)",fontSize:".8rem",lineHeight:1.7,margin:0}}>{de}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORMULARIO */}
      <section className="sec" style={{background:"#faf6f0"}} id="val-form">
        <div className="sb3">
          <div style={{textAlign:"center",marginBottom:"2rem"}}>
            <div className="stag stag-l">{es?"Solicitar valoración":"Request valuation"}</div>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2rem",color:"#0f0a06",marginTop:".5rem"}}>{es?"Contanos sobre tu propiedad":"Tell us about your property"}</h3>
          </div>
          <div className="fc" style={{maxWidth:640,margin:"0 auto"}}>
            <form onSubmit={e=>sub(e,es?"Solicitud de valoración":"Valuation request")}>
              <div className="fr">
                <div className="fg"><label className="lb lb-d">{es?"Nombre":"Name"}</label><input className="fi fi-l" placeholder={es?"Tu nombre":"Your name"} value={vf.nombre} onChange={e=>setVf({...vf,nombre:e.target.value})}/></div>
                <div className="fg"><label className="lb lb-d">Email</label><input className="fi fi-l" type="email" placeholder="tu@email.com" value={vf.email} onChange={e=>setVf({...vf,email:e.target.value})}/></div>
              </div>
              <div className="fr">
                <div className="fg"><label className="lb lb-d">{es?"Teléfono":"Phone"}</label><input className="fi fi-l" placeholder="+54 9 ..." value={vf.tel} onChange={e=>setVf({...vf,tel:e.target.value})}/></div>
                <div className="fg"><label className="lb lb-d">{es?"Provincia":"Province"}</label><input className="fi fi-l" placeholder="Chaco, Salta..." value={vf.prov} onChange={e=>setVf({...vf,prov:e.target.value})}/></div>
              </div>
              <div className="fr">
                <div className="fg"><label className="lb lb-d">{es?"Superficie":"Surface"}</label><input className="fi fi-l" placeholder="2 Ha / 5.000 m²" value={vf.sup} onChange={e=>setVf({...vf,sup:e.target.value})}/></div>
                <div className="fg"><label className="lb lb-d">{es?"Plan elegido":"Selected plan"}</label>
                  <select className="fse fse-l" value={vf.tipo} onChange={e=>setVf({...vf,tipo:e.target.value})}>
                    <option value="">{es?"Seleccioná...":"Select..."}</option>
                    <option>{es?"Básico (Gratis)":"Basic (Free)"}</option>
                    <option>{es?"Estándar":"Standard"}</option>
                    <option>{es?"Premium":"Premium"}</option>
                  </select>
                </div>
              </div>
              <div className="fg"><label className="lb lb-d">{es?"Descripción de la propiedad":"Property description"}</label><textarea className="fta fta-l" placeholder={es?"Ubicación, accesos, estado legal, precio esperado...":"Location, access, legal status, expected price..."} value={vf.desc||""} onChange={e=>setVf({...vf,desc:e.target.value})}/></div>
              <button type="submit" className="bsub">{es?"Solicitar valoración →":"Request valuation →"}</button>
            </form>
          </div>
        </div>
      </section>
    </div>}

    {page==="averiguaciones"&&<div style={{paddingTop:64}}>
      {/* HERO */}
      <div style={{background:"linear-gradient(135deg,#1a0d02 0%,#2d1708 50%,#1a0d02 100%)",padding:"4rem 2rem",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%,rgba(192,106,34,.15) 0%,transparent 65%)",pointerEvents:"none"}}/>
        <div className="stag stag-l" style={{marginBottom:"1rem",display:"inline-flex"}}>{es?"Gestión y asesoramiento":"Management & advice"}</div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(2.2rem,4vw,3.5rem)",color:"#f5ede0",lineHeight:1.1,marginBottom:"1.2rem"}}>
          {es?"Verificá el estado legal de":"Verify the legal status of"}<br/><em style={{color:"#e8a84c",fontStyle:"italic"}}>{es?"la tierra antes de comprar":"the land before you buy"}</em>
        </h2>
        <p style={{color:"rgba(245,237,224,.65)",fontSize:"1rem",lineHeight:1.8,maxWidth:540,margin:"0 auto"}}>
          {es?"Verificamos el estado registral, catastral y legal de cualquier fracción o terreno en Argentina antes de que inviertas. Comprás tierra con seguridad total y sin sorpresas.":"We verify the registry, cadastral and legal status of any land fraction in Argentina before you invest. Buy land with total security and no surprises."}
        </p>
      </div>

      {/* PACKS */}
      <section className="sec" style={{background:"#faf6f0"}}>
        <div className="sb3">
          <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
            <div className="stag stag-l">{es?"Servicios disponibles":"Available services"}</div>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2rem",color:"#0f0a06",marginTop:".5rem",marginBottom:"1rem"}}>{es?"Elegí tu verificación de terreno":"Choose your land verification"}</h3>
            <div style={{display:"inline-flex",background:"#f0ebe4",borderRadius:"2rem",padding:".25rem",gap:".25rem",border:"1px solid rgba(192,106,34,.2)"}}>
              {["EUR","USD"].map(c=>(
                <button key={c} onClick={()=>setMoneda(c)}
                  style={{padding:".35rem 1.1rem",borderRadius:"2rem",border:"none",cursor:"pointer",fontFamily:"'Jost',sans-serif",fontWeight:600,fontSize:".78rem",transition:"all .2s",
                    background:moneda===c?"#c06a22":"transparent",color:moneda===c?"white":"#6b5240"}}>
                  {c==="EUR"?"🇪🇺 EUR":"🇦🇷 USD"}
                </button>
              ))}
            </div>
            <p style={{color:"#8a6a4a",fontSize:".75rem",marginTop:".5rem"}}>{moneda==="EUR"?es?"Precios para Europa":"Prices for Europe":es?"Precios para Argentina":"Prices for Argentina"}</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1.2rem",alignItems:"stretch"}}>
            {(es?[
              {plan:"Consulta de Dominio",precio:"Gratis",plazo:"24-48 hs",icon:"🔍",color:"#6b5240",bg:"white",border:"rgba(107,82,64,.2)",desc:"Verificación inicial del estado registral del terreno o fracción que te interesa.",items:["Titular registral del terreno","Existencia de hipotecas o embargos","Inhibiciones generales","Respuesta por WhatsApp"],cta:"Consultar gratis",highlight:false},
              {plan:"Informe de Terreno",precio:PRECIOS_AVER.estandar[moneda],plazo:"3-5 días",icon:"📋",color:"#c06a22",bg:"#fff9f4",border:"rgba(192,106,34,.4)",desc:"Informe completo del terreno: estado registral, catastral, impuestos y documentación.",items:["Todo lo de Consulta Básica","Estado catastral y mensura","Verificación de impuestos","Informe escrito PDF","Historial de titularidad del lote/fracción"],cta:"Obtener informe",highlight:true,stripe:STRIPE_AVER.estandar[moneda]},
              {plan:"Escrituración y Cesión",precio:PRECIOS_AVER.premium[moneda],plazo:"5-7 días",icon:"⚖️",color:"#8a4db5",bg:"#0f0a06",border:"rgba(138,77,181,.5)",desc:"Gestión completa para comprar tierra con seguridad: asesoramiento jurídico y trámites registrales.",items:["Todo lo del Informe Completo","Asesoramiento jurídico personalizado","Gestiones ante el Registro","Análisis de cesión de derechos y escrituración rural","Asistencia para compradores de Argentina y el exterior","Seguimiento hasta la cesión definitiva"],cta:"Gestión completa",highlight:false,dark:true,stripe:STRIPE_AVER.premium[moneda]}
            ]:[
              {plan:"Title Search",precio:"Free",plazo:"24-48 hrs",icon:"🔍",color:"#6b5240",bg:"white",border:"rgba(107,82,64,.2)",desc:"Initial verification of the land fraction's registry status.",items:["Current registered owner","Mortgages or liens","General encumbrances","WhatsApp response"],cta:"Inquire free",highlight:false},
              {plan:"Land Report",precio:PRECIOS_AVER.estandar[moneda],plazo:"3-5 days",icon:"📋",color:"#c06a22",bg:"#fff9f4",border:"rgba(192,106,34,.4)",desc:"Full land report: registry status, cadastral data, taxes and documentation.",items:["Everything in Basic","Cadastral status & survey","Tax verification","PDF written report","Ownership history"],cta:"Get report",highlight:true,stripe:STRIPE_AVER.estandar[moneda]},
              {plan:"Assignment & Title",precio:PRECIOS_AVER.premium[moneda],plazo:"5-7 days",icon:"⚖️",color:"#8a4db5",bg:"#0f0a06",border:"rgba(138,77,181,.5)",desc:"Complete land purchase management: legal advisory and registry procedures.",items:["Everything in Full Report","Personalized legal advisory","Registry procedures","Assignment & titling analysis","Assistance for foreign buyers","Follow-up until closing"],cta:"Full management",highlight:false,dark:true,stripe:STRIPE.premium[moneda]}
            ]).map((p,i)=>(
              <div key={i} style={{background:p.bg,border:`2px solid ${p.highlight?"#c06a22":p.border}`,borderRadius:14,padding:"1.8rem",position:"relative",display:"flex",flexDirection:"column",boxShadow:p.highlight?"0 8px 32px rgba(192,106,34,.2)":"0 2px 12px rgba(0,0,0,.06)"}}>
                {p.highlight&&<div style={{position:"absolute",top:"-1px",left:"50%",transform:"translateX(-50%)",background:"#c06a22",color:"white",fontSize:".62rem",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",padding:".25rem .9rem",borderRadius:"0 0 6px 6px"}}>{es?"El más completo":"Most complete"}</div>}
                <div style={{fontSize:"2rem",marginBottom:".7rem"}}>{p.icon}</div>
                <div style={{fontSize:".65rem",letterSpacing:".14em",textTransform:"uppercase",color:p.color,fontWeight:700,marginBottom:".3rem"}}>{p.plan}</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.8rem",color:p.dark?"#f5ede0":"#0f0a06",fontWeight:700,marginBottom:".2rem"}}>{p.precio}</div>
                <div style={{fontSize:".75rem",color:p.dark?"rgba(245,237,224,.45)":"#8a6a4a",marginBottom:"1rem"}}>⏱ {es?"Entrega en":"Delivery in"} {p.plazo}</div>
                <p style={{fontSize:".82rem",color:p.dark?"rgba(245,237,224,.6)":"#6b5240",lineHeight:1.6,marginBottom:"1.2rem"}}>{p.desc}</p>
                <ul style={{listStyle:"none",padding:0,margin:"0 0 1.5rem",display:"flex",flexDirection:"column",gap:".5rem",flex:1}}>
                  {p.items.map((it,j)=>(
                    <li key={j} style={{display:"flex",alignItems:"flex-start",gap:".5rem",fontSize:".8rem",color:p.dark?"rgba(245,237,224,.7)":"#3d2010"}}>
                      <span style={{color:p.color,flexShrink:0,marginTop:".05rem"}}>✓</span>{it}
                    </li>
                  ))}
                </ul>
                <button onClick={()=>p.stripe?window.open(p.stripe,"_blank"):go("contacto")}
                  style={{background:p.highlight?"#c06a22":p.dark?"rgba(138,77,181,.25)":"transparent",color:p.highlight?"white":p.color,border:`1.5px solid ${p.color}`,borderRadius:7,padding:".7rem",fontFamily:"'Jost',sans-serif",fontWeight:700,fontSize:".82rem",cursor:"pointer",transition:"all .2s",letterSpacing:".04em"}}>
                  {p.stripe?(es?"💳 Pagar ahora →":"💳 Pay now →"):(es?"Consultar gratis →":"Inquire free →")}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUÉ INCLUYE */}
      <section className="sec" style={{background:"#0f0a06",padding:"4rem 2rem"}}>
        <div className="sb3">
          <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2rem",color:"#f5ede0"}}>{es?"¿Qué verificamos en el terreno?":"What we verify on the land"}</h3>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"1rem"}}>
            {(es?[["🔍","Dominio registral","Titular del lote, historial de cesiones y propietarios anteriores.","#e8a84c"],["⚖️","Gravámenes","Hipotecas, embargos e inhibiciones sobre la tierra. Clave antes de comprar.","#4285f4"],["📑","Estado catastral","Mensura del campo, superficie real registrada, parcela rural y subdivisión.","#2d6a3f"],["🏛️","Gestiones","Trámites ante el Registro de la Propiedad y Catastro para regularizar la tierra.","#c06a22"]]:[["🔍","Registry title","Owner, ownership history, prior assignments.","#e8a84c"],["⚖️","Encumbrances","Mortgages, liens, encumbrances and restrictions.","#4285f4"],["📑","Cadastral status","Survey, actual area, parcel and subdivision.","#2d6a3f"],["🏛️","Procedures","Registry, Cadastre and official agency procedures.","#c06a22"]]).map(([ic,ti,de,col],i)=>(
              <div key={i} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(192,106,34,.18)",borderRadius:10,padding:"1.4rem"}}>
                <div style={{fontSize:"1.6rem",marginBottom:".6rem"}}>{ic}</div>
                <h4 style={{color:col,fontSize:".88rem",fontWeight:700,marginBottom:".35rem"}}>{ti}</h4>
                <p style={{color:"rgba(245,237,224,.55)",fontSize:".8rem",lineHeight:1.7,margin:0}}>{de}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec" style={{background:"#faf6f0"}}>
        <div className="sb3" style={{maxWidth:700,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:"2rem"}}>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2rem",color:"#0f0a06"}}>FAQ</h3>
          </div>
          {(es?[["¿Qué es la averiguación de dominio?","Es una consulta al Registro de la Propiedad para verificar quién es el titular legal del terreno o fracción y si tiene hipotecas, embargos u otras restricciones que puedan afectar la compra."],["¿Por qué es importante antes de comprar?","En terrenos rurales es fundamental: garantiza que quien vende es el titular real, que la tierra no tiene deudas ni restricciones, y que la cesión de derechos es válida y segura."],["¿Cuánto demora?","Una consulta básica sobre el titular y gravámenes se obtiene en 24-48 horas. El informe completo con catastro y análisis documental tarda entre 3 y 5 días hábiles."],["¿Asesoran a compradores del exterior?","Sí. Trabajamos con compradores argentinos en el exterior y extranjeros que quieren invertir en tierras de Argentina. Todo se gestiona de forma 100% remota."]]:
          [["What is a title search?","A query to the Property Registry to find the registered owner of the land fraction and whether it has mortgages, liens or restrictions that could affect the purchase."],["Why is it important before buying?","For rural land it's essential: it confirms the seller is the real titleholder, the land has no debts or restrictions, and the rights assignment is valid and safe."],["How long does it take?","A basic title and lien search takes 24-48 business hours. The full report with cadastral and document analysis takes 3-5 business days."],["Do you assist international buyers?","Yes. We work with Argentine buyers abroad and foreigners looking to invest in Argentine land. Everything is handled 100% remotely."]]).map(([q,a],i)=>(
            <div className="faq-i" key={i}>
              <div className="faq-q" onClick={()=>setFaq(faq===i?null:i)}><span>{q}</span><span>{faq===i?"▲":"▼"}</span></div>
              {faq===i&&<div className="faq-a">{a}</div>}
            </div>
          ))}
          <div style={{textAlign:"center",marginTop:"2.5rem"}}>
            <button className="bp" onClick={()=>go("contacto")}>{es?"¿Más dudas? Escribinos":"More questions? Contact us"}</button>
          </div>
        </div>
      </section>
    </div>}

    {page==="desarrollo"&&<div style={{paddingTop:64}}>
      <div className="sh2"><div className="stag stag-l">{es?"Proyectos inmobiliarios":"Real estate projects"}</div>
      <h2 className="stit stit-l">{t.desTitle} <em>{t.desTitleEm}</em></h2>
      <p className="sdesc sdesc-l">{es?"Desarrollamos barrios privados, countries y proyectos ecológicos en el interior de Argentina.":"We develop private neighborhoods, gated communities and eco-village projects in Argentina."}</p></div>
      <section className="sec sc"><div className="sb3">
        <div className="ig" style={{gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))"}}>
          {(es?[["🏘️","Barrios Privados","Loteos privados con servicios, calles internas, seguridad y reglamento de convivencia."],["🌿","Barrios Ecológicos","Proyectos sustentables con bajo impacto ambiental y convivencia comunitaria."],["🏗️","Loteos Rurales","Subdivisión y loteo de grandes extensiones para comercialización en fracciones."],["♻️","Desarrollo Sostenible","Planificación con energías renovables y gestión de residuos."],["📐","Proyecto y Diseño","Master plan, planos, reglamento interno y estrategia de venta."],["🤝","Alianzas","Buscamos inversores y desarrolladores para proyectos conjuntos."]]:
          [["🏘️","Private Neighborhoods","Private subdivisions with services, roads, security and community rules."],["🌿","Eco-Villages","Sustainable projects with low environmental impact and community living."],["🏗️","Rural Subdivisions","Subdivision of large areas for fractional commercialization."],["♻️","Sustainable Dev.","Planning with renewable energy and waste management."],["📐","Project & Design","Master plan, blueprints, internal regulations and sales strategy."],["🤝","Partnerships","We seek investors and developers for joint projects."]]).map(([ic,ti,de],i)=>(
            <div className="ic2" key={i}><div style={{fontSize:"2rem",marginBottom:"0.6rem"}}>{ic}</div><h4>{ti}</h4><p>{de}</p></div>
          ))}
        </div>
        <div style={{background:"#0f0a06",borderRadius:"12px",padding:"2.5rem",textAlign:"center",marginTop:"2rem"}}>
          <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2rem",color:"#f5ede0",marginBottom:"1rem"}}>{es?"¿Tenés un terreno grande y querés desarrollarlo?":"Do you have a large parcel to develop?"}</h3>
          <p style={{color:"rgba(245,237,224,0.6)",maxWidth:500,margin:"0 auto 1.5rem",lineHeight:1.8,fontSize:"0.9rem"}}>{es?"Aportás la tierra, nosotros el proyecto, marketing y comercialización. Consulta sin compromiso.":"You provide the land, we bring the project, marketing and sales. No commitment required."}</p>
          <button className="bp" onClick={()=>go("contacto")}>{es?"Hablar con nosotros":"Talk to us"}</button>
        </div>
      </div></section>
    </div>}

    {page==="contacto"&&<div style={{paddingTop:64}}>
      <section className="sec sd">
        <div className="ctg">
          <div className="cti">
            <div className="stag stag-l">{es?"Escribinos":"Get in touch"}</div>
            <h2>{t.contactTitle} <em style={{color:"#e8a84c"}}>{t.contactTitleEm}</em></h2>
            <p>{es?"Respondemos consultas sobre fracciones, cesión, documentación, desarrollo y servicios.":"We respond to inquiries about fractions, assignment, documentation, development and services."}</p>
            <div className="cdat"><span className="ic">📱</span> +54 9 362 555-1234</div>
            <div className="cdat"><span className="ic">✉️</span> dominioar@contacto.com</div>
            <div className="cdat"><span className="ic">📍</span> {es?"Argentina · Interior del país":"Argentina · Interior"}</div>
            <div className="cdat"><span className="ic">🌍</span> {es?"Compradores internacionales bienvenidos":"International buyers welcome"}</div>
            <div className="cdat"><span className="ic">🕐</span> Lun–Vie 8:00–18:00 hs (GMT-3)</div>
            <div style={{marginTop:"1.4rem"}}><Wa phone={WA} msg={es?"Hola! Quisiera consultar sobre fracciones en condominio disponibles.":"Hello! I'd like to inquire about available land condominium fractions."}/></div>
          </div>
          <div>
            <form className="fc" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(192,106,34,0.3)"}} onSubmit={e=>sub(e,"Consulta")}>
              <h3 style={{color:"#f5ede0"}}>{es?"Envianos tu consulta":"Send us your inquiry"}</h3>
              {[{lb:es?"Nombre completo":"Full name",k:"nombre",tp:"text",ph:es?"Tu nombre":"Your name"},{lb:"Email",k:"email",tp:"email",ph:"tu@email.com"},{lb:es?"Teléfono / WhatsApp":"Phone / WhatsApp",k:"tel",tp:"tel",ph:"+54 9 ..."}].map(f=>(
                <div className="fg" key={f.k}><label className="lb lb-l">{f.lb}</label><input className="fi fi-dk" type={f.tp} placeholder={f.ph} value={cf[f.k]} onChange={e=>setCf({...cf,[f.k]:e.target.value})}/></div>
              ))}
              <div className="fg"><label className="lb lb-l">{es?"Motivo de consulta":"Inquiry type"}</label>
                <select className="fse fse-dk" value={cf.prop} onChange={e=>setCf({...cf,prop:e.target.value})}>
                  <option value="">{es?"— Seleccioná —":"— Select —"}</option>
                  {data.map(p=><option key={p.id} value={p.codigo}>{p.codigo} · {p.nombre}</option>)}
                  <option value="general">{es?"Consulta general":"General inquiry"}</option>
                  <option value="ofrecer">{es?"Quiero ofrecer mi terreno":"I want to list my land"}</option>
                  <option value="desarrollo">{es?"Proyecto de desarrollo":"Development project"}</option>
                  <option value="valoracion">{es?"Valoración de terreno":"Land valuation"}</option>
                </select>
              </div>
              <div className="fg"><label className="lb lb-l">{es?"Tu mensaje":"Your message"}</label><textarea className="fta fta-dk" placeholder={es?"Contanos qué necesitás...":"Tell us what you need..."} value={cf.msg} onChange={e=>setCf({...cf,msg:e.target.value})}/></div>
              <button type="submit" className="bsub">{es?"Enviar consulta":"Send inquiry"}</button>
            </form>
          </div>
        </div>
      </section>
    </div>}

    {page==="terminos"&&<div style={{paddingTop:64}}>
      <div className="lb2">
        <h1>{t.termTitle}</h1>
        <p className="ld">{es?"Última actualización: mayo de 2025 · República Argentina":"Last updated: May 2025 · Argentine Republic"}</p>
        {es?<>
          <h2>1. Objeto del Sitio</h2><p>Dominio AR es una plataforma de intermediación inmobiliaria que ofrece información sobre fracciones de terrenos en condominio. No somos parte en operaciones de compraventa; actuamos como intermediarios.</p>
          <h2>2. Marco Legal Aplicable</h2><div className="lrb"><p>Operamos bajo el Código Civil y Comercial de la Nación (Ley 26.994), la Ley 24.240 de Defensa del Consumidor, y la Ley 25.326 de Protección de Datos Personales.</p></div>
          <h2>3. Naturaleza de los Condominios</h2><p>Las fracciones corresponden a derechos de condominio sobre inmuebles escriturados, regulados por los Arts. 1983-1996 del CCCN. La cesión es firmada por el titular registral. El comprador se convierte en condómino y puede usar, vender o ceder su parte (Art. 1989 CCCN).</p>
          <h2>4. Responsabilidad</h2><p>Dominio AR no garantiza la ausencia de vicios ocultos o problemas no declarados por los titulares. Recomendamos realizar una averiguación de dominio previa a cualquier operación. No somos responsables por decisiones de inversión de los usuarios.</p>
          <h2>5. Precios</h2><p>Los precios están expresados en dólares estadounidenses (USD) y son orientativos. Pueden variar según negociación y condiciones de cierre.</p>
          <h2>6. Jurisdicción</h2><p>Las partes se someten a los Tribunales Ordinarios de la Ciudad de Buenos Aires, renunciando a cualquier otro fuero.</p>
        </>:<>
          <h2>1. Purpose</h2><p>Dominio AR is a real estate intermediation platform providing information on land condominium fractions. We are not a party to transactions; we act as intermediaries.</p>
          <h2>2. Legal Framework</h2><div className="lrb"><p>We operate under the Argentine Civil and Commercial Code (Law 26.994), Consumer Protection Law 24.240, and Personal Data Protection Law 25.326.</p></div>
          <h2>3. Nature of Condominiums</h2><p>Fractions correspond to condominium rights over titled properties, regulated by Arts. 1983-1996 of the Civil Code. The assignment is signed by the registered owner. The buyer becomes a co-owner and can use, sell or transfer their share (Art. 1989).</p>
          <h2>4. Liability</h2><p>Dominio AR does not guarantee the absence of hidden defects. We recommend a title search before any transaction. We are not responsible for users' investment decisions.</p>
          <h2>5. Prices</h2><p>Prices are in US dollars (USD) and are indicative. They may vary based on negotiation and closing conditions.</p>
          <h2>6. Jurisdiction</h2><p>Parties submit to the Ordinary Courts of Buenos Aires, waiving any other jurisdiction.</p>
        </>}
      </div>
    </div>}

    {page==="privacidad"&&<div style={{paddingTop:64}}>
      <div className="lb2">
        <h1>{t.privTitle}</h1>
        <p className="ld">{es?"Última actualización: mayo de 2025 · Ley 25.326 de Protección de Datos Personales":"Last updated: May 2025 · Argentine Personal Data Protection Law 25.326"}</p>
        {es?<>
          <h2>1. Responsable del Tratamiento</h2><p>Dominio AR es responsable de la base de datos recolectada a través de este sitio. Contacto: dominioar@contacto.com</p>
          <h2>2. Datos que Recolectamos</h2><ul><li>Nombre y apellido</li><li>Correo electrónico</li><li>Teléfono / WhatsApp</li><li>Datos del inmueble o fracción de interés</li><li>Consultas enviadas por formulario</li></ul>
          <h2>3. Finalidad</h2><p>Los datos se usan para: responder consultas, gestionar el proceso de cesión, y enviar información sobre propiedades (con previo consentimiento).</p>
          <div className="lrb"><p>De conformidad con el Art. 5 de la Ley 25.326, el titular presta consentimiento libre, expreso e informado al completar cualquier formulario de este sitio.</p></div>
          <h2>4. Derechos del Titular</h2><p>Podés acceder, rectificar y solicitar la supresión de tus datos en cualquier momento contactando a dominioar@contacto.com (Arts. 14-16, Ley 25.326).</p>
          <h2>5. Seguridad</h2><p>Adoptamos medidas técnicas y organizativas para garantizar la confidencialidad de los datos (Art. 9, Ley 25.326).</p>
          <h2>6. Autoridad de Control</h2><p>Agencia de Acceso a la Información Pública (AAIP) · www.argentina.gob.ar/aaip</p>
        </>:<>
          <h2>1. Data Controller</h2><p>Dominio AR is responsible for the data collected through this site. Contact: dominioar@contacto.com</p>
          <h2>2. Data We Collect</h2><ul><li>Full name</li><li>Email address</li><li>Phone / WhatsApp</li><li>Property or fraction details</li><li>Messages sent through forms</li></ul>
          <h2>3. Purpose</h2><p>Data is used to: respond to inquiries, manage the assignment process, and send property information (with prior consent).</p>
          <h2>4. User Rights</h2><p>You can access, rectify and request deletion of your data at any time by contacting dominioar@contacto.com</p>
          <h2>5. Security</h2><p>We adopt technical and organizational measures to ensure data confidentiality, in accordance with Argentine Law 25.326.</p>
          <h2>6. Control Authority</h2><p>Argentina's Information Access Agency (AAIP) · www.argentina.gob.ar/aaip</p>
        </>}
      </div>
    </div>}

    {page==="admin"&&(!user?.isAdmin?<div style={{paddingTop:64,minHeight:"100vh",background:"#f5ede0",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"white",borderRadius:"12px",padding:"2.5rem",maxWidth:"400px",width:"100%",boxShadow:"0 8px 32px rgba(0,0,0,0.12)",border:"1px solid rgba(192,106,34,0.2)",textAlign:"center"}}>
        <div style={{fontSize:"2.5rem",marginBottom:"1rem"}}>🔐</div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.8rem",color:"#0f0a06",marginBottom:"0.5rem"}}>Acceso Restringido</h2>
        <p style={{color:"#8a6a4a",fontSize:"0.88rem",lineHeight:1.7,marginBottom:"1.5rem"}}>Este panel es exclusivo para administradores.<br/>Iniciá sesión con la cuenta de admin.</p>
        <button className="bp" style={{width:"100%"}} onClick={()=>setShowAuth(true)}>Iniciar sesión</button>
        <button className="bg" style={{width:"100%",marginTop:"0.8rem",color:"#0f0a06",borderColor:"rgba(192,106,34,0.3)"}} onClick={()=>go("inicio")}>Volver al inicio</button>
      </div>
    </div>
    :<div className="aw">
      <div className="ai">
        <div className="ahd">
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2rem",color:"#0f0a06"}}>Panel de Administración</h2>
          <button className="bp" onClick={()=>{setForm(EF);setEid(null);setSf(true);}}>+ Cargar fracción</button>
        </div>
        {sf&&<div className="fc" style={{marginBottom:"2rem"}}>
          <h3>{eid?"Editar fracción":"Nueva fracción en condominio"}</h3>
          <div className="fr">
            <div className="fg"><label className="lb lb-d">Código</label><input className="fi fi-l" placeholder="COND-004" value={form.codigo} onChange={e=>setForm({...form,codigo:e.target.value})}/></div>
            <div className="fg"><label className="lb lb-d">Emoji</label><input className="fi fi-l" placeholder="🌿" value={form.emoji} onChange={e=>setForm({...form,emoji:e.target.value})}/></div>
          </div>
          <div className="fg"><label className="lb lb-d">Nombre *</label><input className="fi fi-l" placeholder="Fracción Norte..." value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/></div>
          <div className="fg"><label className="lb lb-d">Ubicación</label><input className="fi fi-l" placeholder="Ruta X km Y — Provincia" value={form.ubicacion} onChange={e=>setForm({...form,ubicacion:e.target.value})}/></div>
          <div className="fr">
            <div className="fg"><label className="lb lb-d">Zona</label><input className="fi fi-l" placeholder="NEA, NOA..." value={form.zona} onChange={e=>setForm({...form,zona:e.target.value})}/></div>
            <div className="fg"><label className="lb lb-d">Superficie</label><input className="fi fi-l" placeholder="1 Ha / 5.000 m²" value={form.superficie} onChange={e=>setForm({...form,superficie:e.target.value})}/></div>
          </div>
          <div className="fr">
            <div className="fg"><label className="lb lb-d">Precio *</label><input className="fi fi-l" placeholder="USD 9.500" value={form.precio} onChange={e=>setForm({...form,precio:e.target.value})}/></div>
            <div className="fg"><label className="lb lb-d">Disponibilidad</label>
              <select className="fse fse-l" value={form.disponibilidad} onChange={e=>setForm({...form,disponibilidad:e.target.value})}>
                <option>Disponible</option><option>Reservado</option><option>Vendido</option>
              </select>
            </div>
          </div>
          <div className="fg"><label className="lb lb-d">Estado legal</label><input className="fi fi-l" value={form.estadoLegal} onChange={e=>setForm({...form,estadoLegal:e.target.value})}/></div>
          <div className="fg"><label className="lb lb-d">Coordenadas GPS</label><input className="fi fi-l" placeholder="-27.12, -63.56" value={form.coordenadas} onChange={e=>setForm({...form,coordenadas:e.target.value})}/></div>
          <div className="fr">
            <div className="fg"><label className="lb lb-d">Contacto</label><input className="fi fi-l" placeholder="Nombre" value={form.contacto} onChange={e=>setForm({...form,contacto:e.target.value})}/></div>
            <div className="fg"><label className="lb lb-d">Teléfono WhatsApp</label><input className="fi fi-l" placeholder="+54 9 ..." value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})}/></div>
          </div>
          <div className="fg"><label className="lb lb-d">Observaciones</label><textarea className="fta fta-l" placeholder="Descripción, accesos, servicios..." value={form.observaciones} onChange={e=>setForm({...form,observaciones:e.target.value})}/></div>
          <MediaUpload media={form.media||[]} onChange={m=>setForm({...form,media:m})} carpeta="fracciones"/>
          <div style={{display:"flex",gap:"1rem",marginTop:"0.5rem"}}>
            <button className="bp" onClick={save}>{eid?"Actualizar":"Guardar fracción"}</button>
            <button className="bg" style={{color:"#0f0a06",borderColor:"rgba(192,106,34,0.25)"}} onClick={()=>{setSf(false);setEid(null);setForm(EF);}}>Cancelar</button>
          </div>
        </div>}
        <div style={{background:"white",borderRadius:"10px",overflow:"hidden",border:"1px solid rgba(192,106,34,0.2)"}}>
          <table className="at">
            <thead><tr><th>Código</th><th>Nombre</th><th>Zona</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>{data.map(p=>(
              <tr key={p.id}>
                <td><strong>{p.codigo}</strong></td><td>{p.nombre}</td>
                <td style={{color:"#8a6a4a",fontSize:"0.78rem"}}>{p.zona}</td>
                <td style={{color:"#c06a22",fontWeight:600}}>{p.precio}</td>
                <td><span className={`cb-badge ${p.disponibilidad==="Disponible"?"bd-disp":p.disponibilidad==="Reservado"?"bd-res":"bd-vend"}`} style={{position:"static"}}>{p.disponibilidad}</span></td>
                <td><div className="aa">
                  <button className="bsm be" onClick={()=>{setForm({...p});setEid(p.id);setSf(true);window.scrollTo(0,0);}}>✏️ Editar</button>
                  <button className="bsm bde" onClick={async()=>{if(window.confirm("¿Eliminar?")){try{await deleteDoc(doc(db,"fracciones",p.id));setData(d=>d.filter(x=>x.id!==p.id));toast.show("🗑️ Eliminado");}catch(e){toast.show("❌ Error al eliminar.");}}}}>🗑️</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>)}

    {sel&&<div className="ov" onClick={e=>e.target===e.currentTarget&&setSel(null)}>
      <div className="mo">
        <div className="mh"><div><div className="mc">{sel.codigo}</div><h2>{sel.nombre}</h2></div><button className="mx" onClick={()=>setSel(null)}>✕</button></div>
        {sel.media&&sel.media.length>0
          ?<div style={{position:"relative",background:"#0f0a06",width:"100%"}}>
            <div style={{display:"flex",overflowX:"auto",scrollSnapType:"x mandatory",scrollBehavior:"smooth"}} id="modal-gallery">
              {sel.media.map((m,i)=>(
                m.tipo==="video"
                  ?<video key={i} src={m.url} controls style={{minWidth:"100%",maxWidth:"100%",maxHeight:"70vh",objectFit:"contain",scrollSnapAlign:"start",background:"#000"}}/>
                  :<img key={i} src={m.url} alt="" style={{minWidth:"100%",maxWidth:"100%",maxHeight:"70vh",objectFit:"contain",scrollSnapAlign:"start",display:"block"}}/>
              ))}
            </div>
            <Bdg s={sel.disponibilidad}/>
            {sel.media.length>1&&<div style={{position:"absolute",bottom:"0.6rem",left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,0.6)",color:"white",padding:"0.2rem 0.7rem",borderRadius:"1rem",fontSize:"0.72rem",pointerEvents:"none"}}>{sel.media.length} fotos · deslizá →</div>}
          </div>
          :<div className="mi" style={{background:"linear-gradient(135deg,#c8d4b8,#a0b888)"}}><span style={{fontSize:"5rem"}}>{sel.emoji||"🌿"}</span><Bdg s={sel.disponibilidad}/></div>
        }
        <div className="mb">
          <div className="mg">
            {[["Ubicación",sel.ubicacion],["Zona",sel.zona],["Superficie",sel.superficie],["Precio",sel.precio],["Estado legal",sel.estadoLegal],["GPS",sel.coordenadas||"—"],["Contacto",sel.contacto],["Teléfono",sel.telefono]].map(([l,v],i)=>(
              <div key={i}><div className="fl">{l}</div><div className="fv">{v||"—"}</div></div>
            ))}
          </div>
          {sel.observaciones&&<div className="mob"><div className="fl" style={{marginBottom:"0.3rem"}}>Observaciones</div><p>{sel.observaciones}</p></div>}
          <div className="ma">
            <Wa full phone={sel.telefono||WA} msg={`Hola! Me interesa la fracción ${sel.codigo} — ${sel.nombre}. ¿Me podés dar más información?`}/>
            <button className="bd" style={{flex:1}} onClick={()=>{setSel(null);go("contacto");}}>Consulta formal →</button>
          </div>
        </div>
      </div>
    </div>}

    {page!=="admin"&&<footer className="foot">
      <div className="fg2">
        <p>© 2025 <strong>Dominio AR</strong> · {t.footer}</p>
        <div className="fls">
          <button className="flink" onClick={()=>go("terminos")}>{t.termTitle}</button>
          <button className="flink" onClick={()=>go("privacidad")}>{t.privTitle}</button>
          <button className="flink" onClick={()=>go("contacto")}>{t.navContacto}</button>
        </div>
      </div>
    </footer>}

    {showAuth&&<AuthModal onClose={()=>setShowAuth(false)} onLogin={handleLogin} lang={lang}/>}
    <button className="waf" title="WhatsApp" onClick={()=>window.open(`https://wa.me/${WA}?text=${encodeURIComponent(es?"Hola! Me interesan las fracciones en condominio disponibles.":"Hello! I'm interested in your land condominium fractions.")}`, "_blank")}>💬</button>
    <div className={`toast${toast.m?" show":""}`}>{toast.m}</div>
  </>);
}
