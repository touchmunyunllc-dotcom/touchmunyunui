import { useEffect, useState } from 'react';
import { addressService, Address, CreateAddressData } from '@/services/addressService';
import { notificationService } from '@/services/notificationService';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const inputClassName =
  'w-full px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-red-500/30 focus:border-red-500/40 bg-black/20 backdrop-blur-sm text-foreground placeholder-foreground/45 transition-all';

const emptyForm: CreateAddressData = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'United States',
  phone: '',
  isDefault: false,
};

export function ProfileAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateAddressData>(emptyForm);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const rows = await addressService.getUserAddresses();
      setAddresses(rows);
    } catch {
      notificationService.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAddresses();
  }, []);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startCreate = () => {
    setEditingId(null);
    setFormData({ ...emptyForm, isDefault: addresses.length === 0 });
    setShowForm(true);
  };

  const startEdit = (address: Address) => {
    setEditingId(address.id);
    setFormData({
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone || '',
      isDefault: address.isDefault,
    });
    setShowForm(true);
  };

  const validateForm = () => {
    if (!formData.addressLine1.trim()) {
      notificationService.error('Street address is required');
      return false;
    }
    if (!formData.city.trim()) {
      notificationService.error('City is required');
      return false;
    }
    if (!formData.state.trim()) {
      notificationService.error('State is required');
      return false;
    }
    if (!formData.postalCode.trim()) {
      notificationService.error('Postal code is required');
      return false;
    }
    if (!formData.country.trim()) {
      notificationService.error('Country is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload: CreateAddressData = {
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2?.trim() || undefined,
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        country: formData.country.trim(),
        phone: formData.phone?.trim() || undefined,
        isDefault: formData.isDefault,
      };

      if (editingId) {
        await addressService.updateAddress(editingId, payload);
        notificationService.success('Address updated');
      } else {
        await addressService.createAddress(payload);
        notificationService.success('Address added');
      }
      resetForm();
      await loadAddresses();
    } catch (error: any) {
      notificationService.error(error.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    try {
      await addressService.deleteAddress(id);
      notificationService.success('Address deleted');
      if (editingId === id) resetForm();
      await loadAddresses();
    } catch {
      notificationService.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressService.setDefaultAddress(id);
      notificationService.success('Default address updated');
      await loadAddresses();
    } catch {
      notificationService.error('Failed to set default address');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 pb-6 border-b border-foreground/10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="h-0.5 w-10 bg-gradient-to-r from-red-600 to-gold-600 rounded-full mb-4" />
          <h2 className="text-xl font-bold text-foreground">Shipping addresses</h2>
          <p className="text-sm text-foreground/60 mt-1">
            Manage addresses used at checkout. Your default address is pre-selected when you order.
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={startCreate}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors touch-manipulation"
          >
            Add address
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-5 rounded-2xl border border-foreground/15 bg-black/15 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            {editingId ? 'Edit address' : 'New address'}
          </h3>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Street address <span className="text-gold-400">*</span>
            </label>
            <input
              type="text"
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              className={inputClassName}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Apartment, suite, etc.</label>
            <input
              type="text"
              value={formData.addressLine2}
              onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
              className={inputClassName}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">City <span className="text-gold-400">*</span></label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={inputClassName}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">State <span className="text-gold-400">*</span></label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className={inputClassName}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">ZIP / postal code <span className="text-gold-400">*</span></label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className={inputClassName}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Country <span className="text-gold-400">*</span></label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className={inputClassName}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={inputClassName}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-4 h-4 rounded border-foreground/30 text-red-600 focus:ring-red-500/50"
            />
            <span className="text-sm text-foreground">Set as default shipping address</span>
          </label>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2.5 rounded-xl border border-foreground/20 text-foreground hover:bg-white/5 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : editingId ? 'Update address' : 'Save address'}
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-foreground/20 p-8 text-center">
          <p className="text-foreground font-medium mb-1">No saved addresses yet</p>
          <p className="text-sm text-foreground/60 mb-4">Add one now to speed up checkout.</p>
          {!showForm && (
            <button
              type="button"
              onClick={startCreate}
              className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700"
            >
              Add your first address
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {addresses.map((address) => (
            <li
              key={address.id}
              className="rounded-2xl border border-foreground/15 bg-black/15 p-4 sm:p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground">{address.addressLine1}</p>
                    {address.isDefault && (
                      <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
                        Default
                      </span>
                    )}
                  </div>
                  {address.addressLine2 && (
                    <p className="text-sm text-foreground/70">{address.addressLine2}</p>
                  )}
                  <p className="text-sm text-foreground/70">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="text-sm text-foreground/70">{address.country}</p>
                  {address.phone && (
                    <p className="text-sm text-foreground/60 mt-1">Phone: {address.phone}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(address.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-foreground/20 text-foreground hover:border-red-500/40 hover:text-red-400"
                    >
                      Make default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => startEdit(address)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-foreground/20 text-foreground hover:border-button/40"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(address.id)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
