// Confirmación y eliminación: se pide confirmar porque no se puede deshacer.
import { eliminarPrompt } from './api.js';
import { mostrarToast } from './ui.js';

const modal = new bootstrap.Modal('#modalEliminar');
const nombre = document.getElementById('eliminarNombre');
const btnConfirmar = document.getElementById('btnConfirmarEliminar');
const spinner = document.getElementById('spinnerEliminar');

let promptAEliminar = null;
let alEliminar = () => { };

export function confirmarEliminacion(prompt) {
    promptAEliminar = prompt;
    nombre.textContent = `"${prompt.titulo}"`;
    modal.show();
}

export function iniciarEliminacion(callbackAlEliminar) {
    alEliminar = callbackAlEliminar;

    btnConfirmar.addEventListener('click', async () => {
        if (!promptAEliminar) return;

        btnConfirmar.disabled = true;
        spinner.classList.remove('d-none');
        try {
            await eliminarPrompt(promptAEliminar.id);
            mostrarToast('Prompt eliminado correctamente');
            alEliminar(promptAEliminar.id);
        } catch (error) {
            if (error.status === 404) {
                // otra persona ya lo eliminó: igual lo quitamos de la vista
                mostrarToast('Ese prompt ya no existía', 'warning');
                alEliminar(promptAEliminar.id);
            } else {
                mostrarToast(error.message, 'danger');
            }
        } finally {
            btnConfirmar.disabled = false;
            spinner.classList.add('d-none');
            promptAEliminar = null;
            modal.hide();
        }
    });
}