import { useState, useRef, useEffect } from "react";
 
const GENEROS = [
  { id: "reggaeton", label: "Reggaetón", emoji: "🔥" },
  { id: "cumbia", label: "Cumbia", emoji: "🪗" },
  { id: "salsa", label: "Salsa", emoji: "💃" },
  { id: "bachata", label: "Bachata", emoji: "🌹" },
  { id: "trap_latino", label: "Trap Latino", emoji: "💎" },
  { id: "vallenato", label: "Vallenato", emoji: "🎺" },
  { id: "merengue", label: "Merengue", emoji: "⚡" },
  { id: "pop_latino", label: "Pop Latino", emoji: "🌟" },
  { id: "corridos", label: "Corridos Tumbados", emoji: "🤠" },
  { id: "dembow", label: "Dembow", emoji: "🎵" },
  { id: "afrobeats_latino", label: "Afrobeats Latino", emoji: "🥁" },
  { id: "rock_en_espanol", label: "Rock en Español", emoji: "🎸" },
  { id: "bolero", label: "Bolero", emoji: "🌙" },
  { id: "ranchera", label: "Ranchera", emoji: "🐴" },
  { id: "latin_jazz", label: "Latin Jazz", emoji: "🎷" },
  { id: "urbano", label: "Urbano", emoji: "🏙️" },
];
 
const VIBES = [
  { id: "romantico", label: "Romántico", color: "#ff4d6d" },
  { id: "fiesta", label: "Fiesta Total", color: "#ff9f1c" },
  { id: "melancolico", label: "Melancólico", color: "#5c6bc0" },
  { id: "sensual", label: "Sensual", color: "#c2185b" },
  { id: "callejero", label: "Callejero", color: "#37474f" },
  { id: "tropical", label: "Tropical", color: "#00897b" },
  { id: "nostalgico", label: "Nostálgico", color: "#7e57c2" },
  { id: "bravucon", label: "Bravucón", color: "#e53935" },
  { id: "espiritual", label: "Espiritual", color: "#f9a825" },
  { id: "chill", label: "Chill Mode", color: "#26a69a" },
];
 
const ESTRUCTURA_TAGS = [
  "[Intro]", "[Verso 1]", "[Pre-Coro]", "[Coro]", "[Verso 2]",
  "[Puente]", "[Breakdown]", "[Hook]", "[Outro]", "[Ad-libs]",
  "[Coro Final]", "[Drop]", "[Build-up]", "[Voz femenina]", "[Voz masculina]",
];
 
const INSTRUMENTOS = [
  "Güira", "Congas", "Bajo eléctrico", "Trompeta", "Piano cubano",
  "808s", "Hi-hats", "Acordeón", "Marimba", "Sintetizador",
  "Cuatro venezolano", "Cajón peruano",
];
 
const VOCES = [
  { id: "suave", label: "Suave y melódica" },
  { id: "rasposa", label: "Rasposa / Ronca" },
  { id: "aguda", label: "Aguda y potente" },
  { id: "deep", label: "Deep / Grave" },
  { id: "rap", label: "Flow de rap" },
  { id: "coro_grupal", label: "Coro grupal" },
];
 
const TEMPO = [
  { id: "lento", label: "Lento (60-80 BPM)", bpm: 70 },
  { id: "medio", label: "Medio (90-110 BPM)", bpm: 100 },
  { id: "rapido", label: "Rápido (120-140 BPM)", bpm: 130 },
  { id: "ultrafast", label: "Ultra rápido (150+)", bpm: 160 },
];
 
function PromptTag({ label, onAdd }) {
  return (
    <button
      onClick={() => onAdd(label)}
      style={{
        background: "rgba(255,200,50,0.08)",
        border: "1px solid rgba(255,200,50,0.25)",
        borderRadius: "6px",
        color: "#ffd54f",
        padding: "4px 10px",
        fontSize: "12px",
        cursor: "pointer",
        transition: "all 0.2s",
        fontFamily: "inherit",
      }}
      onMouseOver={e => {
        e.currentTarget.style.background = "rgba(255,200,50,0.2)";
        e.currentTarget.style.borderColor = "#ffd54f";
      }}
      onMouseOut={e => {
        e.currentTarget.style.background = "rgba(255,200,50,0.08)";
        e.currentTarget.style.borderColor = "rgba(255,200,50,0.25)";
      }}
    >
      {label}
    </button>
  );
}
 
export default function SunoMaxMode() {
  const [generoSel, setGeneroSel] = useState(null);
  const [vibeSel, setVibeSel] = useState([]);
  const [instrSel, setInstrSel] = useState([]);
  const [vozSel, setVozSel] = useState(null);
  const [tempoSel, setTempoSel] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [tema, setTema] = useState("");
  const [lyricsPrompt, setLyricsPrompt] = useState("");
  const [musicPrompt, setMusicPrompt] = useState("");
  const [generando, setGenerando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [paso, setPaso] = useState(0);
  const [error, setError] = useState(null);
  const resultRef = useRef(null);
 
  const toggleVibe = (id) => {
    setVibeSel(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };
 
  const toggleInstr = (i) => {
    setInstrSel(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };
 
  const addTag = (tag) => {
    setLyricsPrompt(prev => prev + (prev.endsWith(" ") || prev === "" ? "" : "\n") + tag + " ");
  };
 
  const buildContext = () => {
    const g = GENEROS.find(x => x.id === generoSel);
    const vs = VIBES.filter(x => vibeSel.includes(x.id));
    const voz = VOCES.find(x => x.id === vozSel);
    const tempo = TEMPO.find(x => x.id === tempoSel);
    return {
      genero: g?.label || "No especificado",
      vibes: vs.map(v => v.label).join(", ") || "No especificado",
      instrumentos: instrSel.join(", ") || "No especificados",
      voz: voz?.label || "No especificada",
      tempo: tempo?.label || "No especificado",
      titulo: titulo || "Sin título",
      tema: tema || "Libre",
      lyricsPrompt: lyricsPrompt || "",
      musicPrompt: musicPrompt || "",
    };
  };
 
  const generarCancion = async () => {
    if (!generoSel) { setError("Selecciona un género primero 🎵"); return; }
    setError(null);
    setGenerando(true);
    setResultado(null);
    setPaso(1);
 
    const ctx = buildContext();
 
    const systemPrompt = `Eres un productor musical experto en música latina y un compositor profesional. 
Generas prompts ultra-detallados para Suno AI en formato MAX MODE (v4.5).
Siempre respondes SOLO en JSON válido, sin texto adicional, sin backticks.
El JSON debe tener exactamente estas claves:
{
  "titulo": "título creativo de la canción",
  "style_prompt": "prompt de estilo musical para Suno (máx 200 chars)",
  "lyrics": "letra completa con tags de estructura [Intro], [Verso 1], [Coro], etc.",
  "descripcion": "descripción breve del resultado esperado",
  "tags_suno": ["array", "de", "tags", "para", "suno"],
  "bpm_sugerido": número,
  "tono": "clave musical sugerida",
  "consejo_pro": "consejo de producción específico"
}`;
 
    const userPrompt = `Crea un prompt MAX MODE para Suno AI con estos parámetros:
- Género: ${ctx.genero}
- Vibes/Mood: ${ctx.vibes}
- Instrumentos: ${ctx.instrumentos}
- Tipo de voz: ${ctx.voz}
- Tempo: ${ctx.tempo}
- Título deseado: ${ctx.titulo}
- Tema/Historia: ${ctx.tema}
${ctx.lyricsPrompt ? `- Estructura/letra base del usuario:\n${ctx.lyricsPrompt}` : ""}
${ctx.musicPrompt ? `- Notas musicales adicionales: ${ctx.musicPrompt}` : ""}
 
Genera una canción completa con letra en español latino auténtico, con slang apropiado al género.
El style_prompt debe ser en inglés para Suno, ultra específico con instrumentos, mood y producción.
La letra debe tener mínimo 3 secciones estructurales con tags.`;
 
    try {
      setPaso(2);
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });
 
      setPaso(3);
      const data = await response.json();
      const raw = data.content.map(i => i.text || "").join("");
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResultado(parsed);
      setPaso(4);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setError("Error al generar. Intenta de nuevo. 🔁");
      console.error(err);
    } finally {
      setGenerando(false);
    }
  };
 
  const copiar = (texto) => {
    navigator.clipboard.writeText(texto);
  };
 
  const pasos = ["Preparando", "Enviando a IA", "Componiendo", "¡Listo!"];
 
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0f 0%, #12071a 50%, #07100a 100%)",
      fontFamily: "'Trebuchet MS', 'Lucida Grande', sans-serif",
      color: "#f0e6ff",
      padding: "0",
    }}>
      {/* Fondo con patrón */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "radial-gradient(circle at 20% 50%, rgba(120,40,200,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(200,60,60,0.06) 0%, transparent 40%)",
        pointerEvents: "none",
      }} />
 
      <div style={{ position: "relative", zIndex: 1, maxWidth: "860px", margin: "0 auto", padding: "24px 16px 60px" }}>
 
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #7b2ff7, #f107a3)",
            borderRadius: "12px",
            padding: "6px 18px",
            fontSize: "11px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            fontWeight: "700",
            marginBottom: "12px",
            color: "#fff",
          }}>
            ✦ MAX MODE ACTIVADO ✦
          </div>
          <h1 style={{
            fontSize: "clamp(28px, 6vw, 52px)",
            fontWeight: "900",
            margin: "0 0 8px",
            background: "linear-gradient(90deg, #ff6b35, #f7c59f, #ffdd00, #56cfe1, #ff6b35)",
            backgroundSize: "200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 4s linear infinite",
          }}>
            🎵 SUNO SONG CREATOR
          </h1>
          <p style={{ color: "#a07fd0", fontSize: "14px", margin: 0 }}>
            Genera prompts profesionales para Suno AI • Música Latina • Powered by Claude
          </p>
        </div>
 
        <style>{`
          @keyframes shimmer { 0%{background-position:0%} 100%{background-position:200%} }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
          @keyframes slideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          @keyframes spin { to{transform:rotate(360deg)} }
        `}</style>
 
        {/* SECCIÓN: Género */}
        <Section title="🎼 Género Musical" num="01">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {GENEROS.map(g => (
              <button key={g.id} onClick={() => setGeneroSel(g.id === generoSel ? null : g.id)}
                style={{
                  padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px",
                  border: generoSel === g.id ? "2px solid #ffd54f" : "2px solid rgba(255,255,255,0.1)",
                  background: generoSel === g.id ? "rgba(255,213,79,0.15)" : "rgba(255,255,255,0.04)",
                  color: generoSel === g.id ? "#ffd54f" : "#c9b8e8",
                  fontWeight: generoSel === g.id ? "700" : "400",
                  transition: "all 0.2s", fontFamily: "inherit",
                }}>
                {g.emoji} {g.label}
              </button>
            ))}
          </div>
        </Section>
 
        {/* SECCIÓN: Vibe */}
        <Section title="✨ Vibe & Mood" num="02" sub="Elige hasta 3">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {VIBES.map(v => {
              const sel = vibeSel.includes(v.id);
              return (
                <button key={v.id} onClick={() => toggleVibe(v.id)}
                  style={{
                    padding: "8px 16px", borderRadius: "20px", cursor: "pointer", fontSize: "13px",
                    border: `2px solid ${sel ? v.color : "rgba(255,255,255,0.1)"}`,
                    background: sel ? `${v.color}22` : "rgba(255,255,255,0.04)",
                    color: sel ? v.color : "#c9b8e8",
                    fontWeight: sel ? "700" : "400",
                    transition: "all 0.2s", fontFamily: "inherit",
                  }}>
                  {sel ? "✓ " : ""}{v.label}
                </button>
              );
            })}
          </div>
        </Section>
 
        {/* SECCIÓN: Tempo + Voz */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Section title="⚡ Tempo" num="03">
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {TEMPO.map(t => (
                <button key={t.id} onClick={() => setTempoSel(t.id === tempoSel ? null : t.id)}
                  style={{
                    padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px",
                    border: tempoSel === t.id ? "2px solid #56cfe1" : "2px solid rgba(255,255,255,0.1)",
                    background: tempoSel === t.id ? "rgba(86,207,225,0.12)" : "rgba(255,255,255,0.04)",
                    color: tempoSel === t.id ? "#56cfe1" : "#c9b8e8",
                    fontWeight: tempoSel === t.id ? "700" : "400",
                    transition: "all 0.2s", textAlign: "left", fontFamily: "inherit",
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </Section>
 
          <Section title="🎤 Tipo de Voz" num="04">
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {VOCES.map(v => (
                <button key={v.id} onClick={() => setVozSel(v.id === vozSel ? null : v.id)}
                  style={{
                    padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px",
                    border: vozSel === v.id ? "2px solid #ff6b9d" : "2px solid rgba(255,255,255,0.1)",
                    background: vozSel === v.id ? "rgba(255,107,157,0.12)" : "rgba(255,255,255,0.04)",
                    color: vozSel === v.id ? "#ff6b9d" : "#c9b8e8",
                    fontWeight: vozSel === v.id ? "700" : "400",
                    transition: "all 0.2s", textAlign: "left", fontFamily: "inherit",
                  }}>
                  {v.label}
                </button>
              ))}
            </div>
          </Section>
        </div>
 
        {/* SECCIÓN: Instrumentos */}
        <Section title="🎸 Instrumentos" num="05" sub="Selecciona los que quieres destacar">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {INSTRUMENTOS.map(i => {
              const sel = instrSel.includes(i);
              return (
                <button key={i} onClick={() => toggleInstr(i)}
                  style={{
                    padding: "6px 13px", borderRadius: "6px", cursor: "pointer", fontSize: "12px",
                    border: `1px solid ${sel ? "#4ade80" : "rgba(255,255,255,0.12)"}`,
                    background: sel ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.03)",
                    color: sel ? "#4ade80" : "#b0a0cc",
                    transition: "all 0.15s", fontFamily: "inherit",
                  }}>
                  {sel ? "✓ " : ""}{i}
                </button>
              );
            })}
          </div>
        </Section>
 
        {/* SECCIÓN: Título y Tema */}
        <Section title="📝 Título & Tema" num="06">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "11px", color: "#9a87bb", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Título de la canción</label>
              <input value={titulo} onChange={e => setTitulo(e.target.value)}
                placeholder="Ej: Corazón de Fuego"
                style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "#9a87bb", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Tema / Historia</label>
              <input value={tema} onChange={e => setTema(e.target.value)}
                placeholder="Ej: Amor no correspondido"
                style={inputStyle} />
            </div>
          </div>
        </Section>
 
        {/* SECCIÓN: Estructura con Tags */}
        <Section title="🏗️ Estructura de Letra" num="07" sub="Click para insertar tags de estructura">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
            {ESTRUCTURA_TAGS.map(t => (
              <PromptTag key={t} label={t} onAdd={addTag} />
            ))}
          </div>
          <textarea
            value={lyricsPrompt}
            onChange={e => setLyricsPrompt(e.target.value)}
            placeholder={"[Intro]\nAgrega aquí tu estructura o ideas para la letra...\n[Verso 1]\n...\n[Coro]\n..."}
            rows={6}
            style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6", fontFamily: "monospace", fontSize: "13px" }}
          />
        </Section>
 
        {/* SECCIÓN: Notas Musicales */}
        <Section title="🎛️ Notas de Producción" num="08" sub="Detalles adicionales para el productor IA">
          <textarea
            value={musicPrompt}
            onChange={e => setMusicPrompt(e.target.value)}
            placeholder="Ej: Quiero que suene como Bad Bunny pero con más acordeón, intro con piano solo, fade out al final..."
            rows={3}
            style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6" }}
          />
        </Section>
 
        {/* ERROR */}
        {error && (
          <div style={{
            background: "rgba(255,80,80,0.12)", border: "1px solid rgba(255,80,80,0.3)",
            borderRadius: "10px", padding: "12px 16px", color: "#ff8080",
            marginBottom: "16px", fontSize: "14px", textAlign: "center",
          }}>
            {error}
          </div>
        )}
 
        {/* BOTÓN PRINCIPAL */}
        <div style={{ textAlign: "center", margin: "28px 0" }}>
          <button onClick={generarCancion} disabled={generando}
            style={{
              background: generando
                ? "rgba(100,60,160,0.5)"
                : "linear-gradient(135deg, #7b2ff7 0%, #f107a3 50%, #ff6b35 100%)",
              border: "none", borderRadius: "14px",
              color: "#fff", fontSize: "17px", fontWeight: "900",
              padding: "18px 48px", cursor: generando ? "not-allowed" : "pointer",
              boxShadow: generando ? "none" : "0 0 40px rgba(123,47,247,0.5), 0 8px 32px rgba(0,0,0,0.4)",
              transition: "all 0.3s", letterSpacing: "1px",
              fontFamily: "inherit", textTransform: "uppercase",
              transform: generando ? "scale(0.98)" : "scale(1)",
            }}>
            {generando ? (
              <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
                {pasos[paso - 1] || "Generando..."}
              </span>
            ) : "🚀 GENERAR CON IA MAX MODE"}
          </button>
 
          {generando && (
            <div style={{ marginTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                {pasos.map((p, i) => (
                  <div key={i} style={{
                    padding: "4px 12px", borderRadius: "20px", fontSize: "11px",
                    background: paso > i ? "rgba(123,47,247,0.3)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${paso > i ? "#7b2ff7" : "rgba(255,255,255,0.1)"}`,
                    color: paso > i ? "#c4a6ff" : "#666",
                    transition: "all 0.3s",
                  }}>{paso > i ? "✓ " : ""}{p}</div>
                ))}
              </div>
            </div>
          )}
        </div>
 
        {/* RESULTADO */}
        {resultado && (
          <div ref={resultRef} style={{
            animation: "slideIn 0.5s ease",
            background: "linear-gradient(135deg, rgba(30,15,50,0.95), rgba(15,30,20,0.95))",
            border: "1px solid rgba(123,47,247,0.4)",
            borderRadius: "16px", overflow: "hidden",
            boxShadow: "0 0 60px rgba(123,47,247,0.2), 0 20px 60px rgba(0,0,0,0.5)",
          }}>
            {/* Header resultado */}
            <div style={{
              background: "linear-gradient(135deg, #7b2ff7, #f107a3)",
              padding: "16px 24px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: "11px", letterSpacing: "2px", opacity: 0.8, textTransform: "uppercase" }}>Resultado MAX MODE</div>
                <div style={{ fontSize: "20px", fontWeight: "900" }}>🎵 {resultado.titulo}</div>
              </div>
              <div style={{ textAlign: "right", fontSize: "12px", opacity: 0.85 }}>
                <div>🎹 {resultado.bpm_sugerido} BPM</div>
                <div>🎼 Tono: {resultado.tono}</div>
              </div>
            </div>
 
            <div style={{ padding: "24px" }}>
              {/* Style Prompt */}
              <ResultBlock
                title="🎛️ STYLE PROMPT para Suno"
                subtitle="Pega esto en el campo 'Style of Music' de Suno"
                content={resultado.style_prompt}
                onCopy={() => copiar(resultado.style_prompt)}
                accent="#56cfe1"
                mono
              />
 
              {/* Lyrics */}
              <ResultBlock
                title="📝 LETRA COMPLETA"
                subtitle="Pega esto en el campo 'Lyrics' de Suno"
                content={resultado.lyrics}
                onCopy={() => copiar(resultado.lyrics)}
                accent="#ffd54f"
                mono
                tall
              />
 
              {/* Tags */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "11px", color: "#9a87bb", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px" }}>
                  🏷️ Tags Sugeridos
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {resultado.tags_suno?.map((tag, i) => (
                    <span key={i} style={{
                      padding: "4px 12px", background: "rgba(74,222,128,0.1)",
                      border: "1px solid rgba(74,222,128,0.25)", borderRadius: "20px",
                      fontSize: "12px", color: "#4ade80",
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
 
              {/* Descripción */}
              {resultado.descripcion && (
                <div style={{
                  background: "rgba(255,255,255,0.04)", borderRadius: "10px",
                  padding: "14px 16px", marginBottom: "16px",
                  borderLeft: "3px solid #a78bfa",
                }}>
                  <div style={{ fontSize: "11px", color: "#9a87bb", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>🎵 Descripción</div>
                  <p style={{ margin: 0, fontSize: "14px", color: "#d4c4f0", lineHeight: "1.6" }}>{resultado.descripcion}</p>
                </div>
              )}
 
              {/* Consejo Pro */}
              {resultado.consejo_pro && (
                <div style={{
                  background: "linear-gradient(135deg, rgba(255,213,79,0.08), rgba(255,107,53,0.05))",
                  border: "1px solid rgba(255,213,79,0.2)",
                  borderRadius: "10px", padding: "14px 16px",
                }}>
                  <div style={{ fontSize: "11px", color: "#ffd54f", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>
                    💡 Consejo Pro del Productor
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", color: "#f0e6ff", lineHeight: "1.6" }}>{resultado.consejo_pro}</p>
                </div>
              )}
 
              {/* Botones de acción */}
              <div style={{ display: "flex", gap: "10px", marginTop: "20px", flexWrap: "wrap" }}>
                <button onClick={() => copiar(`${resultado.style_prompt}\n\n${resultado.lyrics}`)}
                  style={actionBtn("#7b2ff7")}>
                  📋 Copiar Todo
                </button>
                <button onClick={() => {
                  const txt = `SUNO MAX MODE - ${resultado.titulo}\n\nSTYLE: ${resultado.style_prompt}\n\nLETRA:\n${resultado.lyrics}\n\nTAGS: ${resultado.tags_suno?.join(", ")}\nBPM: ${resultado.bpm_sugerido} | TONO: ${resultado.tono}\n\nCONSEJO: ${resultado.consejo_pro}`;
                  const blob = new Blob([txt], { type: "text/plain" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `suno-${resultado.titulo?.replace(/\s+/g, "-").toLowerCase()}.txt`;
                  a.click();
                }} style={actionBtn("#f107a3")}>
                  💾 Descargar .txt
                </button>
                <button onClick={() => { setResultado(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  style={actionBtn("#37474f")}>
                  🔄 Nueva Canción
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
 
function Section({ title, num, sub, children }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "12px", padding: "20px", marginBottom: "16px",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "14px" }}>
        <span style={{
          fontSize: "10px", fontWeight: "700", color: "#7b2ff7",
          background: "rgba(123,47,247,0.15)", borderRadius: "4px",
          padding: "2px 7px", letterSpacing: "1px",
        }}>{num}</span>
        <span style={{ fontSize: "15px", fontWeight: "700", color: "#f0e6ff" }}>{title}</span>
        {sub && <span style={{ fontSize: "11px", color: "#7a6a96" }}>{sub}</span>}
      </div>
      {children}
    </div>
  );
}
 
function ResultBlock({ title, subtitle, content, onCopy, accent, mono, tall }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
        <div>
          <span style={{ fontSize: "12px", color: accent, fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase" }}>{title}</span>
          {subtitle && <span style={{ fontSize: "11px", color: "#7a6a96", marginLeft: "8px" }}>{subtitle}</span>}
        </div>
        <button onClick={handleCopy}
          style={{
            background: copied ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${copied ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.12)"}`,
            borderRadius: "6px", color: copied ? "#4ade80" : "#9a87bb",
            padding: "3px 10px", cursor: "pointer", fontSize: "11px", fontFamily: "inherit", transition: "all 0.2s",
          }}>
          {copied ? "✓ Copiado" : "📋 Copiar"}
        </button>
      </div>
      <pre style={{
        background: "rgba(0,0,0,0.35)",
        border: `1px solid ${accent}33`,
        borderRadius: "8px", padding: "14px",
        fontSize: mono ? "12px" : "14px",
        fontFamily: mono ? "monospace" : "inherit",
        color: "#e8deff", margin: 0,
        whiteSpace: "pre-wrap", wordBreak: "break-word",
        maxHeight: tall ? "300px" : "120px",
        overflowY: "auto", lineHeight: "1.6",
      }}>
        {content}
      </pre>
    </div>
  );
}
 
const inputStyle = {
  width: "100%", background: "rgba(0,0,0,0.3)",
  border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px",
  color: "#f0e6ff", padding: "10px 14px", fontSize: "14px",
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
};
 
const actionBtn = (color) => ({
  background: `${color}22`, border: `1px solid ${color}55`,
  borderRadius: "8px", color: "#f0e6ff", padding: "10px 18px",
  cursor: "pointer", fontSize: "13px", fontFamily: "inherit",
  transition: "all 0.2s", fontWeight: "600",
});
