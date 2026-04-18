import React, { useState } from 'react';
import { Coupon } from '@/services/couponService';

interface CouponFormProps {
  coupon?: Coupon;
  onSubmit: (coupon: Omit<Coupon, 'id' | 'createdAt' | 'usageCount'>) => Promise<void>;
  onCancel: () => void;
}

export const CouponForm: React.FC<CouponFormProps> = ({ coupon, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<{
    code: string;
    discountType: 'Percentage' | 'FixedAmount';
    discountValue: number;
    expiryDate: string;
    usageLimit: string | number;
    minPurchaseAmount: number;
    maxDiscountAmount: string | number;
    isActive: boolean;
  }>({
    code: coupon?.code || '',
    discountType: coupon?.discountType || 'Percentage',
    discountValue: coupon?.discountValue || 0,
    expiryDate: coupon?.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
    usageLimit: coupon?.usageLimit || '',
    minPurchaseAmount: coupon?.minPurchaseAmount || 0,
    maxDiscountAmount: coupon?.maxDiscountAmount || '',
    isActive: coupon?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        code: formData.code,
        discountType: formData.discountType as 'Percentage' | 'FixedAmount',
        discountValue: formData.discountValue,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        minPurchaseAmount: formData.minPurchaseAmount,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
        isActive: formData.isActive,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Coupon Code *
        </label>
        <input
          type="text"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="SAVE20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Discount Type *
        </label>
        <select
          value={formData.discountType}
          onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'Percentage' | 'FixedAmount' })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="Percentage">Percentage</option>
          <option value="FixedAmount">Fixed Amount</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Discount Value *
        </label>
        <input
          type="number"
          value={formData.discountValue}
          onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
          required
          min="0"
          step="0.01"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder={formData.discountType === 'Percentage' ? '20' : '10.00'}
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.discountType === 'Percentage'
            ? 'Enter percentage (e.g., 20 for 20%)'
            : 'Enter amount in dollars'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Purchase Amount *
        </label>
        <input
          type="number"
          value={formData.minPurchaseAmount}
          onChange={(e) => setFormData({ ...formData, minPurchaseAmount: Number(e.target.value) })}
          required
          min="0"
          step="0.01"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {formData.discountType === 'Percentage' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Discount Amount (Optional)
          </label>
          <input
            type="number"
            value={formData.maxDiscountAmount}
            onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="50.00"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Expiry Date (Optional)
        </label>
        <input
          type="date"
          value={formData.expiryDate}
          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Usage Limit (Optional)
        </label>
        <input
          type="number"
          value={formData.usageLimit}
          onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
          min="1"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="100"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
          Active
        </label>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : coupon ? 'Update Coupon' : 'Create Coupon'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

