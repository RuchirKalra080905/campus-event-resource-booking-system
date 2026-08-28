const router = require('express').Router();
const ctrl = require('../controllers/venues.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, ctrl.getVenues);
router.get('/check-availability', authenticate, ctrl.checkAvailability);
router.get('/:id', authenticate, ctrl.getVenue);
router.post('/', authenticate, authorize('admin'), ctrl.createVenue);
router.put('/:id', authenticate, authorize('admin'), ctrl.updateVenue);
router.delete('/:id', authenticate, authorize('admin'), ctrl.deleteVenue);

module.exports = router;
