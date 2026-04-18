import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { couponService, Coupon } from '@/services/couponService';
import { CouponForm } from '@/components/CouponForm';
import { notificationService } from '@/services/notificationService';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Pagination } from '@/components/Pagination';

export default function AdminCoupons() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
      return;
    }

    fetchCoupons();
  }, [isAuthenticated, user, router, pagination.page]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const result = await couponService.getAll({
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      
      if (Array.isArray(result)) {
        // Backward compatibility
        setCoupons(result);
        setPagination(prev => ({ ...prev, totalCount: result.length, totalPages: 1 }));
      } else {
        setCoupons(result.coupons);
        setPagination({
          ...pagination,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
        });
      }
    } catch (error) {
      notificationService.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (coupon: Omit<Coupon, 'id' | 'createdAt' | 'usageCount'>) => {
    try {
      if (editingCoupon) {
        await couponService.update(editingCoupon.id, coupon);
        notificationService.success('Coupon updated successfully');
      } else {
        await couponService.create(coupon);
        notificationService.success('Coupon created successfully');
      }
      setShowForm(false);
      setEditingCoupon(null);
      fetchCoupons();
    } catch (error: any) {
      notificationService.error(
        error.response?.data?.message || 'Failed to save coupon'
      );
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      await couponService.delete(id);
      notificationService.success('Coupon deleted');
      fetchCoupons();
    } catch (error) {
      notificationService.error('Failed to delete coupon');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-primary min-h-screen">
        <div className="mb-4">
          <Link
            href="/admin"
            className="inline-flex items-center text-button hover:text-button-200 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Admin - Coupons</h1>
          <button
            onClick={() => {
              setEditingCoupon(null);
              setShowForm(true);
            }}
            className="bg-button text-button-text px-6 py-3 rounded-xl hover:bg-button-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Create Coupon
          </button>
        </div>

        {showForm ? (
          <div className="bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-8 mb-8 border-2 border-foreground/10">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </h2>
            <CouponForm
              coupon={editingCoupon || undefined}
              onSubmit={handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingCoupon(null);
              }}
            />
          </div>
        ) : (
          <div className="bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg overflow-hidden border-2 border-foreground/10">
            <table className="min-w-full divide-y divide-foreground/10">
              <thead className="bg-primary/60 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase">
                    Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase">
                    Value
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase">
                    Min Purchase
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase">
                    Usage
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-primary/40 divide-y divide-foreground/10">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="group hover:bg-primary/60 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-gold-400">{coupon.code}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">
                      {coupon.discountType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-foreground">
                        {coupon.discountType === 'Percentage'
                          ? `${coupon.discountValue}%`
                          : `$${coupon.discountValue.toFixed(2)}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">
                      ${coupon.minPurchaseAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-foreground">
                        {coupon.usageCount || 0}
                        {coupon.usageLimit && <span className="text-foreground/50"> / {coupon.usageLimit}</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full ${
                          coupon.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="text-button hover:text-button-200 font-semibold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="text-red-400 hover:text-red-300 font-semibold transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {!showForm && (
              <Pagination
                page={pagination.page}
                pageSize={pagination.pageSize}
                totalCount={pagination.totalCount}
                totalPages={pagination.totalPages}
                onPageChange={(page) => setPagination({ ...pagination, page })}
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

