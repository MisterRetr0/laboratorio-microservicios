const express = require('express');
const os = require('os');
const app = express();
const PORT = 5000;

app.get('/api/datos', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    mensaje: "¡Datos enviados con éxito desde el Microservicio de Backend!",
    servidor: "Contenedor NodeJS - API",
    sistema: {
      hostname: os.hostname(),
      node: process.version,
      plataforma: `${os.platform()} ${os.arch()}`,
      uptime_segundos: Math.round(process.uptime()),
      memoria_mb: Math.round(mem.rss / 1024 / 1024),
      cpus: os.cpus().length,
      hora_servidor: new Date().toISOString()
    },
    // Datos de ejemplo (ficticios): reemplázalos por los reales
    personas: [
      {
        nombre: "Tomás Romero Eusse",
        rol: "Jedi Master",
        movil: "+57 314 6931544",
        correo: "tomas.romero@cafeteccion.com",
        cedula: "1.004.779.477"
      },
      {
        nombre: "Camilo Jiménez Loaiza",
        rol: "Jedi Master",
        movil: "+57 320 6169040",
        correo: "camilo.jimenez@cafeteccion.com",
        cedula: "1.089.599.635"
      }
    ]
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend corriendo en puerto ${PORT}`);
});