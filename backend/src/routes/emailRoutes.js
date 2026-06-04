const express = require('express');
const { submitForm, distributeForm } = require('../controllers/emailController');

const router = express.Router();

router.post('/submit-form', submitForm);
router.post('/distribute-form', distributeForm);

module.exports = { emailRoutes: router };
