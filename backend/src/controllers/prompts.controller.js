const Prompt = require('../models/prompt.model');

function leerId(req) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        const error = new Error('El id debe ser un número entero positivo');
        error.status = 400;
        throw error;
    }
    return id;
}

// GET /api/prompts
async function listar(req, res, next) {
    try {
        const prompts = await Prompt.obtenerTodos();
        res.json({ ok: true, total: prompts.length, data: prompts });
    } catch (error) {
        next(error);
    }
}

// GET /api/prompts/:id
async function obtener(req, res, next) {
    try {
        const prompt = await Prompt.obtenerPorId(leerId(req));
        if (!prompt) {
        return res.status(404).json({ ok: false, mensaje: 'Prompt no encontrado' });
        }
        res.json({ ok: true, data: prompt });
    } catch (error) {
        next(error);
    }
}

// POST /api/prompts
async function crear(req, res, next) {
    try {
        const nuevo = await Prompt.crear(req.body);
        res.status(201).json({ ok: true, mensaje: 'Prompt creado correctamente', data: nuevo });
    } catch (error) {
        next(error);
    }
}

module.exports = { listar, obtener, crear };