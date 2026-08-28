const router = require('express').Router();
const ctrl = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, ctrl.getDashboard);

module.exports = router;
