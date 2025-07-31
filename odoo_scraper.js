const puppeteer = require('puppeteer');

const url = 'https://qorelis-test-bsi5-staging24-07-22286992.dev.odoo.com';
const username = 'admin';
const password = 'test';

async function runScraper() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  try {
    await login(page);

    const contactCount = await scrapeView(page, {
      name: 'contacts',
      actionUrl: 'web#action=base.action_partner_form&view_type=list',
      countOnly: true,
    });

    const draftSalesCount = await scrapeView(page, {
      name: 'sales',
      actionUrl: 'web#action=account.action_move_out_invoice_type&view_type=list',
      filterStatus: 'draft',
      countOnly: true,
    });

    const draftPurchasesCount = await scrapeView(page, {
      name: 'purchases',
      actionUrl: 'web#action=account.action_move_in_invoice_type&view_type=list',
      filterStatus: 'draft',
      countOnly: true,
    });

    console.log('✅ Scrape complete, exiting.');

    return {
      contacts: contactCount,
      draft_sales: draftSalesCount,
      draft_purchases: draftPurchasesCount,
    };

  } catch (err) {
    console.error('❌ Scraping error:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

async function login(page) {
  console.log('🧭 Navigating to login page...');
  await page.goto(`${url}/web/login`, { waitUntil: 'networkidle2' });

  console.log('🔐 Filling login form...');
  await page.waitForSelector('input[name="login"]');
  await page.type('input[name="login"]', username, { delay: 100 });
  await page.type('input[name="password"]', password, { delay: 100 });
  await page.keyboard.press('Enter');

  console.log('⏳ Waiting for navigation...');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  console.log('✅ Logged in successfully!');
}

async function scrapeView(page, {
  name,
  actionUrl,
  filterStatus = null,
  countOnly = false,
}) {
  console.log(`📄 Navigating to ${name} list...`);
  await page.goto(`${url}/${actionUrl}`, { waitUntil: 'networkidle2' });

  await page.waitForSelector('.o_data_row', { timeout: 10000 });
  await delay(2000); // just to be safe

  const data = await page.evaluate((filterStatus) => {
    const rows = Array.from(document.querySelectorAll('.o_data_row'));
    const results = [];

    for (const row of rows) {
      const cells = row.querySelectorAll('td');
      const badge = row.querySelector('.badge');
      const status = badge?.innerText?.toLowerCase() || '';
      const name = cells[1]?.innerText?.trim();

      if (!filterStatus || status === filterStatus.toLowerCase()) {
        results.push(name);
      }
    }

    return results;
  }, filterStatus);

  return countOnly ? data.length : data;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = runScraper;

// Optional: Run directly from CLI
if (require.main === module) {
  console.log('⏰ Starting one-time Odoo scrape...');
  runScraper().then(console.log).catch(console.error);
}
