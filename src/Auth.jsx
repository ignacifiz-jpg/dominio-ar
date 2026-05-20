import { useState, useEffect } from "react";
import { 
  auth, googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "./firebase.js";

const ADMIN_EMAIL = "ignacifiz@gmail.com";

export const authCss = `
  .auth-overlay{position:fixed;inset:0;z-index:300;background:rgba(15,10,6,0.88);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:1.5rem;}
  .auth-box{background:white;border-radius:16px;max-width:440px;width:100%;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,0.35);}
  .auth-hdr{background:linear-gradient(135deg,#0f0a06,#3d2010);padding:2rem 2rem 1.5rem;text-align:center;}
  .auth-hdr h2{font-family:'Cormorant Garamond',serif;font-size:1.9rem;color:#f5ede0;margin-bottom:0.3rem;}
  .auth-hdr p{color:rgba(245,237,224,0.6);font-size:0.85rem;}
  .auth-body{padding:1.8rem;}
  .auth-tabs{display:flex;margin-bottom:1.5rem;border:1px solid rgba(192,106,34,0.25);border-radius:8px;overflow:hidden;}
  .auth-tab{flex:1;padding:0.6rem;text-align:center;cursor:pointer;font-family:'Jost',sans-serif;font-size:0.8rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;border:none;transition:all 0.2s;}
  .auth-tab.active{background:#c06a22;color:white;}
  .auth-tab:not(.active){background:transparent;color:#8a6a4a;}
  .google-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:0.8rem;padding:0.75rem;border:1.5px solid #e0e0e0;border-radius:8px;background:white;cursor:pointer;font-family:'Jost',sans-serif;font-size:0.88rem;font-weight:600;color:#3c4043;transition:all 0.2s;margin-bottom:1rem;}
  .google-btn:hover{background:#f8f9fa;border-color:#c06a22;}
  .google-btn:disabled{opacity:0.6;cursor:not-allowed;}
  .divider{display:flex;align-items:center;gap:1rem;margin:1rem 0;color:#8a6a4a;font-size:0.75rem;}
  .divider::before,.divider::after{content:'';flex:1;height:1px;background:rgba(192,106,34,0.2);}
  .consent-box{background:#faf6f0;border:1px solid rgba(192,106,34,0.25);border-radius:8px;padding:1rem;margin:0.8rem 0;}
  .consent-row{display:flex;align-items:flex-start;gap:0.7rem;cursor:pointer;}
  .consent-row input[type=checkbox]{margin-top:0.15rem;accent-color:#c06a22;width:16px;height:16px;flex-shrink:0;}
  .consent-text{font-size:0.82rem;color:#3d2010;line-height:1.6;}
  .consent-text strong{color:#c06a22;}
  .auth-err{background:#fdf2f2;border:1px solid #f5c2c7;color:#842029;padding:0.6rem 0.9rem;border-radius:6px;font-size:0.82rem;margin-bottom:0.8rem;}
  .auth-ok{background:#d1eddf;border:1px solid #a3cfbb;color:#0f5132;padding:0.6rem 0.9rem;border-radius:6px;font-size:0.82rem;margin-bottom:0.8rem;}
  .user-menu{position:relative;display:inline-block;}
  .user-btn{display:flex;align-items:center;gap:0.5rem;background:rgba(255,255,255,0.08);border:1px solid rgba(232,168,76,0.35);color:#e8a84c;padding:0.3rem 0.8rem;border-radius:2rem;cursor:pointer;font-family:'Jost',sans-serif;font-size:0.75rem;font-weight:600;transition:all 0.2s;white-space:nowrap;}
  .user-btn:hover{background:rgba(232,168,76,0.12);}
  .user-avatar{width:24px;height:24px;border-radius:50%;background:#c06a22;display:flex;align-items:center;justify-content:center;color:white;font-size:0.7rem;font-weight:700;flex-shrink:0;overflow:hidden;}
  .user-avatar img{width:100%;height:100%;object-fit:cover;}
  .user-dropdown{position:absolute;right:0;top:calc(100% + 0.5rem);background:white;border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,0.18);border:1px solid rgba(192,106,34,0.2);min-width:210px;overflow:hidden;z-index:200;}
  .ud-item{padding:0.7rem 1rem;font-size:0.82rem;color:#0f0a06;cursor:pointer;display:flex;align-items:center;gap:0.6rem;transition:background 0.15s;}
  .ud-item:hover{background:#faf6f0;}
  .ud-sep{height:1px;background:rgba(192,106,34,0.15);}
  .ud-admin{color:#c06a22;font-weight:600;}
  .loading-spinner{display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-radius:50%;border-top-color:white;animation:spin 0.8s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg);}}
`;

export function AuthModal({ onClose, onLogin, lang }) {
  const es = lang === "es";
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setLoading(true); setErr("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;
      const isAdmin = u.email === ADMIN_EMAIL;
      const userData = { 
        email: u.email, 
        name: u.displayName || u.email.split("@")[0], 
        photo: u.photoURL,
        isAdmin, 
        consent: false,
        uid: u.uid
      };
      localStorage.setItem("dominioar_user", JSON.stringify(userData));
      onLogin(userData); onClose();
    } catch (e) {
      setErr(es ? "Error al iniciar con Google. Intentá de nuevo." : "Google sign-in error. Please try again.");
    }
    setLoading(false);
  }

  async function handleLogin(e) {
    e.preventDefault(); setLoading(true); setErr("");
    try {
      const result = await signInWithEmailAndPassword(auth, email, pw);
      const u = result.user;
      const isAdmin = u.email === ADMIN_EMAIL;
      const userData = { email: u.email, name: u.displayName || u.email.split("@")[0], photo: null, isAdmin, consent: false, uid: u.uid };
      localStorage.setItem("dominioar_user", JSON.stringify(userData));
      onLogin(userData); onClose();
    } catch (e) {
      setErr(es ? "Email o contraseña incorrectos." : "Incorrect email or password.");
    }
    setLoading(false);
  }

  async function handleRegister(e) {
    e.preventDefault(); setLoading(true); setErr("");
    if (pw.length < 6) { setErr(es ? "La contraseña debe tener al menos 6 caracteres." : "Password must be at least 6 characters."); setLoading(false); return; }
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pw);
      const u = result.user;
      if (name) await updateProfile(u, { displayName: name });
      const userData = { email: u.email, name: name || u.email.split("@")[0], photo: null, isAdmin: false, consent, uid: u.uid };
      localStorage.setItem("dominioar_user", JSON.stringify(userData));
      if (consent) {
        const subs = JSON.parse(localStorage.getItem("dominioar_subs") || "[]");
        if (!subs.find(s => s.email === email)) { subs.push({ email, nombre: name, fecha: new Date().toLocaleDateString("es-AR") }); localStorage.setItem("dominioar_subs", JSON.stringify(subs)); }
      }
      onLogin(userData);
      setOk(es ? "¡Cuenta creada con éxito! Bienvenido/a." : "Account created successfully! Welcome.");
      setTimeout(() => onClose(), 1500);
    } catch (e) {
      if (e.code === "auth/email-already-in-use") setErr(es ? "Este email ya está registrado." : "This email is already registered.");
      else setErr(es ? "Error al crear la cuenta. Verificá los datos." : "Error creating account. Please check your details.");
    }
    setLoading(false);
  }

  return (
    <div className="auth-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="auth-box">
        <div className="auth-hdr">
          <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>🏡</div>
          <h2>Dominio AR</h2>
          <p>{es ? "Tu plataforma de tierras en condominio" : "Your land condominium platform"}</p>
        </div>
        <div className="auth-body">
          <div className="auth-tabs">
            <button className={`auth-tab${tab==="login"?" active":""}`} onClick={()=>{setTab("login");setErr("");}}>
              {es?"Iniciar sesión":"Log in"}
            </button>
            <button className={`auth-tab${tab==="register"?" active":""}`} onClick={()=>{setTab("register");setErr("");}}>
              {es?"Registrarse":"Sign up"}
            </button>
          </div>

          <button className="google-btn" onClick={handleGoogle} disabled={loading}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? <span className="loading-spinner"/> : (es ? "Continuar con Google" : "Continue with Google")}
          </button>

          <div className="divider">{es?"o con tu email":"or with your email"}</div>

          {err && <div className="auth-err">⚠️ {err}</div>}
          {ok && <div className="auth-ok">✅ {ok}</div>}

          {tab==="login" ? (
            <form onSubmit={handleLogin}>
              <div className="fg"><label className="lb lb-d">Email</label>
                <input className="fi fi-l" type="email" placeholder="tu@email.com" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
              <div className="fg"><label className="lb lb-d">{es?"Contraseña":"Password"}</label>
                <input className="fi fi-l" type="password" placeholder="••••••••" value={pw} onChange={e=>setPw(e.target.value)} required/></div>
              <button type="submit" className="bsub" disabled={loading}>
                {loading ? <span className="loading-spinner"/> : (es?"Iniciar sesión":"Log in")}
              </button>
              <p style={{textAlign:"center",marginTop:"1rem",fontSize:"0.8rem",color:"#8a6a4a"}}>
                {es?"¿No tenés cuenta?":"No account?"}{" "}
                <span style={{color:"#c06a22",cursor:"pointer",fontWeight:600}} onClick={()=>setTab("register")}>
                  {es?"Registrate":"Sign up"}
                </span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="fg"><label className="lb lb-d">{es?"Nombre":"Name"}</label>
                <input className="fi fi-l" placeholder={es?"Tu nombre (opcional)":"Your name (optional)"} value={name} onChange={e=>setName(e.target.value)}/></div>
              <div className="fg"><label className="lb lb-d">Email *</label>
                <input className="fi fi-l" type="email" placeholder="tu@email.com" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
              <div className="fg"><label className="lb lb-d">{es?"Contraseña *":"Password *"}</label>
                <input className="fi fi-l" type="password" placeholder={es?"Mínimo 6 caracteres":"Min. 6 characters"} value={pw} onChange={e=>setPw(e.target.value)} required/></div>
              <div className="consent-box">
                <label className="consent-row">
                  <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>
                  <span className="consent-text">
                    <strong>{es?"✅ Quiero recibir alertas":"✅ I want to receive alerts"}</strong><br/>
                    {es?"Acepto recibir notificaciones sobre nuevas fracciones disponibles, ofertas de tierras y novedades del mercado.":"I agree to receive notifications about new available fractions, land offers and market updates."}
                  </span>
                </label>
              </div>
              <p style={{fontSize:"0.75rem",color:"#8a6a4a",marginBottom:"0.8rem",lineHeight:1.5}}>
                {es?"Al registrarte aceptás nuestros Términos de uso y Política de privacidad (Ley 25.326).":"By signing up you accept our Terms of use and Privacy policy (Law 25.326)."}
              </p>
              <button type="submit" className="bsub" disabled={loading}>
                {loading ? <span className="loading-spinner"/> : (es?"Crear cuenta":"Create account")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function UserNavBtn({ user, onOpenAuth, onLogout, onAdmin, lang }) {
  const es = lang === "es";
  const [open, setOpen] = useState(false);

  async function logout() {
    await signOut(auth);
    localStorage.removeItem("dominioar_user");
    onLogout(); setOpen(false);
  }

  if (!user) return (
    <button className="nl-lang" style={{background:"rgba(192,106,34,0.15)",borderColor:"rgba(192,106,34,0.5)",color:"#e8a84c"}} onClick={onOpenAuth}>
      👤 {es?"Registrarse":"Sign up"}
    </button>
  );

  return (
    <div className="user-menu">
      <button className="user-btn" onClick={()=>setOpen(o=>!o)}>
        <div className="user-avatar">
          {user.photo ? <img src={user.photo} alt=""/> : (user.name||user.email)[0].toUpperCase()}
        </div>
        {user.isAdmin ? "Admin" : (user.name||user.email.split("@")[0])}
        <span>{open?"▲":"▼"}</span>
      </button>
      {open && (
        <div className="user-dropdown" onClick={()=>setOpen(false)}>
          <div className="ud-item" style={{flexDirection:"column",alignItems:"flex-start",gap:0,paddingBottom:"0.5rem"}}>
            <span style={{fontWeight:600,fontSize:"0.88rem"}}>{user.name||user.email.split("@")[0]}</span>
            <span style={{color:"#8a6a4a",fontSize:"0.75rem"}}>{user.email}</span>
            {user.consent&&<span style={{color:"#2d6a3f",fontSize:"0.72rem",marginTop:"0.2rem"}}>🔔 {es?"Alertas activadas":"Alerts on"}</span>}
          </div>
          <div className="ud-sep"/>
          {user.isAdmin && <>
            <div className="ud-item ud-admin" onClick={onAdmin}>⚙️ {es?"Panel de administración":"Admin panel"}</div>
            <div className="ud-sep"/>
          </>}
          <div className="ud-item" onClick={logout}>🚪 {es?"Cerrar sesión":"Log out"}</div>
        </div>
      )}
    </div>
  );
}
