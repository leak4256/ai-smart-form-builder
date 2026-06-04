const express = require('express');
const { generateForm } = require('../controllers/formController');

const router = express.Router();

router.post('/generate-form', generateForm);

module.exports = { formRoutes: router };
