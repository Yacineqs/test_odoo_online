const express = require('express');
const runScraper = require('./scheduler'); // assuming scheduler.js exports a function
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/run', async (req, res) => {
  try {
    await runScraper();
    res.send('✅ Scraping completed!');
  } catch (err) {
    console.error('❌ Scraper failed:', err);
    res.status(500).send('❌ Scraper failed');
  }
});

app.get('/', (req, res) => {
  res.send('🤖 Odoo Scraper API is running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
