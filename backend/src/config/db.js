
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    timezone: 'Z',            // las fechas de MySQL están en UTC
    waitForConnections: true,
    connectionLimit: 10
});

// Se usa al arrancar para fallar rápido si la conexión está mal configurada
async function probarConexion() {
    const conexion = await pool.getConnection();
    await conexion.ping();
    conexion.release(); // devuelve la conexión al pool
}

module.exports = { pool, probarConexion };