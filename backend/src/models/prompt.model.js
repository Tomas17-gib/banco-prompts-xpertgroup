const { pool } = require('../config/db');

const COLUMNAS = 'id, titulo, categoria, herramienta_ia, descripcion, texto_prompt, creado_en, actualizado_en';

async function obtenerTodos() {
    const [filas] = await pool.query(
        `SELECT ${COLUMNAS} FROM prompts ORDER BY actualizado_en DESC, id DESC`
    );
    return filas;
}

async function obtenerPorId(id) {
    const [filas] = await pool.query(`SELECT ${COLUMNAS} FROM prompts WHERE id = ?`, [id]);
    return filas[0] || null;
}

async function crear({ titulo, categoria, herramienta_ia, descripcion, texto_prompt }) {
    const [resultado] = await pool.query(
        `INSERT INTO prompts (titulo, categoria, herramienta_ia, descripcion, texto_prompt)
        VALUES (?, ?, ?, ?, ?)`,
        [titulo, categoria, herramienta_ia, descripcion, texto_prompt]
    );
    return obtenerPorId(resultado.insertId);
}

module.exports = { obtenerTodos, obtenerPorId, crear };