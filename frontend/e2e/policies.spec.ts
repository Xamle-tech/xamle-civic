import { test, expect } from '@playwright/test';

test.describe('Liste des politiques', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/policies');
  });

  test('affiche le titre de la page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Politiques publiques' })).toBeVisible();
  });

  test('affiche le panneau de filtres', async ({ page }) => {
    await expect(page.getByRole('complementary', { name: 'Filtres' })).toBeVisible();
  });

  test('filtre par statut', async ({ page }) => {
    await page.getByRole('button', { name: 'En cours' }).click();
    await expect(page.getByRole('button', { name: 'En cours' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('recherche fonctionne', async ({ page }) => {
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('CMU');
    await expect(searchInput).toHaveValue('CMU');
  });

  test('navigation vers la fiche détaillée', async ({ page }) => {
    const firstCard = page.getByRole('list', { name: 'Liste des politiques' })
      .getByRole('listitem')
      .first();
    const link = firstCard.getByRole('link');
    const href = await link.getAttribute('href');
    await link.click();
    await expect(page).toHaveURL(href!);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

test.describe('Fiche détaillée politique', () => {
  test('affiche les onglets de navigation', async ({ page }) => {
    await page.goto('/policies/couverture-maladie-universelle');
    await expect(page.getByRole('tab', { name: "Vue d'ensemble" })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Chronologie' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Sources' })).toBeVisible();
  });

  test('navigation par onglet accessible', async ({ page }) => {
    await page.goto('/policies/couverture-maladie-universelle');
    const chronoTab = page.getByRole('tab', { name: 'Chronologie' });
    await chronoTab.click();
    await expect(chronoTab).toHaveAttribute('aria-selected', 'true');
  });
});
