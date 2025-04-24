const express = require('express')
const router = express.Router()
const { login,directLoginAdmin } = require('../controllers/authControlleradmin');

router.post('/login', login);
router.post('/direct-login', directLoginAdmin);

module.exports = router;