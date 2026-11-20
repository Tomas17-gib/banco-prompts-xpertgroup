// Punto de entrada: guarda el estado y conecta los eventos de la página.
import { listarPrompts } from './api.js';
import {
    renderizarLista, mostrarEstado, mostrarToast, copiarAlPortapapeles,
    normalizar, badgesHtml, escaparHtml, formatearFecha
} from './ui.js';

// ---------- Estado ----------
const estado = {
    prompts: [],     // todos los prompts traídos del servidor
    categoria: '',   // '' = todas
    busqueda: ''
};

// ---------- Referencias al DOM ----------
const lista = document.getElementById('listaPrompts');
const buscador = document.getElementById('buscador');
const filtros = document.getElementById('filtros');
const resumen = document.getElementById('resumen');
const modalDetalle = new bootstrap.Modal('#modalDetalle');
let promptEnDetalle = null;

function buscarPorId(id) {
    for (const prompt of estado.prompts) {
        if (prompt.id === id) return prompt;
    }
    return null;
}

function coincideBusqueda(prompt, termino) {
    if (!termino) return true;
    const texto = normalizar(`${prompt.titulo} ${prompt.descripcion} ${prompt.texto_prompt} ${prompt.herramienta_ia}`);
    return texto.includes(termino);
}

// ---------- Filtrado + pintado ----------
function actualizarVista() {
    const termino = normalizar(estado.busqueda.trim());
    const contadores = { '': 0, 'Código': 0, 'Testing': 0, 'SQL': 0, 'Documentación': 0 };
    const visibles = [];

    for (const prompt of estado.prompts) {
        if (!coincideBusqueda(prompt, termino)) continue;

        contadores['']++;
        contadores[prompt.categoria]++;

        if (estado.categoria === '' || prompt.categoria === estado.categoria) {
            visibles.push(prompt);
        }
    }

    for (const badge of document.querySelectorAll('[data-contador]')) {
        badge.textContent = contadores[badge.dataset.contador] ?? 0;
    }

    resumen.textContent = `Mostrando ${visibles.length} de ${estado.prompts.length} prompts`;

    if (estado.prompts.length === 0) {
        mostrarEstado('vacio', 'Aún no hay prompts. ¡Crea el primero con el botón "Nuevo prompt"!');
    } else if (visibles.length === 0) {
        mostrarEstado('vacio', 'No hay prompts que coincidan con la búsqueda o el filtro.');
    } else {
        renderizarLista(lista, visibles, estado.busqueda);
        mostrarEstado('lista');
    }
}

// ---------- Carga inicial ----------
async function cargarPrompts() {
    mostrarEstado('cargando');
    try {
        estado.prompts = await listarPrompts();
        actualizarVista();
    } catch (error) {
        mostrarEstado('error', error.message);
    }
}

// ---------- Acciones ----------
async function copiarPrompt(prompt, boton) {
    try {
        await copiarAlPortapapeles(prompt.texto_prompt);
        mostrarToast(`Prompt "${prompt.titulo}" copiado al portapapeles`);

        if (boton) {
            const original = boton.innerHTML;
            boton.innerHTML = '<i class="bi bi-check2"></i> Copiado';
            boton.disabled = true;
            setTimeout(() => { boton.innerHTML = original; boton.disabled = false; }, 1500);
        }
    } catch {
        mostrarToast('No se pudo copiar. Selecciona el texto y copia manualmente.', 'danger');
    }
}

function verDetalle(prompt) {
    promptEnDetalle = prompt;
    document.getElementById('detalleTitulo').textContent = prompt.titulo;
    document.getElementById('detalleBadges').innerHTML = badgesHtml(prompt);
    document.getElementById('detalleDescripcion').textContent = prompt.descripcion;
    document.getElementById('detalleTexto').textContent = prompt.texto_prompt;
    document.getElementById('detalleFechas').innerHTML =
        `Creado: ${escaparHtml(formatearFecha(prompt.creado_en))} · Actualizado: ${escaparHtml(formatearFecha(prompt.actualizado_en))}`;
    modalDetalle.show();
}

// ---------- Eventos ----------
// Búsqueda en tiempo real: se ejecuta con cada tecla
buscador.addEventListener('input', () => {
    estado.busqueda = buscador.value;
    actualizarVista();
});

// Filtros por categoría
filtros.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-categoria]');
    if (!boton) return;

    for (const b of filtros.querySelectorAll('[data-categoria]')) {
        b.classList.remove('active');
    }
    boton.classList.add('active');
    estado.categoria = boton.dataset.categoria;
    actualizarVista();
});

// Delegación de eventos: un solo listener para los botones de todas las tarjetas
lista.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-accion]');
    if (!boton) return;

    const id = Number(boton.closest('[data-id]').dataset.id);
    const prompt = buscarPorId(id);
    if (!prompt) return;

    const accion = boton.dataset.accion;
    if (accion === 'copiar') copiarPrompt(prompt, boton);
    if (accion === 'ver') verDetalle(prompt);
});

document.getElementById('btnCopiarDetalle').addEventListener('click', (evento) => {
    if (promptEnDetalle) copiarPrompt(promptEnDetalle, evento.currentTarget);
});

document.getElementById('btnReintentar').addEventListener('click', cargarPrompts);

// ---------- Inicio ----------
cargarPrompts();