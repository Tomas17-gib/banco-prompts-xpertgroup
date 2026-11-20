// ! Ejecuta database
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
    if (!process.env.DATABASE_URL) {
        console.error('✖ Falta la variable DATABASE_URL en el archivo backend/.env');
        process.exitCode = 1;
        return;
    }

    const rutaSql = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    const sql = fs.readFileSync(rutaSql, 'utf8');

    let conexion;
    try {
        conexion = await mysql.createConnection({
            uri: process.env.DATABASE_URL,
            multipleStatements: true // ? el archivo trae varias sentencias separadas por ;
        });
        await conexion.query(sql);
        const [filas] = await conexion.query('SELECT COUNT(*) AS total FROM prompts');
        console.log(`Base de datos lista con ${filas[0].total} prompts`);
    } catch (error) {
        console.error('Error:', error.message);
        process.exitCode = 1;
    } finally {
        if (conexion) await conexion.end(); // ! cierra la conexión 
    }
}

main();