const router = require('express').Router();
const ctrl = require('../controllers/users.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin'), ctrl.getUsers);
router.get('/:id', authenticate, authorize('admin'), ctrl.getUser);
router.post('/', authenticate, authorize('admin'), ctrl.createUser);
router.put('/:id', authenticate, authorize('admin'), ctrl.updateUser);
router.delete('/:id', authenticate, authorize('admin'), ctrl.deleteUser);

module.exports = router;
