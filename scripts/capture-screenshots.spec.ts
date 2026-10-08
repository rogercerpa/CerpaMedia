import { test, expect, chromium, Page } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

const SCREENSHOTS_DIR = path.join(process.cwd(), 'artifacts', 'screenshots');

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    // Directory exists
  }
}

async function screenshot(page: Page, name: string, options: { fullPage?: boolean; clip?: { x: number; y: number; width: number; height: number } } = {}) {
  const filepath = path.join(SCREENSHOTS_DIR, name);
  await page.screenshot({ path: filepath, ...options });
  console.log(`📸 Captured: ${name}`);
}

async function login(page: Page) {
  // Simple bypass: set admin session cookie directly
  // This is for local testing only and matches the auth implementation
  await page.context().addCookies([{
    name: 'admin-session',
    value: 'test-session-token',
    domain: 'localhost',
    path: '/',
  }]);
}

test.describe('Availability Screenshots', () => {
  test('capture all screenshots', async () => {
    await ensureDir(SCREENSHOTS_DIR);

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // BEFORE: Public /consult showing slots (main branch behavior with legacy rules)
      console.log('\n📸 Capturing BEFORE screenshots (simulated)...');
      // Note: We can't actually test main branch here, so we'll document this

      // AFTER: Public /consult showing NO slots (empty DateAvailability)
      console.log('\n📸 Capturing AFTER screenshots (zero availability)...');
      await page.goto('http://localhost:3000/consult');
      await page.waitForLoadState('networkidle');
      await screenshot(page, 'public-consult-no-slots-after.png', { fullPage: true });

      // Mobile calendar header - different widths
      console.log('\n📸 Capturing mobile calendar headers...');
      for (const width of [360, 390, 414]) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto('http://localhost:3000/consult');
        await page.waitForLoadState('networkidle');
        // Wait for calendar to render
        await page.waitForSelector('text=Select a Date', { timeout: 5000 });
        await screenshot(page, `mobile-calendar-${width}px-after.png`);
      }

      // Reset viewport
      await page.setViewportSize({ width: 1280, height: 720 });

      // Admin - unified interface
      console.log('\n📸 Capturing admin screenshots...');
      await login(page);
      await page.goto('http://localhost:3000/admin/availability');
      await page.waitForLoadState('networkidle');
      
      // Wait for calendar to render
      await page.waitForSelector('text=Calendar', { timeout: 5000 });
      await screenshot(page, 'admin-unified-calendar.png', { fullPage: true });

      // Click a date to open modal
      console.log('Opening date modal...');
      const dateButtons = await page.$$('button[class*="aspect-square"]');
      if (dateButtons.length > 10) {
        await dateButtons[15].click(); // Click a date in current month
        await page.waitForSelector('text=Open for Booking', { timeout: 2000 });
        await screenshot(page, 'admin-open-date-modal.png');
        
        // Switch to block mode
        await page.click('text=Block Date');
        await screenshot(page, 'admin-block-date-modal.png');
        
        // Close modal
        await page.click('text=Cancel');
      }

      // Add one DateAvailability record
      console.log('\n📸 Adding one date availability...');
      await page.goto('http://localhost:3000/admin/availability');
      await page.waitForLoadState('networkidle');
      
      const dateButtonsAgain = await page.$$('button[class*="aspect-square"]');
      if (dateButtonsAgain.length > 10) {
        await dateButtonsAgain[20].click();
        await page.waitForSelector('text=Open for Booking');
        await page.fill('input[type="time"]', '10:00');
        const timeInputs = await page.$$('input[type="time"]');
        if (timeInputs[1]) {
          await timeInputs[1].fill('16:00');
        }
        await page.click('text=Save');
        await page.waitForTimeout(2000); // Wait for save
        await screenshot(page, 'admin-with-one-date.png', { fullPage: true });
      }

      // Public /consult after adding date
      console.log('\n📸 Capturing public calendar with one date...');
      await page.goto('http://localhost:3000/consult');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await screenshot(page, 'public-consult-with-date-after.png', { fullPage: true });

      console.log('\n✅ All screenshots captured!');
    } catch (error) {
      console.error('❌ Screenshot error:', error);
      throw error;
    } finally {
      await browser.close();
    }
  });
});
