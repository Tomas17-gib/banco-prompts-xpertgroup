// Responde cuando alguien pide una ruta de la API que no existe
function rutaNoEncontrada(req, res) {
    res.status(404).json({ ok: false, mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

// Todos los errores terminan aquí, así las respuestas siempre tienen el mismo formato
function manejadorErrores(err, req, res, next) {
  // JSON mal escrito en el cuerpo de la petición
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ ok: false, mensaje: 'El cuerpo de la petición no es un JSON válido' });
    }

  // Problemas de conexión con la base de datos
    if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR' || err.code === 'ETIMEDOUT') {
        console.error('[BD]', err.message);
        return res.status(503).json({ ok: false, mensaje: 'No se pudo conectar con la base de datos' });
    }

    console.error('[ERROR]', err);
    res.status(err.status || 500).json({
        ok: false,
        mensaje: err.status ? err.message : 'Error interno del servidor'
    });
}

module.exports = { rutaNoEncontrada, manejadorErrores };