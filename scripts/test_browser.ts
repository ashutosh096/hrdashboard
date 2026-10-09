import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:5175');
  const title = await page.title();
  console.log('Successfully opened page, title:', title);
  await browser.close();
  process.exit(0);
}

main().catch(err => {
  console.error('Browser launch error:', err);
  process.exit(1);
});
