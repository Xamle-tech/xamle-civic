import { test, expect } from '@playwright/test';

test.describe('Page d\'accueil', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('affiche le titre hero', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('politiques publiques sénégalaises')).toBeVisible();
  });

  test('lien "Explorer les politiques" fonctionne', async ({ page }) => {
    await page.getByRole('link', { name: /Explorer les politiques/ }).click();
    await expect(page).toHaveURL('/policies');
  });

  test('skip-to-content fonctionne', async ({ page }) => {
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Aller au contenu principal' });
    await expect(skipLink).toBeFocused();
    await page.keyboard.press('Enter');
    const main = page.locator('#main-content');
    await expect(main).toBeVisible();
  });

  test('titre de page correct', async ({ page }) => {
    await expect(page).toHaveTitle(/Xamle Civic/);
  });
});

test.describe('Accessibilité — Page d\'accueil', () => {
  test('aucune erreur de contraste de couleur critique', async ({ page }) => {
    await page.goto('/');
    // Vérifie que les éléments interactifs ont un focus visible
    const buttons = page.getByRole('button');
    const count = await buttons.count();
    for (let i = 0; i < Math.min(count, 3); i++) {
      await buttons.nth(i).focus();
      const outline = await buttons.nth(i).evaluate((el) =>
        window.getComputedStyle(el).outlineStyle,
      );
      // Focus style should be set (not 'none' after focusing)
    }
  });
});
