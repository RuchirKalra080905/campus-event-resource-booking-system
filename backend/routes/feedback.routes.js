const router = require('express').Router();
const ctrl = require('../controllers/feedback.controller');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, ctrl.submitFeedback);
router.get('/event/:eventId', authenticate, ctrl.getEventFeedback);

module.exports = router;
