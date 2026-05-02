const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3000';

test.describe('Authentication', () => {
  test('login page loads', async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);
    await expect(page.locator('.login-title')).toContainText('Электронная библиотека документов');
    await expect(page.locator('#login')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('wrong credentials show error', async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);
    await page.fill('#login', 'wrong');
    await page.fill('#password', 'wrong');
    await page.click('button[type="submit"]');
    await expect(page.locator('.alert-error')).toContainText('Неверный логин или пароль');
  });

  test('admin login redirects to admin panel', async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);
    await page.fill('#login', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/**');
    await expect(page.locator('.page-header h1')).toContainText('Управление пользователями');
  });

  test('librarian login redirects to librarian panel', async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);
    await page.fill('#login', 'librarian');
    await page.fill('#password', 'lib123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/librarian/**');
    await expect(page.locator('.page-header h1')).toContainText('Управление документами');
  });

  test('reader login redirects to catalog', async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);
    await page.fill('#login', 'reader');
    await page.fill('#password', 'read123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/reader**');
    await expect(page.locator('.page-header h1')).toContainText('Каталог документов');
  });
});

test.describe('Admin - User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);
    await page.fill('#login', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/**');
  });

  test('user list displays users', async ({ page }) => {
    await expect(page.locator('#users-table-body tr')).toHaveCount(3);
  });

  test('can create a new user', async ({ page }) => {
    await page.click('text=Добавить пользователя');
    await page.fill('#add-fullName', 'Тестовый Пользователь');
    await page.fill('#add-email', 'test@library.ru');
    await page.selectOption('#add-roleId', '3');
    await page.click('#addUserForm button[type="submit"]');

    await expect(page.locator('#credentials-display')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#cred-login')).not.toBeEmpty();
    await expect(page.locator('#cred-password')).not.toBeEmpty();
  });

  test('logout works', async ({ page }) => {
    await page.click('text=Выход');
    await page.waitForURL('**/auth/login**');
    await expect(page.locator('.login-title')).toBeVisible();
  });
});

test.describe('Librarian - Document Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);
    await page.fill('#login', 'librarian');
    await page.fill('#password', 'lib123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/librarian/**');
  });

  test('documents page loads', async ({ page }) => {
    await expect(page.locator('.page-header h1')).toContainText('Управление документами');
  });

  test('categories page loads', async ({ page }) => {
    await page.click('text=Категории');
    await expect(page.locator('.page-header h1')).toContainText('Управление категориями');
    await expect(page.locator('#categories-table-body tr')).toHaveCount(5);
  });

  test('can create a category', async ({ page }) => {
    await page.click('text=Категории');
    await page.click('text=Добавить категорию');
    await page.fill('#add-cat-name', 'Тестовая категория');
    await page.click('#addCategoryForm button[type="submit"]');
    await expect(page.locator('.notification.success')).toBeVisible({ timeout: 5000 });
  });

  test('stats page loads', async ({ page }) => {
    await page.click('text=Статистика');
    await expect(page.locator('.page-header h1')).toContainText('Статистика скачиваний');
  });
});

test.describe('Reader - Catalog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);
    await page.fill('#login', 'reader');
    await page.fill('#password', 'read123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/reader**');
  });

  test('catalog page loads with search', async ({ page }) => {
    await expect(page.locator('#search-query')).toBeVisible();
    await expect(page.locator('#search-category')).toBeVisible();
  });

  test('favorites page loads', async ({ page }) => {
    await page.click('text=Избранное');
    await expect(page.locator('.page-header h1')).toContainText('Избранное');
  });
});

test.describe('Access Control', () => {
  test('unauthenticated user redirected to login', async ({ page }) => {
    await page.goto(`${BASE}/admin`);
    await page.waitForURL('**/auth/login**');
  });

  test('reader cannot access admin', async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);
    await page.fill('#login', 'reader');
    await page.fill('#password', 'read123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/reader**');

    const response = await page.goto(`${BASE}/admin/users`);
    expect(response.status()).toBe(403);
  });

  test('reader cannot access librarian', async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);
    await page.fill('#login', 'reader');
    await page.fill('#password', 'read123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/reader**');

    const response = await page.goto(`${BASE}/librarian/documents`);
    expect(response.status()).toBe(403);
  });
});
