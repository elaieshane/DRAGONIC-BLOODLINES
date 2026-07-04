import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import path from 'path';

(async () => {
  console.log('Starting dev server...');
  const server = spawn('npm', ['run', 'dev'], { shell: true });
  
  // Give server 5 seconds to start
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('Launching puppeteer...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  page.on('console', msg => {
      if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
  });
  page.on('pageerror', error => console.log('BROWSER FATAL:', error.message));

  try {
    console.log('Navigating...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Wait for "Skip Intro" to appear and click it
    console.log('Waiting for Skip Intro...');
    await page.waitForSelector('button', { timeout: 10000 });
    const buttons = await page.$$('button');
    for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text?.includes('Skip Intro')) {
            await btn.click();
            break;
        }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Click Skip Intro again if needed (2 videos)
    const buttons2 = await page.$$('button');
    for (const btn of buttons2) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text?.includes('Skip Intro')) {
            await btn.click();
            break;
        }
    }

    console.log('Waiting for START DESCENT...');
    await page.waitForFunction(() => document.body.innerText.includes('START DESCENT'), { timeout: 10000 });
    
    // Find and click Start Game
    const startBtns = await page.$$('button');
    for (const btn of startBtns) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text?.includes('START DESCENT')) {
            await btn.click();
            break;
        }
    }

    // Wait for the game to load
    console.log('Waiting for playing screen...');
    await new Promise(resolve => setTimeout(resolve, 6000));

    // Take screenshot
    await page.screenshot({ path: path.join(process.cwd(), 'screenshot.png') });
    console.log('Saved screenshot.png');
    
    // Dump HTML
    const html = await page.evaluate(() => document.getElementById('root')?.innerHTML);
    const hasCanvas = await page.evaluate(() => document.querySelector('canvas') !== null);
    console.log('Has Canvas?', hasCanvas);

  } catch (err) {
    console.error('Navigation error:', err);
  } finally {
    await browser.close();
    server.kill();
    process.exit(0);
  }
})();
