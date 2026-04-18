import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { customerService, Customer } from '@/services/customerService';
import { notificationService } from '@/services/notificationService';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Pagination } from '@/components/Pagination';

export default function AdminCustomers() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
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

    fetchCustomers();
  }, [isAuthenticated, user, router, pagination.page, search]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const result = await customerService.getAll(
        pagination.page,
        pagination.pageSize,
        search || undefined
      );
      
      setCustomers(result.customers);
      setPagination(prev => ({
        ...prev,
        totalCount: result.totalCount,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      }));
    } catch (error) {
      notificationService.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchCustomers();
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleCustomerClick = async (customerId: string) => {
    try {
      const customer = await customerService.getById(customerId);
      setSelectedCustomer(customer as any);
    } catch (error: any) {
      console.error('Error loading customer details:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load customer details';
      notificationService.error(errorMessage);
    }
  };

  if (loading && customers.length === 0) {
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
          <h1 className="text-4xl font-bold text-foreground">Customer Management</h1>
        </div>

        {/* Search */}
        <div className="bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-6 mb-6 border-2 border-foreground/10">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="flex-1 px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 transition-all"
            />
            <button
              type="submit"
              className="bg-button text-button-text px-6 py-3 rounded-xl hover:bg-button-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="bg-primary/60 text-foreground px-6 py-3 rounded-xl hover:bg-primary/80 font-semibold border border-foreground/20 transition-all"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Customers Table */}
        <div className="bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg overflow-hidden border-2 border-foreground/10">
          <table className="min-w-full divide-y divide-foreground/10">
            <thead className="bg-primary/60 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                  Total Orders
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                  Cancellations
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-primary/40 divide-y divide-foreground/10">
              {customers.map((customer) => (
                <tr key={customer.id} className="group hover:bg-primary/60 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-foreground group-hover:text-button transition-colors">{customer.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground/70 group-hover:text-foreground/90 transition-colors">{customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                      customer.role === 'Admin' 
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {customer.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">
                    {customer.provider || 'Email'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-foreground">{customer.totalOrders}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gold-400">${customer.totalSpent.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                      customer.cancellationCount > 0
                        ? 'text-red-400 bg-red-500/20 border border-red-500/30'
                        : 'text-foreground/70'
                    }`}>
                      {customer.cancellationCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {customer.orderBlockedUntil && new Date(customer.orderBlockedUntil) > new Date() ? (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                        Blocked
                      </span>
                    ) : (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleCustomerClick(customer.id)}
                      className="text-button hover:text-button-200 font-semibold transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && !loading && (
            <div className="text-center py-12 text-foreground/60">
              No customers found
            </div>
          )}
        </div>

        {/* Pagination */}
        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalCount={pagination.totalCount}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />

        {/* Customer Detail Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-primary/95 backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 border-2 border-foreground/20 shadow-glass-lg">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-foreground">Customer Details</h2>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-5">
                <div className="bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-foreground/10">
                  <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1">Name</p>
                  <p className="font-bold text-foreground">{selectedCustomer.name}</p>
                </div>
                <div className="bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-foreground/10">
                  <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1">Email</p>
                  <p className="font-semibold text-foreground">{selectedCustomer.email}</p>
                </div>
                <div className="bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-foreground/10">
                  <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1">Role</p>
                  <p className="font-semibold text-foreground">{selectedCustomer.role}</p>
                </div>
                <div className="bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-foreground/10">
                  <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1">Provider</p>
                  <p className="font-semibold text-foreground">{selectedCustomer.provider || 'Email'}</p>
                </div>
                <div className="bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-foreground/10">
                  <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1">Total Orders</p>
                  <p className="font-bold text-2xl text-foreground">{selectedCustomer.totalOrders}</p>
                </div>
                <div className="bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-foreground/10">
                  <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1">Total Spent</p>
                  <p className="font-bold text-2xl text-gold-400">${selectedCustomer.totalSpent.toFixed(2)}</p>
                </div>
                <div className="bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-foreground/10">
                  <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1">Cancellation Count</p>
                  <p className={`font-semibold text-lg ${
                    selectedCustomer.cancellationCount > 0 ? 'text-red-400' : 'text-foreground'
                  }`}>
                    {selectedCustomer.cancellationCount}
                  </p>
                </div>
                {selectedCustomer.orderBlockedUntil && (
                  <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-4 border-2 border-red-500/30">
                    <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-1">Blocked Until</p>
                    <p className="font-semibold text-red-300">
                      {new Date(selectedCustomer.orderBlockedUntil).toLocaleString()}
                    </p>
                  </div>
                )}
                <div className="bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-foreground/10">
                  <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1">Member Since</p>
                  <p className="font-semibold text-foreground">
                    {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

