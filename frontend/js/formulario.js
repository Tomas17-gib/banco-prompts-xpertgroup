// Modal de crear / editar con validación en el cliente.
// El servidor vuelve a validar; aquí también mostramos sus errores.
import { crearPrompt, actualizarPrompt } from './api.js';
import { mostrarToast } from './ui.js';

const CAMPOS = ['titulo', 'categoria', 'herramienta_ia', 'descripcion', 'texto_prompt'];

const form = document.getElementById('formPrompt');
const modalEl = document.getElementById('modalPrompt');
const modal = new bootstrap.Modal(modalEl);
const tituloModal = document.getElementById('modalPromptTitulo');
const inputId = document.getElementById('promptId');
const errorGeneral = document.getElementById('formErrorGeneral');
const btnGuardar = document.getElementById('btnGuardar');
const spinner = document.getElementById('spinnerGuardar');
const textoPrompt = document.getElementById('texto_prompt');
const contador = document.getElementById('contadorPrompt');

let alGuardar = () => { }; // app.js nos pasa esta función para avisarle de los cambios

function limpiarErrores() {
    form.classList.remove('was-validated');
    errorGeneral.classList.add('d-none');
    for (const campo of CAMPOS) {
        const input = form.elements[campo];
        input.classList.remove('is-invalid');
        input.setCustomValidity('');
        const feedback = input.parentElement.querySelector('.invalid-feedback');
        if (feedback) feedback.textContent = feedback.dataset.original;
    }
}

function actualizarContador() {
    contador.textContent = `${textoPrompt.value.length} / 10000`;
}

function leerFormulario() {
    const datos = {};
    for (const campo of CAMPOS) {
        datos[campo] = form.elements[campo].value.trim();
    }
    return datos;
}

// Un campo con solo espacios pasa "required", pero no es válido
function validarCliente() {
    let valido = true;
    for (const campo of CAMPOS) {
        const input = form.elements[campo];
        input.setCustomValidity(input.value.trim() === '' ? 'Campo obligatorio' : '');
        if (!input.checkValidity()) valido = false;
    }
    form.classList.add('was-validated');
    return valido;
}

// Pinta debajo de cada campo los errores que devolvió el servidor
function mostrarErroresServidor(error) {
    errorGeneral.textContent = error.message;
    errorGeneral.classList.remove('d-none');

    for (const { campo, mensaje } of error.errores) {
        const input = form.elements[campo];
        if (!input) continue;
        input.classList.add('is-invalid');
        const feedback = input.parentElement.querySelector('.invalid-feedback');
        if (feedback) feedback.textContent = mensaje;
    }
}

function cambiarCargando(cargando) {
    btnGuardar.disabled = cargando;
    spinner.classList.toggle('d-none', !cargando);
}

export function abrirParaCrear() {
    form.reset();
    limpiarErrores();
    inputId.value = '';
    tituloModal.textContent = 'Nuevo prompt';
    actualizarContador();
    modal.show();
}

export function abrirParaEditar(prompt) {
    form.reset();
    limpiarErrores();
    inputId.value = prompt.id;
    for (const campo of CAMPOS) {
        form.elements[campo].value = prompt[campo];
    }
    tituloModal.textContent = 'Editar prompt';
    actualizarContador();
    modal.show();
}

export function iniciarFormulario(callbackAlGuardar) {
    alGuardar = callbackAlGuardar;

    // Guarda el texto original de cada mensaje de error para poder restaurarlo
    for (const feedback of form.querySelectorAll('.invalid-feedback')) {
        feedback.dataset.original = feedback.textContent;
    }

    textoPrompt.addEventListener('input', actualizarContador);
    form.addEventListener('input', (evento) => evento.target.classList.remove('is-invalid'));
    modalEl.addEventListener('shown.bs.modal', () => form.elements.titulo.focus());

    form.addEventListener('submit', async (evento) => {
        evento.preventDefault(); // evita que el navegador recargue la página
        errorGeneral.classList.add('d-none');
        if (!validarCliente()) return;

        const datos = leerFormulario();
        const id = inputId.value ? Number(inputId.value) : null;

        cambiarCargando(true);
        try {
            const guardado = id ? await actualizarPrompt(id, datos) : await crearPrompt(datos);
            modal.hide();
            mostrarToast(id ? 'Prompt actualizado correctamente' : 'Prompt creado correctamente');
            alGuardar(guardado, id ? 'editado' : 'creado');
        } catch (error) {
            form.classList.remove('was-validated');
            mostrarErroresServidor(error);
        } finally {
            cambiarCargando(false);
        }
    });
}