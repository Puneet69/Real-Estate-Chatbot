process.on('uncaughtException', function (err) {
  console.error('UNCAUGHT EXCEPTION:', err);
});

const fs = require('fs');
const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// Optional dotenv loader: if you install dotenv, the file backend/.env will be loaded.
try { require('dotenv').config({ path: path.join(__dirname, '.env') }); } catch (e) { /* dotenv not installed; ensure env vars are set externally */ }

// MongoDB connection: prefer MONGODB_URI from environment (backend/.env), fall back to the original value only as a last resort.
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.warn('Warning: MONGODB_URI not set - falling back to embedded URI (move this to backend/.env)');
}
const MONGO_FALLBACK = 'mongodb+srv://Real_Estate:zB2EhD0kmYjRecQ6@realestate.caqfzde.mongodb.net/?retryWrites=true&w=majority&appName=RealEstate';

mongoose.connect(MONGODB_URI || MONGO_FALLBACK, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Import Favorite model
const Favorite = require('./models/Favorite');

app.use(cors());
app.use(express.json());

// Merge property data from files
function loadProperties() {
  const basics = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "JSON 1.txt")));
  const characteristics = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "JSON 2.txt")));
  const images = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "JSON 3.txt")));
  return basics.map(basic => ({
    ...basic,
    ...(characteristics.find(c => c.id === basic.id) || {}),
    ...(images.find(i => i.id === basic.id) || {}),
  }));
}

// Retrieve all properties
app.get('/api/properties', (req, res) => {
  try {
    const properties = loadProperties();
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI proxy endpoint: forwards prompt to the Python FastAPI inference server
app.post('/api/ai', async (req, res) => {
  try {
    const { prompt, max_tokens, temperature } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });
    // If an external AI provider is configured, call it directly (useful for hosted inference)
    const providerUrl = process.env.AI_PROVIDER_URL;
    const providerKey = process.env.AI_API_KEY;
    if (providerUrl) {
      // Provider expects the same JSON shape; include Authorization if API key is set
      const headers = { 'Content-Type': 'application/json' };
      if (providerKey) headers['Authorization'] = `Bearer ${providerKey}`;
      const response = await fetch(providerUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt, max_tokens, temperature })
      });
      if (!response.ok) {
        const txt = await response.text();
        return res.status(502).json({ error: 'AI provider error', details: txt });
      }
      const data = await response.json();
      return res.json(data);
    }

    // Forward to local Python inference server (default: http://localhost:8000)
    const inferUrl = (process.env.AI_SERVER_URL || 'http://localhost:8000') + '/generate';
    const response = await fetch(inferUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, max_tokens, temperature })
    });
    if (!response.ok) {
      const txt = await response.text();
      return res.status(502).json({ error: 'AI server error', details: txt });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save a property as favorite
app.post('/api/favorites', async (req, res) => {
  try {
    const { user, propertyId } = req.body;
    if (!user || !propertyId) {
      return res.status(400).json({ error: 'user and propertyId required' });
    }
    const fav = await Favorite.create({ user, propertyId });
    res.json(fav);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all favorites for a user
app.get('/api/favorites', async (req, res) => {
  try {
    const { user } = req.query;
    if (!user) {
      return res.status(400).json({ error: 'user query required' });
    }
    const favorites = await Favorite.find({ user });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove a property from favorites
app.delete('/api/favorites', async (req, res) => {
  try {
    const { user, propertyId } = req.body;
    if (!user || !propertyId) {
      return res.status(400).json({ error: 'user and propertyId required' });
    }
    const result = await Favorite.findOneAndDelete({ user, propertyId });
    if (result) {
      res.json({ message: 'Favorite removed' });
    } else {
      res.status(404).json({ error: 'Favorite not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5008;
const HOST = process.env.HOST || '0.0.0.0'; // Railway needs 0.0.0.0 binding

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Set the PORT environment variable or free the port and retry.`);
    process.exit(1);
  }
  console.error('Server error:', err);
});
