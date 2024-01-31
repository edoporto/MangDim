const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
async function processURLs() {
  try {
    const urls = await fs.readFile('listurl.txt', 'utf-8');
    const urlArray = urls.split('\n').map(url => url.trim());
    const logFilePath = 'log.txt';
    await fs.appendFile(logFilePath, '=======\n');
    const screenshotFolder = path.join(__dirname, 'ss');
    await fs.mkdir(screenshotFolder, { recursive: true });
    const browser = await puppeteer.launch();
    for (const url of urlArray) {
      if (url) {
        const page = await browser.newPage();
        try {
          // https
          await page.goto(`https://${url}`);
        } catch (httpsError) {
          console.error(`HTTPS Error ${url}: ${httpsError.message}`);
          // http
          try {
            await page.goto(`http://${url}`);
          } catch (httpError) {
            console.error(`HTTP Error ${url}: ${httpError.message}`);
            await fs.appendFile(logFilePath, `URL: ${url}\n`);
            await fs.appendFile(logFilePath, `Error: ${httpsError.message}\n`);
            await fs.appendFile(logFilePath, '=======\n');
            await page.close();
            continue;
          }
        }
        const title = await page.title();
        const content = await page.evaluate(() => {
          return document.querySelector('body').innerText;
        });
        const screenshotPath = path.join(screenshotFolder, `screenshot_${url.replace(/[^a-zA-Z0-9]/g, '_')}.png`);
        await page.screenshot({ path: screenshotPath });
        await fs.appendFile(logFilePath, `URL: ${url}\n`);
        await fs.appendFile(logFilePath, `Title: ${title}\n`);
        await fs.appendFile(logFilePath, `Content: ${content}\n`);
        await fs.appendFile(logFilePath, '=======\n');
        await page.close();
      }
    }
    await browser.close();
  } catch (error) {
    console.error('Error:', error);
  }
}
processURLs();
