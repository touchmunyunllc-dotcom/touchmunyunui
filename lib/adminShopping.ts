export const ADMIN_SHOPPING_BLOCKED_MESSAGE =
  'Admin accounts cannot place storefront orders. Use a customer account or guest checkout to test purchases.';

export function isAdminUser(user?: { role?: string } | null): boolean {
  return user?.role === 'admin';
}
