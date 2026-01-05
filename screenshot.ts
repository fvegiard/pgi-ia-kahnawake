import { chromium } from '@playwright/test';

const pages = [
  { name: 'dashboard', path: '/' },
  { name: 'documents', path: '/documents' },
  { name: 'tasks', path: '/tasks' },
  { name: 'search', path: '/search' },
  { name: 'timeline', path: '/timeline' },
  { name: 'analytics', path: '/analytics' },
  { name: 'teams', path: '/teams' },
  { name: 'settings', path: '/settings' },
  { name: 'notifications', path: '/notifications' },
];

async function captureScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  for (const page of pages) {
    const browserPage = await context.newPage();
    console.log(`Capturing ${page.name}...`);

    await browserPage.goto(`http://localhost:3000${page.path}`, {
      waitUntil: 'networkidle'
    });

    // Wait for content to load
    await browserPage.waitForTimeout(2000);

    await browserPage.screenshot({
      path: `./screenshots/${page.name}.png`,
      fullPage: false
    });

    console.log(`✓ ${page.name}.png saved`);
    await browserPage.close();
  }

  await browser.close();
  console.log('\nAll screenshots captured!');
}

captureScreenshots().catch(console.error);
