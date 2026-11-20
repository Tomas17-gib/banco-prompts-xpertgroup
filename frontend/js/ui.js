// Funciones de presentación: construyen HTML y muestran mensajes. No guardan estado.

const CLASES_CATEGORIA = {
    'Código': 'cat-codigo',
    'Testing': 'cat-testing',
    'SQL': 'cat-sql',
    'Documentación': 'cat-documentacion'
};

const ICONOS_CATEGORIA = {
    'Código': 'bi-code-slash',
    'Testing': 'bi-bug',
    'SQL': 'bi-database',
    'Documentación': 'bi-file-earmark-text'
};

// Evita inyección de HTML (XSS): todo texto del usuario pasa por aquí
export function escaparHtml(texto) {
    const mapa = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(texto ?? '').replace(/[&<>"']/g, (c) => mapa[c]);
}

// Minúsculas y sin tildes, letra por letra ("Código" -> "codigo")
export function normalizar(texto) {
    let resultado = '';
    for (const letra of String(texto ?? '')) {
        const base = letra.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        resultado += (base.length === 1 ? base : letra).toLowerCase();
    }
    return resultado;
}

// Escapa el texto y envuelve en <mark> cada coincidencia de la búsqueda
export function resaltar(texto, busqueda) {
    const original = String(texto ?? '');
    const termino = normalizar(busqueda.trim());
    if (!termino) return escaparHtml(original);

    const textoNormal = normalizar(original);
    let html = '';
    let desde = 0;
    let pos = textoNormal.indexOf(termino, desde);

    while (pos !== -1) {
        html += escaparHtml(original.slice(desde, pos));
        html += `<mark>${escaparHtml(original.slice(pos, pos + termino.length))}</mark>`;
        desde = pos + termino.length;
        pos = textoNormal.indexOf(termino, desde);
    }
    html += escaparHtml(original.slice(desde));
    return html;
}

export function formatearFecha(valor) {
    return new Date(valor).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

export function badgesHtml(prompt) {
    const clase = CLASES_CATEGORIA[prompt.categoria] || '';
    const icono = ICONOS_CATEGORIA[prompt.categoria] || 'bi-tag';
    return `
        <span class="badge badge-categoria ${clase}"><i class="bi ${icono}"></i> ${escaparHtml(prompt.categoria)}</span>
        <span class="badge badge-herramienta"><i class="bi bi-robot"></i> ${escaparHtml(prompt.herramienta_ia)}</span>`;
}

function tarjetaHtml(prompt, busqueda) {
    const clase = CLASES_CATEGORIA[prompt.categoria] || '';
    return `
    <div class="col-md-6 col-lg-4">
        <article class="card card-prompt h-100 ${clase}" data-id="${prompt.id}">
            <div class="card-body d-flex flex-column">
                <div class="d-flex flex-wrap gap-2 mb-2">${badgesHtml(prompt)}</div>
                <h3 class="card-title h6 fw-bold mb-1">${resaltar(prompt.titulo, busqueda)}</h3>
                <p class="descripcion small text-muted mb-3">${resaltar(prompt.descripcion, busqueda)}</p>
                <pre class="prompt-texto prompt-preview mb-3">${resaltar(prompt.texto_prompt, busqueda)}</pre>

                <div class="mt-auto d-flex gap-2">
                    <button type="button" class="btn btn-xg btn-sm flex-grow-1" data-accion="copiar">
                        <i class="bi bi-clipboard"></i> Copiar
                    </button>
                    <button type="button" class="btn btn-outline-primary btn-sm" data-accion="ver" title="Ver completo" aria-label="Ver completo">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button type="button" class="btn btn-outline-primary btn-sm" data-accion="editar" title="Editar" aria-label="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-sm" data-accion="eliminar" title="Eliminar" aria-label="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </article>
    </div>`;
}

export function renderizarLista(contenedor, prompts, busqueda) {
    let html = '';
    for (const prompt of prompts) {
        html += tarjetaHtml(prompt, busqueda);
    }
    contenedor.innerHTML = html;
}

// Muestra solo uno de los estados: 'cargando' | 'error' | 'vacio' | 'lista'
export function mostrarEstado(estado, mensaje = '') {
    document.getElementById('estadoCargando').classList.toggle('d-none', estado !== 'cargando');
    document.getElementById('estadoError').classList.toggle('d-none', estado !== 'error');
    document.getElementById('estadoVacio').classList.toggle('d-none', estado !== 'vacio');
    document.getElementById('listaPrompts').classList.toggle('d-none', estado !== 'lista');

    if (estado === 'error') document.getElementById('estadoErrorTexto').textContent = mensaje;
    if (estado === 'vacio') document.getElementById('estadoVacioTexto').textContent = mensaje;
}

// Notificación flotante. tipo: 'success' | 'danger' | 'warning' | 'info'
export function mostrarToast(mensaje, tipo = 'success') {
    const iconos = { success: 'bi-check-circle-fill', danger: 'bi-x-circle-fill', warning: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill' };
    const elemento = document.createElement('div');
    elemento.className = `toast align-items-center text-bg-${tipo} border-0`;
    elemento.setAttribute('role', 'alert');
    elemento.innerHTML = `
    <div class="d-flex">
        <div class="toast-body"><i class="bi ${iconos[tipo]} me-1"></i> ${escaparHtml(mensaje)}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
    </div>`;

    document.getElementById('contenedorToasts').appendChild(elemento);
    const toast = new bootstrap.Toast(elemento, { delay: 3000 });
    elemento.addEventListener('hidden.bs.toast', () => elemento.remove());
    toast.show();
}

// Copia al portapapeles, con respaldo para navegadores sin Clipboard API
export async function copiarAlPortapapeles(texto) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(texto);
        return;
    }
    const area = document.createElement('textarea');
    area.value = texto;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const exito = document.execCommand('copy');
    area.remove();
    if (!exito) throw new Error('No se pudo copiar');
}