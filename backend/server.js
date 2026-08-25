const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS — allow all origins for local dev
app.use(cors());

// Body parser
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/grievance', require('./routes/grievance'));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Student Grievance Portal API — by Anshumaan Sharma' });
});

// Start server (no MongoDB needed — using JSON file database)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('📦 Using JSON file database (db.json) — no MongoDB needed');
});