const express = require('express');
const cors = require('cors');
const { connectToDatabase, getDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/organizations/signup', async (req, res) => {
  try {
    const db = getDb();
    const orgs = db.collection('organizations');

    const { orgName, email, password, phone, address, website } = req.body;

    if (!orgName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await orgs.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Organization with this email already exists' });
    }

    const doc = {
      orgName,
      email,
      phone,
      address,
      website,
      // NOTE: demo only – do NOT store plain passwords in production
      password,
      createdAt: new Date(),
    };

    const result = await orgs.insertOne(doc);

    res.status(201).json({ message: 'Organization created', id: result.insertedId });
  } catch (error) {
    console.error('Error in /api/organizations/signup:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

async function start() {
  try {
    await connectToDatabase();

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

module.exports = app;

