import { test, expect } from '@playwright/test';

test.describe('Gold Moat smoke', () => {
  test('UI + API smoke for dealer moat routes', async ({ page, request }) => {
    await page.goto('http://localhost:3000/ar/eg/cairo/dealers');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('أفضل تجار الذهب');
    await page.screenshot({ path: 'output/playwright/final-check/dealers-page.png', fullPage: true });

    await page.goto('http://localhost:3000/ar/eg/cairo/compare');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('مقارنة سعر الذهب');
    await page.screenshot({ path: 'output/playwright/final-check/compare-page.png', fullPage: true });

    await page.goto('http://localhost:3000/ar/eg/cairo/insights');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('إشارات السوق');
    await page.screenshot({ path: 'output/playwright/final-check/insights-page.png', fullPage: true });

    const dealersRes = await request.get('http://localhost:3000/api/dealers?country=eg&city=cairo');
    expect(dealersRes.status()).toBe(200);
    const dealersJson = await dealersRes.json();
    expect(typeof dealersJson.rankingEnabled).toBe('boolean');
    expect(dealersJson.readiness).toBeTruthy();

    const freshnessRes = await request.get('http://localhost:3000/api/freshness?country=eg&city=cairo');
    expect(freshnessRes.status()).toBe(200);
    const freshnessJson = await freshnessRes.json();
    expect(freshnessJson.readiness).toBeTruthy();
  });
});
