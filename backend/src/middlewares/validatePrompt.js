const CATEGORIAS = ['Código', 'Testing', 'SQL', 'Documentación'];

const REGLAS = {
    titulo:         { etiqueta: 'título',             min: 3,  max: 120 },
    categoria:      { etiqueta: 'categoría',          min: 1,  max: 20 },
    herramienta_ia: { etiqueta: 'herramienta de IA',  min: 2,  max: 60 },
    descripcion:    { etiqueta: 'descripción de uso', min: 5,  max: 500 },
    texto_prompt:   { etiqueta: 'texto del prompt',   min: 10, max: 10000 }
};

function validarPrompt(req, res, next) {
    const cuerpo = req.body || {};
    const errores = [];
    const limpio = {};

    for (const campo in REGLAS) {
        const regla = REGLAS[campo];
        const valor = typeof cuerpo[campo] === 'string' ? cuerpo[campo].trim() : '';

        if (valor === '') {
            errores.push({ campo, mensaje: `El campo "${regla.etiqueta}" es obligatorio` });
        } else if (valor.length < regla.min) {
            errores.push({ campo, mensaje: `El campo "${regla.etiqueta}" debe tener al menos ${regla.min} caracteres` });
        } else if (valor.length > regla.max) {
            errores.push({ campo, mensaje: `El campo "${regla.etiqueta}" no puede superar ${regla.max} caracteres` });
        }

        limpio[campo] = valor;
    }

    if (limpio.categoria && !CATEGORIAS.includes(limpio.categoria)) {
        errores.push({ campo: 'categoria', mensaje: `La categoría debe ser una de: ${CATEGORIAS.join(', ')}` });
    }

    if (errores.length > 0) {
        return res.status(400).json({ ok: false, mensaje: 'Datos inválidos', errores });
    }

    req.body = limpio;
    next();
}

module.exports = { validarPrompt };