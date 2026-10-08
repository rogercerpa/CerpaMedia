import { chromium } from '@playwright/test';
import path from 'path';

const SCREENSHOTS_DIR = path.join(process.cwd(), 'artifacts', 'screenshots');
const BASE_URL = 'http://localhost:3000';

async function captureScreenshots() {
  console.log('📸 Starting screenshot capture...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. AFTER: Public /consult with zero slots
    console.log('Capturing public /consult with zero availability...');
    await page.goto(`${BASE_URL}/consult`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'after-public-consult-no-slots.png'),
      fullPage: true,
    });

    // 2. Mobile calendar headers at 360, 390, 414px
    console.log('Capturing mobile calendar headers...');
    for (const width of [360, 390, 414]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(`${BASE_URL}/consult`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, `after-mobile-calendar-${width}px.png`),
        clip: { x: 0, y: 0, width, height: 400 },
      });
    }

    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // 3. Admin - unified interface (need to bypass auth)
    console.log('Capturing admin screens...');
    await context.addCookies([{
      name: 'admin-session',
      value: 'screenshot-session',
      domain: 'localhost',
      path: '/',
    }]);
    
    await page.goto(`${BASE_URL}/admin/availability`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'after-admin-unified-interface.png'),
      fullPage: true,
    });

    // Click a date to open modal
    console.log('Capturing open-date modal...');
    const dateButtons = await page.$$('button[class*="aspect-square"]');
    if (dateButtons.length > 15) {
      await dateButtons[20].click();
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'after-admin-open-date-modal.png'),
      });
      
      // Switch to block mode
      const blockTab = await page.$('text=Block Date');
      if (blockTab) {
        await blockTab.click();
        await page.waitForTimeout(500);
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, 'after-admin-block-date-modal.png'),
        });
      }
      
      // Close modal
      const cancelBtn = await page.$('text=Cancel');
      if (cancelBtn) await cancelBtn.click();
    }

    // Add one DateAvailability and capture
    console.log('Opening one date...');
    await page.goto(`${BASE_URL}/admin/availability`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const openButtons = await page.$$('button[class*="aspect-square"]');
    if (openButtons.length > 20) {
      await openButtons[22].click();
      await page.waitForTimeout(1000);
      
      // Fill form
      const timeInputs = await page.$$('input[type="time"]');
      if (timeInputs.length >= 2) {
        await timeInputs[0].fill('10:00');
        await timeInputs[1].fill('16:00');
      }
      
      const saveBtn = await page.$('text=Save');
      if (saveBtn) {
        await saveBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, 'after-admin-with-one-date.png'),
          fullPage: true,
        });
      }
    }

    // 4. Public /consult after opening one date
    console.log('Capturing public /consult with one date opened...');
    await page.goto(`${BASE_URL}/consult`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'after-public-consult-with-date.png'),
      fullPage: true,
    });

    console.log('✅ All screenshots captured!');
  } catch (error) {
    console.error('❌ Screenshot error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

captureScreenshots().catch(console.error);
