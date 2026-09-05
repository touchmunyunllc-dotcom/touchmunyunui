export type DashboardTab = 'metrics' | 'orders' | 'products' | 'revenue' | 'actions';

const VALID_TABS: DashboardTab[] = ['metrics', 'orders', 'products', 'revenue', 'actions'];
const ADMIN_RETURN_TAB_KEY = 'admin:returnTab';

export const DASHBOARD_TAB_LABELS: Record<DashboardTab, string> = {
  metrics: 'Key Metrics',
  orders: 'Orders by Status',
  products: 'Top Selling Products',
  revenue: 'Revenue by Day',
  actions: 'Quick Actions',
};

export function parseDashboardTab(value: string | undefined): DashboardTab {
  if (value && VALID_TABS.includes(value as DashboardTab)) {
    return value as DashboardTab;
  }
  return 'metrics';
}

export function parseDashboardTabFromHash(hash: string): DashboardTab {
  return parseDashboardTab(hash.replace(/^#/, '') || undefined);
}

/** Dashboard URL — uses hash for tab state, not query strings. */
export function adminDashboardHref(tab: DashboardTab = 'metrics'): string {
  return tab === 'metrics' ? '/admin' : `/admin#${tab}`;
}

/** Remember which dashboard tab to restore when leaving admin sub-pages. */
export function setAdminReturnTab(tab: DashboardTab): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ADMIN_RETURN_TAB_KEY, tab);
}

export function getAdminReturnTab(fallback: DashboardTab = 'actions'): DashboardTab {
  if (typeof window === 'undefined') return fallback;
  const stored = sessionStorage.getItem(ADMIN_RETURN_TAB_KEY);
  return stored ? parseDashboardTab(stored) : fallback;
}

export function getAdminBackLabel(tab: DashboardTab): string {
  if (tab === 'metrics') {
    return 'Back to Dashboard';
  }
  return `Back to ${DASHBOARD_TAB_LABELS[tab]}`;
}

/** Call before navigating from the dashboard to an admin sub-page. */
export function rememberAdminReturnTab(tab: DashboardTab): void {
  setAdminReturnTab(tab);
}
