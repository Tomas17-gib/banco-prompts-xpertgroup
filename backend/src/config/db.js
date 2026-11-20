
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true, // si todas están ocupadas, espera en lugar de fallar
    connectionLimit: 10
});

// Se usa al arrancar para fallar rápido si la conexión está mal configurada
async function probarConexion() {
    const conexion = await pool.getConnection();
    await conexion.ping();
    conexion.release(); // devuelve la conexión al pool
}

module.exports = { pool, probarConexion };