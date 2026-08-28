const router = require('express').Router();
const ctrl = require('../controllers/bookings.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, ctrl.createBooking);
router.get('/', authenticate, ctrl.getBookings);
router.put('/:id/approve', authenticate, authorize('admin'), ctrl.approveBooking);
router.put('/:id/reject', authenticate, authorize('admin'), ctrl.rejectBooking);
router.put('/:id/cancel', authenticate, ctrl.cancelBooking);

module.exports = router;
