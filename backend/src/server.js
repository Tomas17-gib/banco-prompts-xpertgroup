require('dotenv').config();

const path = require('path');
const express = require('express');
const { probarConexion } = require('./config/db');
const promptsRoutes = require('./routes/prompts.routes');
const { rutaNoEncontrada, manejadorErrores } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares globales ---
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

// --- Rutas de la API ---
app.get('/api/salud', (req, res) => {
    res.json({ ok: true, mensaje: 'API del Banco de Prompts funcionando' });
});
app.use('/api/prompts', promptsRoutes);   // ← debe ir AQUÍ, antes de los errores

// --- Manejo de errores (siempre al final) ---
app.use('/api', rutaNoEncontrada);
app.use(manejadorErrores);

// --- Arranque ---
async function iniciar() {
    try {
        await probarConexion();
        console.log('✔ Conectado a la base de datos');
    } catch (error) {
        console.error('X No se pudo conectar a la base de datos:', error.message);
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`✔ Servidor listo en http://localhost:${PORT}`);
    });
}

iniciar();