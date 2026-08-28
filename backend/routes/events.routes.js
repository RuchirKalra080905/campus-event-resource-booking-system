const router = require('express').Router();
const ctrl = require('../controllers/events.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, ctrl.getEvents);
router.get('/:id', authenticate, ctrl.getEvent);
router.post('/', authenticate, authorize('admin', 'faculty'), ctrl.createEvent);
router.put('/:id', authenticate, authorize('admin', 'faculty'), ctrl.updateEvent);
router.put('/:id/status', authenticate, authorize('admin'), ctrl.updateEventStatus);
router.delete('/:id', authenticate, authorize('admin', 'faculty'), ctrl.deleteEvent);

module.exports = router;
