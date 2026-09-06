import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

const SHOP_PATHS = new Set(['/products', '/new-arrivals', '/best-sellers', '/collections']);

function isShopRoute(pathname: string): boolean {
  return SHOP_PATHS.has(pathname) || pathname.startsWith('/products/');
}

function isAccountRoute(pathname: string): boolean {
  return pathname === '/profile' || pathname === '/login' || pathname === '/register';
}

type TabProps = {
  label: string;
  active: boolean;
  badge?: number;
  onClick?: () => void;
  href?: string;
  children: React.ReactNode;
};

function BottomNavTab({ label, active, badge, onClick, href, children }: TabProps) {
  const className = `relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 touch-manipulation transition-colors ${
    active ? 'text-button' : 'text-foreground/55 hover:text-foreground/80'
  }`;

  const content = (
    <>
      <span className="relative">
        {children}
        {badge != null && badge > 0 && (
          <span className="absolute -top-1.5 -right-2 min-w-[1rem] h-4 px-1 flex items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-white leading-none">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>
      <span className={`text-[10px] font-semibold tracking-wide ${active ? 'text-button' : ''}`}>
        {label}
      </span>
      {active && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-button" aria-hidden />
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className} aria-current={active ? 'page' : undefined}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className} aria-label={label}>
      {content}
    </button>
  );
}

export function MobileBottomNav() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { itemCount, openDrawer } = useCart();
  const path = router.pathname;

  const homeActive = path === '/';
  const shopActive = isShopRoute(path);
  const cartActive = path === '/cart';
  const accountHref = isAuthenticated ? '/profile' : '/login';
  const accountActive = isAccountRoute(path);

  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-foreground/10 bg-account-menu/95 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.35)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Primary mobile navigation"
    >
      <div className="flex items-stretch h-[3.75rem] max-w-lg mx-auto">
        <BottomNavTab label="Home" href="/" active={homeActive}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={homeActive ? 2.25 : 1.75}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </BottomNavTab>

        <BottomNavTab label="Shop" href="/products" active={shopActive}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={shopActive ? 2.25 : 1.75}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </BottomNavTab>

        <BottomNavTab
          label="Cart"
          active={cartActive}
          badge={itemCount}
          onClick={() => {
            if (path === '/cart') return;
            openDrawer();
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </BottomNavTab>

        <BottomNavTab label="Account" href={accountHref} active={accountActive}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={accountActive ? 2.25 : 1.75}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </BottomNavTab>
      </div>
    </nav>
  );
}
