const router = require('express').Router();
const ctrl = require('../controllers/resources.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, ctrl.getResources);
router.get('/:id', authenticate, ctrl.getResource);
router.post('/', authenticate, authorize('admin'), ctrl.createResource);
router.put('/:id', authenticate, authorize('admin'), ctrl.updateResource);
router.delete('/:id', authenticate, authorize('admin'), ctrl.deleteResource);

module.exports = router;
