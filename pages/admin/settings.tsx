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
  const [shippingStandard, setShippingStandard] = useState('7');
  const [shippingInternational, setShippingInternational] = useState('10');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
      return;
    }

    Promise.all([storeSettingsService.getSalesTax(), storeSettingsService.getShipping()])
      .then(([tax, ship]) => {
        setTaxPercent(String(tax.salesTaxPercent));
        setShippingStandard(String(ship.standardUsd));
        setShippingInternational(String(ship.internationalUsd));
      })
      .catch(() => notificationService.error('Failed to load store settings'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsedTax = parseFloat(taxPercent);
    const parsedStandard = parseFloat(shippingStandard);
    const parsedInternational = parseFloat(shippingInternational);
    if (Number.isNaN(parsedTax) || parsedTax < 0 || parsedTax > 100) {
      notificationService.error('Enter a tax percent between 0 and 100');
      return;
    }
    if (
      Number.isNaN(parsedStandard) ||
      Number.isNaN(parsedInternational) ||
      parsedStandard < 0 ||
      parsedInternational < 0
    ) {
      notificationService.error('Enter valid shipping amounts (0 or greater)');
      return;
    }
    setSaving(true);
    try {
      const [tax, ship] = await Promise.all([
        storeSettingsService.updateSalesTax(parsedTax),
        storeSettingsService.updateShipping(parsedStandard, parsedInternational),
      ]);
      setTaxPercent(String(tax.salesTaxPercent));
      setShippingStandard(String(ship.standardUsd));
      setShippingInternational(String(ship.internationalUsd));
      notificationService.success('Store settings updated');
    } catch {
      notificationService.error('Failed to save settings');
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
          Sales tax and flat shipping rates used at cart and checkout. US addresses use standard shipping; all
          other countries use international.
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="shipping-standard" className="block text-sm font-semibold text-white mb-2">
                US standard shipping ($)
              </label>
              <input
                id="shipping-standard"
                type="number"
                min={0}
                step={0.01}
                value={shippingStandard}
                onChange={(e) => setShippingStandard(e.target.value)}
                className="w-full px-4 py-3 border border-foreground/20 rounded-xl bg-black/30 text-foreground"
              />
            </div>
            <div>
              <label htmlFor="shipping-international" className="block text-sm font-semibold text-white mb-2">
                International shipping ($)
              </label>
              <input
                id="shipping-international"
                type="number"
                min={0}
                step={0.01}
                value={shippingInternational}
                onChange={(e) => setShippingInternational(e.target.value)}
                className="w-full px-4 py-3 border border-foreground/20 rounded-xl bg-black/30 text-foreground"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-button text-button-text font-semibold hover:bg-button-200 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
