const router = require('express').Router();
const ctrl = require('../controllers/notifications.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, ctrl.getNotifications);
router.get('/unread-count', authenticate, ctrl.getUnreadCount);
router.put('/read-all', authenticate, ctrl.markAllAsRead);
router.put('/:id/read', authenticate, ctrl.markAsRead);

module.exports = router;
