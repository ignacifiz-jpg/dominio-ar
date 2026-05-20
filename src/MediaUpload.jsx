import { useState, useRef } from "react";
import { storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "./firebase.js";

export const mediaCss = `
  .media-section { margin-bottom: 1.2rem; }
  .media-label { display:block;font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:0.6rem;font-weight:600;color:#c06a22; }
  .media-drop { border:2px dashed rgba(192,106,34,0.35);border-radius:8px;padding:1.5rem;text-align:center;cursor:pointer;transition:all 0.2s;background:#faf6f0; }
  .media-drop:hover,.media-drop.drag { border-color:#c06a22;background:rgba(192,106,34,0.06); }
  .media-drop p { color:#8a6a4a;font-size:0.85rem;margin-top:0.4rem; }
  .media-drop .icon { font-size:2rem; }
  .media-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:0.6rem;margin-top:0.8rem; }
  .media-thumb { position:relative;border-radius:6px;overflow:hidden;aspect-ratio:1;background:#e8e0d5; }
  .media-thumb img { width:100%;height:100%;object-fit:cover; }
  .media-thumb video { width:100%;height:100%;object-fit:cover; }
  .media-thumb .del-btn { position:absolute;top:4px;right:4px;background:rgba(220,53,69,0.9);color:white;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;font-size:0.7rem;display:flex;align-items:center;justify-content:center; }
  .media-thumb .vid-badge { position:absolute;bottom:4px;left:4px;background:rgba(0,0,0,0.6);color:white;border-radius:4px;font-size:0.6rem;padding:0.1rem 0.3rem; }
  .progress-bar { height:4px;background:rgba(192,106,34,0.2);border-radius:2px;margin-top:0.6rem;overflow:hidden; }
  .progress-fill { height:100%;background:#c06a22;transition:width 0.3s; }
  .upload-status { font-size:0.78rem;color:#8a6a4a;margin-top:0.4rem; }
`;

export function MediaUpload({ media = [], onChange, carpeta = "fracciones" }) {
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState([]);
  const inputRef = useRef();

  async function handleFiles(files) {
    const allowed = Array.from(files).filter(f =>
      f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    if (!allowed.length) return;

    for (const file of allowed) {
      const id = Date.now() + Math.random();
      setUploads(u => [...u, { id, name: file.name, progress: 0 }]);

      const storageRef = ref(storage, `${carpeta}/${Date.now()}_${file.name}`);
      const task = uploadBytesResumable(storageRef, file);

      task.on("state_changed",
        snap => {
          const pct = Math.round(snap.bytesTransferred / snap.totalBytes * 100);
          setUploads(u => u.map(x => x.id === id ? { ...x, progress: pct } : x));
        },
        err => {
          console.error(err);
          setUploads(u => u.filter(x => x.id !== id));
        },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          const tipo = file.type.startsWith("video/") ? "video" : "foto";
          const path = task.snapshot.ref.fullPath;
          onChange([...media, { url, tipo, path, nombre: file.name }]);
          setUploads(u => u.filter(x => x.id !== id));
        }
      );
    }
  }

  async function handleDelete(item) {
    if (!window.confirm("¿Eliminar este archivo?")) return;
    try {
      const fileRef = ref(storage, item.path);
      await deleteObject(fileRef);
    } catch (e) { console.warn("No se pudo eliminar de Storage:", e); }
    onChange(media.filter(m => m.url !== item.url));
  }

  return (
    <div className="media-section">
      <label className="media-label">📸 Fotos y videos</label>
      <div
        className={`media-drop${dragging ? " drag" : ""}`}
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      >
        <div className="icon">📁</div>
        <strong style={{ fontSize: "0.88rem", color: "#3d2010" }}>Tocá o arrastrá archivos acá</strong>
        <p>Fotos JPG/PNG y videos MP4 — máx. 50MB por archivo</p>
        <input ref={inputRef} type="file" multiple accept="image/*,video/*"
          style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
      </div>

      {uploads.map(u => (
        <div key={u.id}>
          <div className="upload-status">⬆️ Subiendo {u.name}... {u.progress}%</div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${u.progress}%` }} /></div>
        </div>
      ))}

      {media.length > 0 && (
        <div className="media-grid">
          {media.map((item, i) => (
            <div className="media-thumb" key={i}>
              {item.tipo === "video"
                ? <video src={item.url} muted playsInline />
                : <img src={item.url} alt={item.nombre} />
              }
              <button className="del-btn" onClick={() => handleDelete(item)}>✕</button>
              {item.tipo === "video" && <span className="vid-badge">▶ Video</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
