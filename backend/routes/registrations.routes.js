const router = require('express').Router();
const ctrl = require('../controllers/registrations.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/:eventId', authenticate, ctrl.registerForEvent);
router.delete('/:eventId', authenticate, ctrl.cancelRegistration);
router.get('/my', authenticate, ctrl.getMyRegistrations);
router.get('/event/:eventId', authenticate, authorize('admin', 'faculty'), ctrl.getEventRegistrations);

module.exports = router;
