import { useEffect, useState } from 'react';
import Link from 'next/link';
import { couponService, Coupon } from '@/services/couponService';

export const CouponSlider: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const result = await couponService.getPromo();
        const data = Array.isArray(result) ? result : [];
        // Filter active coupons that haven't expired
        const activeCoupons = data.filter(coupon => {
          if (!coupon.isActive) return false;
          if (coupon.expiryDate) {
            const expiry = new Date(coupon.expiryDate);
            return expiry > new Date();
          }
          return true;
        });
        setCoupons(activeCoupons);
      } catch (error) {
        console.error('Failed to load coupons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  if (loading || coupons.length === 0) {
    return null;
  }

  // Duplicate coupons for seamless loop
  const duplicatedCoupons = [...coupons, ...coupons];

  const formatDiscount = (coupon: Coupon) => {
    // Handle case-insensitive comparison and ensure discountValue is valid
    const discountType = String(coupon.discountType || '').toLowerCase();
    const discountValue = coupon.discountValue || 0;
    
    if (discountValue <= 0) {
      return 'Special Offer';
    }
    
    if (discountType === 'percentage' || discountType === 'Percentage') {
      return `${Math.round(discountValue)}% OFF`;
    } else {
      return `$${discountValue.toFixed(0)} OFF`;
    }
  };

  return (
    <div className="bg-primary text-foreground py-3 overflow-hidden relative shadow-lg">
      <div className="flex items-center h-full">
        {/* Label */}
        <div className="flex-shrink-0 flex items-center gap-2 px-4 md:px-6 z-10 bg-primary">
          <svg className="w-5 h-5 text-button" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-bold text-button hidden sm:inline tracking-wide drop-shadow-lg">SPECIAL OFFERS</span>
        </div>
        
        {/* Scrolling Coupons */}
        <div className="flex-1 overflow-hidden">
          <div className="flex animate-scroll whitespace-nowrap">
            {duplicatedCoupons.map((coupon, index) => (
              <div
                key={`${coupon.id}-${index}`}
                className="flex items-center gap-4 mx-8 flex-shrink-0 group"
              >
                {/* Discount Badge */}
                <Link
                  href="/products"
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 hover:scale-105 transition-all cursor-pointer group/item"
                >
                  <span className="font-extrabold text-button text-base tracking-tight drop-shadow-lg">
                    {formatDiscount(coupon)}
                  </span>
                  <span className="font-bold text-button-text text-xs bg-button px-3 py-1 rounded-md border border-button-300/50 shadow-md group-hover/item:bg-button-200 transition-colors">
                    {coupon.code}
                  </span>
                </Link>
                {coupon.minPurchaseAmount > 0 && (
                  <span className="text-xs text-foreground/70 font-medium hidden md:inline">
                    Min. ${coupon.minPurchaseAmount}
                  </span>
                )}
                <span className="text-foreground/50 text-xl font-light">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Gradient overlays for smooth fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-primary to-transparent pointer-events-none z-20"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-primary to-transparent pointer-events-none z-20"></div>
    </div>
  );
};

