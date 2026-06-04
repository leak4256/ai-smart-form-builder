const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { corsOptions } = require('./config/cors');
const { formRoutes } = require('./routes/formRoutes');
const { emailRoutes } = require('./routes/emailRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

app.use('/api', formRoutes);
app.use('/api', emailRoutes);

app.use(errorHandler);

module.exports = { app };
