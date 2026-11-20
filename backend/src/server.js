require('dotenv').config(); // siempre de primero, para que las demás partes vean las variables

const path = require('path');
const express = require('express');
const { probarConexion } = require('./config/db');
const { rutaNoEncontrada, manejadorErrores } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares globales ---
app.use(express.json({ limit: '100kb' })); // convierte el cuerpo JSON de la petición en req.body

// El mismo servidor entrega el frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

// --- Rutas de la API ---
app.get('/api/salud', (req, res) => {
    res.json({ ok: true, mensaje: 'API del Banco de Prompts funcionando' });
});

// --- Manejo de errores ---
app.use('/api', rutaNoEncontrada);
app.use(manejadorErrores);

// --- Arranque ---
async function iniciar() {
    try {
        await probarConexion();
        console.log('Conectado a la base de datos');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error.message);
        process.exit(1); // sin base de datos la app no sirve, mejor no arrancar
    }

    app.listen(PORT, () => {
        console.log(`Servidor listo en http://localhost:${PORT}`);
    });
}

iniciar();