import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { SEO } from '@/components/SEO';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { notificationService } from '@/services/notificationService';
import { storeSettingsService } from '@/services/storeSettingsService';
import { adminDashboardHref } from '@/lib/adminDashboard';

export default function AdminStoreSettings() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [taxPercent, setTaxPercent] = useState('10');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
      return;
    }

    storeSettingsService
      .getSalesTax()
      .then((s) => setTaxPercent(String(s.salesTaxPercent)))
      .catch(() => notificationService.error('Failed to load store settings'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(taxPercent);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
      notificationService.error('Enter a tax percent between 0 and 100');
      return;
    }
    setSaving(true);
    try {
      const updated = await storeSettingsService.updateSalesTax(parsed);
      setTaxPercent(String(updated.salesTaxPercent));
      notificationService.success('Sales tax updated');
    } catch {
      notificationService.error('Failed to save sales tax');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-24">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="Store settings" noindex />
      <div className="page-shell py-8 max-w-xl">
        <Link href={adminDashboardHref()} className="text-button hover:text-button-200 text-sm font-medium">
          ← Back to dashboard
        </Link>
        <h1 className="text-3xl font-bold text-foreground mt-4 mb-2">Store settings</h1>
        <p className="text-foreground/70 mb-8">
          Global sales tax applied to all products at cart, checkout, and payment.
        </p>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-foreground/15 bg-primary/60 backdrop-blur-md p-6 space-y-5"
        >
          <div>
            <label htmlFor="sales-tax-percent" className="block text-sm font-semibold text-white mb-2">
              Sales tax (%)
            </label>
            <input
              id="sales-tax-percent"
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={taxPercent}
              onChange={(e) => setTaxPercent(e.target.value)}
              className="w-full px-4 py-3 border border-foreground/20 rounded-xl bg-black/30 text-foreground"
            />
            <p className="text-xs text-foreground/55 mt-2">
              Default is 10%. Storefront shows estimated tax on product prices; checkout uses this rate on
              subtotal (after discounts).
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-button text-button-text font-semibold hover:bg-button-200 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save tax rate'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
