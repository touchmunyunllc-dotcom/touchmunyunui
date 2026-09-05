import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { couponService, Coupon } from '@/services/couponService';
import { notificationService } from '@/services/notificationService';

const ROTATE_MS = 6000;

type CouponSliderProps = {
  variant?: 'inline' | 'compact';
};

function formatDiscount(coupon: Coupon): string {
  const discountType = String(coupon.discountType || '').toLowerCase();
  const discountValue = Number(coupon.discountValue || 0);

  if (discountValue > 0) {
    if (discountType === 'percentage') return `${Math.round(discountValue)}% off`;
    return `$${discountValue.toFixed(0)} off`;
  }

  return coupon.code;
}

export const CouponSlider: React.FC<CouponSliderProps> = ({ variant = 'inline' }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadPromoCoupons = async () => {
      try {
        const activeCoupons = await couponService.getPromo();
        if (!cancelled) {
          setCoupons(activeCoupons);
          setActiveIndex(0);
        }
      } catch (error) {
        console.error('Failed to load admin promo coupons:', error);
        if (!cancelled) setCoupons([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadPromoCoupons();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (coupons.length <= 1) return;

    const rotate = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setActiveIndex((i) => (i + 1) % coupons.length);
        setVisible(true);
      }, 250);
    }, ROTATE_MS);

    return () => clearInterval(rotate);
  }, [coupons.length]);

  const copyCode = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      notificationService.success(`Copied code ${code}`);
    } catch {
      notificationService.error('Could not copy code');
    }
  }, []);

  if (loading || coupons.length === 0) {
    return null;
  }

  const coupon = coupons[activeIndex];
  const discountLabel = formatDiscount(coupon);

  if (variant === 'compact') {
    return (
      <div
        className={`rounded-xl border border-gold-500/25 bg-gold-500/5 px-3 py-2.5 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-60'
        }`}
        role="note"
        aria-label="Active promotion"
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="font-bold text-red-400">{discountLabel}</span>
          <span className="text-foreground/30 hidden sm:inline">·</span>
          <button
            type="button"
            onClick={() => void copyCode(coupon.code)}
            className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-black/20 px-2 py-0.5 text-xs font-semibold text-foreground hover:border-red-500/30 transition-colors"
          >
            <span className="font-mono">{coupon.code}</span>
            <span className="text-[10px] text-foreground/50">copy</span>
          </button>
          <span className="text-foreground/30 hidden sm:inline">·</span>
          <Link href="/products" className="text-xs font-medium text-button hover:underline">
            Shop
          </Link>
        </div>
        {coupons.length > 1 && (
          <p className="text-[10px] text-foreground/45 mt-1">
            {activeIndex + 1} of {coupons.length} active offers
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`mt-5 pt-4 border-t border-white/10 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      role="note"
      aria-label="Special offer"
    >
      <p className="text-[10px] uppercase tracking-[0.14em] text-white/40 mb-2">Promo code</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-red-400">{discountLabel}</span>
        <button
          type="button"
          onClick={() => void copyCode(coupon.code)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white hover:border-red-500/40 hover:bg-red-600/10 transition-colors touch-manipulation"
        >
          <span className="font-mono tracking-wide">{coupon.code}</span>
          <svg className="w-3 h-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
        <Link
          href="/products"
          className="text-xs font-medium text-white/60 hover:text-red-400 transition-colors"
        >
          Shop →
        </Link>
      </div>
      {coupons.length > 1 && (
        <p className="text-[10px] text-white/35 mt-2">
          {activeIndex + 1} of {coupons.length} active offers
        </p>
      )}
    </div>
  );
};
