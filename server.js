const express = require('express');
const runScraper = require('./odoo_scraper'); // same folder

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🤖 Odoo Scraper API is running');
});

app.get('/run', async (req, res) => {
  try {
    const result = await runScraper();
    res.json({
      success: true,
      message: '✅ Scraping completed!',
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: '❌ Scraper failed',
      error: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
