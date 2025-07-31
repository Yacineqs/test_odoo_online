const runScraper = require('./odoo_scraper');

(async () => {
  console.log('⏰ Starting one-time Odoo scrape...');
  await runScraper();
  console.log('✅ Scrape complete, exiting.');
  process.exit(0);
})();
