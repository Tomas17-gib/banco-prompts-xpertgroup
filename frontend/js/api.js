// Única capa que habla con el servidor. El resto del frontend nunca usa fetch directo.
const URL_BASE = '/api/prompts';

// Error propio que guarda el código HTTP y los errores por campo
export class ErrorApi extends Error {
    constructor(mensaje, status, errores = []) {
        super(mensaje);
        this.status = status;
        this.errores = errores;
    }
}

async function peticion(url, opciones = {}) {
    let respuesta;
    try {
        respuesta = await fetch(url, {
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            ...opciones
        });
    } catch {
        // fetch solo falla aquí cuando no hay conexión con el servidor
        throw new ErrorApi('No hay conexión con el servidor. ¿Está encendido?', 0);
    }

    let cuerpo = null;
    try {
        cuerpo = await respuesta.json();
    } catch {
        // la respuesta no era JSON
    }

    if (!respuesta.ok || !cuerpo || cuerpo.ok === false) {
        const mensaje = cuerpo?.mensaje || `Error inesperado (${respuesta.status})`;
        throw new ErrorApi(mensaje, respuesta.status, cuerpo?.errores || []);
    }

    return cuerpo;
}

export async function listarPrompts() {
    const cuerpo = await peticion(URL_BASE);
    return cuerpo.data;
}

export async function crearPrompt(datos) {
    const cuerpo = await peticion(URL_BASE, { method: 'POST', body: JSON.stringify(datos) });
    return cuerpo.data;
}

export async function actualizarPrompt(id, datos) {
    const cuerpo = await peticion(`${URL_BASE}/${id}`, { method: 'PUT', body: JSON.stringify(datos) });
    return cuerpo.data;
}

export async function eliminarPrompt(id) {
    await peticion(`${URL_BASE}/${id}`, { method: 'DELETE' });
}