const express = require('express');
const app = express();
const PORT = 3000;

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const iniciales = (n) => n.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('');

const fmtUptime = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return (h ? h + 'h ' : '') + (m ? m + 'm ' : '') + x + 's';
};

const estilos = `
:root{
  --bg:#070b1a; --ink:#eaf0ff; --muted:#9aa8d0; --accent:#6ee7f9; --accent2:#a78bfa;
  --cell:48px;
}
*{box-sizing:border-box;margin:0}
html,body{min-height:100%}
body{
  font-family:'Space Grotesk',system-ui,-apple-system,'Segoe UI',sans-serif;
  color:var(--ink); background:var(--bg); overflow-x:hidden; padding:48px 20px 64px;
}
/* Fondo cuadriculado que se desplaza */
.grid{
  position:fixed; inset:0; z-index:-3;
  background-image:
    linear-gradient(rgba(110,231,249,.10) 1px, transparent 1px),
    linear-gradient(90deg, rgba(110,231,249,.10) 1px, transparent 1px);
  background-size:var(--cell) var(--cell);
  animation:deriva 12s linear infinite;
  mask-image:radial-gradient(ellipse at 50% 40%, #000 30%, transparent 85%);
  -webkit-mask-image:radial-gradient(ellipse at 50% 40%, #000 30%, transparent 85%);
}
@keyframes deriva{to{background-position:var(--cell) var(--cell)}}
/* Celdas que se encienden */
.celdas{position:fixed; inset:0; z-index:-2; overflow:hidden; pointer-events:none}
.celda{
  position:absolute; width:var(--cell); height:var(--cell);
  background:linear-gradient(135deg, rgba(110,231,249,.28), rgba(167,139,250,.22));
  box-shadow:0 0 24px rgba(110,231,249,.35);
  opacity:0; animation:enciende 3.2s ease-in-out forwards;
}
@keyframes enciende{0%,100%{opacity:0}35%,55%{opacity:1}}
/* Manchas de color detrás del cristal */
.orbe{position:fixed; z-index:-4; border-radius:50%; filter:blur(90px); opacity:.55}
.o1{width:380px;height:380px;background:#4f46e5;top:-80px;left:-80px;animation:flota 14s ease-in-out infinite alternate}
.o2{width:340px;height:340px;background:#06b6d4;bottom:-60px;right:-40px;animation:flota 17s ease-in-out infinite alternate-reverse}
@keyframes flota{to{transform:translate(60px,40px)}}

/* Liquid glass */
.glass{
  position:relative; border-radius:28px;
  background:linear-gradient(135deg, rgba(255,255,255,.14), rgba(255,255,255,.04));
  backdrop-filter:blur(22px) saturate(180%);
  -webkit-backdrop-filter:blur(22px) saturate(180%);
  border:1px solid rgba(255,255,255,.18);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.45),
    inset 0 -1px 0 rgba(255,255,255,.06),
    inset 0 0 24px rgba(255,255,255,.05),
    0 20px 50px rgba(0,0,0,.35);
  overflow:hidden;
}
.glass::before{ /* brillo especular */
  content:""; position:absolute; inset:0; pointer-events:none;
  background:radial-gradient(120% 60% at 20% -10%, rgba(255,255,255,.28), transparent 55%);
}
.glass::after{ /* destello que cruza */
  content:""; position:absolute; top:0; left:-60%; width:40%; height:100%; pointer-events:none;
  background:linear-gradient(100deg, transparent, rgba(255,255,255,.16), transparent);
  transform:skewX(-18deg); animation:destello 7s ease-in-out infinite;
}
@keyframes destello{0%,60%{left:-60%}100%{left:130%}}

main{max-width:1000px; margin:0 auto; display:grid; gap:24px}
header.glass{padding:32px 36px}
h1{font-size:clamp(1.7rem,4vw,2.6rem); font-weight:700; letter-spacing:-.02em}
.sub{color:var(--muted); margin-top:8px; max-width:60ch; line-height:1.5}
.estado{display:inline-flex; align-items:center; gap:10px; margin-top:20px; padding:8px 16px; border-radius:999px;
  background:rgba(52,211,153,.12); border:1px solid rgba(52,211,153,.35); font-size:.9rem}
.punto{width:9px;height:9px;border-radius:50%;background:#34d399;box-shadow:0 0 0 0 rgba(52,211,153,.7);animation:pulso 2s infinite}
@keyframes pulso{70%{box-shadow:0 0 0 10px rgba(52,211,153,0)}100%{box-shadow:0 0 0 0 rgba(52,211,153,0)}}

.mensaje{padding:22px 28px; border-left:4px solid var(--accent)}
.mensaje b{font-size:1.1rem}
.mensaje small{display:block; color:var(--muted); margin-top:6px}

h2{font-size:1.15rem; font-weight:600; margin:8px 4px 0}
.metricas{display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:16px}
.metrica{padding:20px 22px; border-radius:22px}
.metrica span{display:block; color:var(--muted); font-size:.82rem}
.metrica strong{display:block; margin-top:6px; font-size:1.35rem; font-variant-numeric:tabular-nums; word-break:break-word}

.tarjetas{display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:24px}
.tarjeta{padding:28px; transition:transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s}
.tarjeta:hover{transform:translateY(-6px) rotate(-.4deg)}
.tarjeta .cab{display:flex; gap:16px; align-items:center; margin-bottom:22px}
.avatar{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;font-weight:700;font-size:1.2rem;
  background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#08112b;
  box-shadow:inset 0 2px 4px rgba(255,255,255,.6), 0 6px 18px rgba(110,231,249,.35)}
.cab h3{font-size:1.15rem; line-height:1.2}
.cab p{color:var(--muted); font-size:.9rem; margin-top:3px}
dl{display:grid; gap:12px}
.fila{display:flex; justify-content:space-between; gap:12px; padding-top:12px; border-top:1px solid rgba(255,255,255,.12)}
dt{color:var(--muted); font-size:.85rem}
dd{font-weight:500; text-align:right; word-break:break-all; font-variant-numeric:tabular-nums}
dd a{color:inherit; text-decoration:none; border-bottom:1px dashed rgba(255,255,255,.4)}
footer{text-align:center; color:var(--muted); font-size:.85rem}
.error{padding:32px}
.error h1{font-size:1.6rem}
.error p{margin-top:10px; color:var(--muted)}
:focus-visible{outline:2px solid var(--accent); outline-offset:3px}
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation:none!important; transition:none!important}
}
`;

const script = `
(function(){
  var cont=document.querySelector('.celdas');
  var s=48;
  function crea(){
    var c=document.createElement('div'); c.className='celda';
    var cols=Math.ceil(window.innerWidth/s), filas=Math.ceil(window.innerHeight/s);
    c.style.left=(Math.floor(Math.random()*cols)*s)+'px';
    c.style.top=(Math.floor(Math.random()*filas)*s)+'px';
    cont.appendChild(c);
    setTimeout(function(){c.remove()},3300);
  }
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    for(var i=0;i<5;i++) crea();
    setInterval(crea,450);
  }
  // Reloj en vivo
  var el=document.getElementById('reloj');
  if(el){setInterval(function(){el.textContent=new Date().toLocaleTimeString('es-CO')},1000)}
})();
`;

const pagina = (cuerpo) => `<!DOCTYPE html>
<html lang="es"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Microservicio Frontend</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
<style>${estilos}</style>
</head><body>
<div class="orbe o1"></div><div class="orbe o2"></div>
<div class="grid"></div><div class="celdas"></div>
${cuerpo}
<script>${script}</script>
</body></html>`;

app.get('/', async (req, res) => {
  try {
    const t0 = Date.now();
    // Docker nos permite usar el nombre del servicio como DNS interno
    const respuesta = await fetch('http://mi-pepe:5000/api/datos');
    const datos = await respuesta.json();
    const latencia = Date.now() - t0;
    const sys = datos.sistema || {};
    const personas = datos.personas || [];

    const metricas = [
      ['Latencia Front → Back', latencia + ' ms'],
      ['Código HTTP', respuesta.status],
      ['Hostname del backend', sys.hostname],
      ['Versión de Node', sys.node],
      ['Plataforma', sys.plataforma],
      ['CPUs disponibles', sys.cpus],
      ['Memoria (RSS)', sys.memoria_mb != null ? sys.memoria_mb + ' MB' : '-'],
      ['Tiempo activo', sys.uptime_segundos != null ? fmtUptime(sys.uptime_segundos) : '-'],
      ['Hora del backend', sys.hora_servidor ? new Date(sys.hora_servidor).toLocaleString('es-CO') : '-'],
      ['Hora actual', '<span id="reloj">' + new Date().toLocaleTimeString('es-CO') + '</span>', true]
    ].map(([k, v, raw]) => `
      <div class="metrica glass"><span>${esc(k)}</span><strong>${raw ? v : esc(v)}</strong></div>`).join('');

    const tarjetas = personas.map((p) => `
      <article class="tarjeta glass">
        <div class="cab">
          <div class="avatar">${esc(iniciales(p.nombre))}</div>
          <div><h3>${esc(p.nombre)}</h3><p>${esc(p.rol)}</p></div>
        </div>
        <dl>
          <div class="fila"><dt>Móvil</dt><dd><a href="tel:${esc(p.movil.replace(/\s/g, ''))}">${esc(p.movil)}</a></dd></div>
          <div class="fila"><dt>Correo</dt><dd><a href="mailto:${esc(p.correo)}">${esc(p.correo)}</a></dd></div>
          <div class="fila"><dt>Cédula</dt><dd>${esc(p.cedula)}</dd></div>
        </dl>
      </article>`).join('');

    res.send(pagina(`
<main>
  <header class="glass">
    <h1>Microservicio Frontend activo</h1>
    <p class="sub">Consultamos al servicio de Backend de forma aislada dentro de la red de Docker y esto es lo que respondió.</p>
    <div class="estado"><span class="punto"></span>Backend conectado</div>
  </header>

  <section class="mensaje glass">
    <b>${esc(datos.mensaje)}</b>
    <small>Origen: ${esc(datos.servidor)}</small>
  </section>

  <h2>Estado del sistema</h2>
  <section class="metricas">${metricas}</section>

  <h2>Equipo</h2>
  <section class="tarjetas">${tarjetas}</section>

  <footer>Frontend :${PORT} · Backend :5000</footer>
</main>`));
  } catch (error) {
    res.status(502).send(pagina(`
<main><section class="error glass">
  <h1>Error al conectar con el Backend</h1>
  <p>${esc(error.message)}</p>
</section></main>`));
  }
});

app.listen(PORT, () => console.log(`Frontend corriendo en puerto ${PORT}`));