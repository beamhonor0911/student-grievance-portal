const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS
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

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(process.env.PORT, () => {
      console.log(`✅ Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.log('❌ MongoDB Error:', err));