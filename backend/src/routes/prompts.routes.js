const { Router } = require('express');
const controller = require('../controllers/prompts.controller');
const { validarPrompt } = require('../middlewares/validatePrompt');

const router = Router();

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', validarPrompt, controller.crear);
router.put('/:id', validarPrompt, controller.actualizar);
router.delete('/:id', controller.eliminar);

module.exports = router;