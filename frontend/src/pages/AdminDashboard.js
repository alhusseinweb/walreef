import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, TrendingUp, Receipt, LogOut, Gift, UserCog, Clock, ArrowUpCircle, ArrowDownCircle, MinusCircle, Settings, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { logout } from '../utils/auth';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, transactionsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/recent-transactions?limit=10')
      ]);
      setStats(statsRes.data);
      setRecentTransactions(transactionsRes.data.transactions || []);
    } catch (error) {
      toast.error(t('loadStatsFailed'));
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earned':
        return <ArrowUpCircle className="w-4 h-4 text-green-500" />;
      case 'redeemed':
        return <ArrowDownCircle className="w-4 h-4 text-blue-500" />;
      case 'return_deduction':
      case 'return':
      case 'returned':
        return <MinusCircle className="w-4 h-4 text-red-500" />;
      case 'manual_add':
        return <ArrowUpCircle className="w-4 h-4 text-purple-500" />;
      case 'manual_deduct':
        return <ArrowDownCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTransactionLabel = (type) => {
    const labels = {
      earned: t('pointsEarned'),
      redeemed: t('pointsRedeemed'),
      return_deduction: t('returnDeduction'),
      return: 'مرتجع',
      returned: 'مرتجع',
      manual_add: t('manualAddition'),
      manual_deduct: 'خصم يدوي',
      expired: t('expiredPointsTrans')
    };
    return labels[type] || type;
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'earned':
        return 'bg-green-100 text-green-800';
      case 'redeemed':
        return 'bg-blue-100 text-blue-800';
      case 'return_deduction':
      case 'return':
      case 'returned':
        return 'bg-red-100 text-red-800';
      case 'manual_add':
        return 'bg-purple-100 text-purple-800';
      case 'manual_deduct':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1A4D2E]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="sticky top-0 z-10 bg-[#1A4D2E] text-white py-4 px-4">
        <div className="flex justify-between items-center">
          <h1 className="text-lg sm:text-xl font-bold" data-testid="page-title">
            🏪 {t('adminDashboard')}
          </h1>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-sm transition-colors"
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t('logout')}</span>
          </button>
        </div>
      </header>

      <div className="p-4 max-w-6xl mx-auto">
        {/* Stats Cards - Single column on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm" data-testid="total-customers-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-[#1A4D2E]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">{t('totalCustomers')}</p>
                <p className="text-xl font-bold text-[#1A4D2E]" data-testid="total-customers">
                  {stats?.total_customers || 0}
                </p>
              </div>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +{stats?.new_customers_month || 0}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm" data-testid="active-points-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#FFC107]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">{t('activePoints')}</p>
                <p className="text-xl font-bold text-[#1A4D2E]" data-testid="active-points">
                  {stats?.total_active_points || 0}
                </p>
              </div>
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                {stats?.total_points_value_sar || 0} {t('sar')}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm" data-testid="total-invoices-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-[#10B981]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">{t('totalInvoices')}</p>
                <p className="text-xl font-bold text-[#1A4D2E]" data-testid="total-invoices">
                  {stats?.total_invoices || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - 2 columns on mobile */}
        <h2 className="text-sm font-bold text-gray-700 mb-3">الإجراءات السريعة</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {/* Points Redemption - Featured */}
          <Link
            to="/admin/redeem"
            className="col-span-2 sm:col-span-1 bg-gradient-to-br from-[#FFC107] to-yellow-500 rounded-xl p-4 shadow-md hover:shadow-lg transition-all"
            data-testid="redeem-link"
          >
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-[#1A4D2E]" />
              <div>
                <h3 className="text-base font-bold text-[#1A4D2E]">{t('pointsRedemption')}</h3>
                <p className="text-xs text-[#1A4D2E]/80">{t('redeemPointsRewards')}</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/customers"
            className="bg-white rounded-xl p-4 border border-emerald-200 hover:border-[#1A4D2E] shadow-sm hover:shadow-md transition-all"
            data-testid="customers-link"
          >
            <Users className="w-6 h-6 text-[#1A4D2E] mb-2" />
            <h3 className="text-sm font-bold text-[#1A4D2E]">{t('customersManagement')}</h3>
          </Link>

          <Link
            to="/admin/sync"
            className="bg-white rounded-xl p-4 border border-emerald-200 hover:border-[#1A4D2E] shadow-sm hover:shadow-md transition-all"
            data-testid="sync-link"
          >
            <Receipt className="w-6 h-6 text-[#1A4D2E] mb-2" />
            <h3 className="text-sm font-bold text-[#1A4D2E]">{t('syncManagement')}</h3>
          </Link>

          <Link
            to="/admin/staff"
            className="bg-white rounded-xl p-4 border border-emerald-200 hover:border-[#1A4D2E] shadow-sm hover:shadow-md transition-all"
            data-testid="staff-link"
          >
            <UserCog className="w-6 h-6 text-[#1A4D2E] mb-2" />
            <h3 className="text-sm font-bold text-[#1A4D2E]">{t('staffManagement')}</h3>
          </Link>

          <Link
            to="/admin/reports"
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 shadow-md hover:shadow-lg transition-all"
            data-testid="reports-link"
          >
            <BarChart3 className="w-6 h-6 text-white mb-2" />
            <h3 className="text-sm font-bold text-white">📊 التقارير</h3>
          </Link>

          <Link
            to="/admin/settings"
            className="bg-white rounded-xl p-4 border border-emerald-200 hover:border-[#1A4D2E] shadow-sm hover:shadow-md transition-all"
            data-testid="settings-link"
          >
            <Settings className="w-6 h-6 text-[#1A4D2E] mb-2" />
            <h3 className="text-sm font-bold text-[#1A4D2E]">{t('settings')}</h3>
          </Link>
        </div>

        {/* Recent Transactions Section */}
        <div className="bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden" data-testid="recent-transactions-section">
          <div className="bg-[#1A4D2E] text-white px-4 py-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <h2 className="text-sm font-bold">{t('recentTransactions')}</h2>
          </div>
          
          {recentTransactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              {t('noRecentTransactions')}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">{t('customer')}</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">{t('transactionType')}</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">{t('points')}</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">{t('date')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentTransactions.map((trans, index) => (
                      <tr key={trans.id || index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 text-sm">{trans.customer_name}</span>
                            <span className="text-xs text-gray-500" dir="ltr">{trans.customer_phone}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(trans.transaction_type)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionColor(trans.transaction_type)}`}>
                              {getTransactionLabel(trans.transaction_type)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-bold text-sm ${trans.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trans.points >= 0 ? '+' : ''}{trans.points?.toFixed(0)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {formatDate(trans.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden divide-y divide-gray-100">
                {recentTransactions.map((trans, index) => (
                  <div key={trans.id || index} className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{trans.customer_name}</p>
                        <p className="text-xs text-gray-500" dir="ltr">{trans.customer_phone}</p>
                      </div>
                      <span className={`font-bold text-sm ${trans.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trans.points >= 0 ? '+' : ''}{trans.points?.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        {getTransactionIcon(trans.transaction_type)}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTransactionColor(trans.transaction_type)}`}>
                          {getTransactionLabel(trans.transaction_type)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(trans.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}