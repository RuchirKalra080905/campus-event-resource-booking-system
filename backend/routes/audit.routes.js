const router = require('express').Router();
const ctrl = require('../controllers/audit.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin'), ctrl.getAuditLogs);

module.exports = router;
