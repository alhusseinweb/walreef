import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Gift, TrendingUp, Settings, UserCog, FileText, RefreshCw, LogOut, Clock, Award, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { logout } from '../utils/auth';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await api.get('/admin/stats');
      setStats(statsResponse.data);

      // Fetch recent transactions
      const transactionsResponse = await api.get('/admin/recent-transactions');
      setRecentTransactions(transactionsResponse.data.transactions || []);
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('فشل تحميل بيانات لوحة التحكم');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earned':
        return <ShoppingCart className="w-4 h-4 text-green-600" />;
      case 'redeemed':
        return <Gift className="w-4 h-4 text-orange-600" />;
      case 'expired':
        return <Clock className="w-4 h-4 text-gray-600" />;
      default:
        return <Award className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'earned':
        return 'bg-green-50 border-green-200';
      case 'redeemed':
        return 'bg-orange-50 border-orange-200';
      case 'expired':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
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
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-lg sm:text-xl font-bold" data-testid="page-title">
            🏪 لوحة التحكم
          </h1>
          <button
            onClick={logout}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            data-testid="logout-btn"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm" data-testid="stat-customers">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Users className="w-6 h-6 text-[#1A4D2E]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-[#1A4D2E]">{stats?.total_customers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-yellow-100 shadow-sm" data-testid="stat-points">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Gift className="w-6 h-6 text-[#FFC107]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">النقاط النشطة</p>
                <p className="text-2xl font-bold text-[#FFC107]">{(stats?.total_active_points || 0).toFixed(0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-purple-100 shadow-sm sm:col-span-2 lg:col-span-1" data-testid="stat-value">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">قيمة النقاط بالريال</p>
                <p className="text-2xl font-bold text-purple-600">{(stats?.points_value_sar || 0).toFixed(2)} ريال</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          <Link
            to="/admin/customers"
            className="bg-white rounded-xl p-4 md:p-6 text-center hover:shadow-md transition-shadow border border-gray-200"
            data-testid="nav-customers"
          >
            <Users className="w-8 h-8 md:w-10 md:h-10 text-[#1A4D2E] mx-auto mb-2 md:mb-3" />
            <p className="font-bold text-[#1A4D2E] text-sm md:text-base">{t('customers')}</p>
          </Link>

          <Link
            to="/admin/redeem"
            className="bg-white rounded-xl p-4 md:p-6 text-center hover:shadow-md transition-shadow border border-gray-200"
            data-testid="nav-redeem"
          >
            <Gift className="w-8 h-8 md:w-10 md:h-10 text-[#FFC107] mx-auto mb-2 md:mb-3" />
            <p className="font-bold text-[#FFC107] text-sm md:text-base">{t('redeemPoints')}</p>
          </Link>

          <Link
            to="/admin/staff"
            className="bg-white rounded-xl p-4 md:p-6 text-center hover:shadow-md transition-shadow border border-gray-200"
            data-testid="nav-staff"
          >
            <UserCog className="w-8 h-8 md:w-10 md:h-10 text-blue-600 mx-auto mb-2 md:mb-3" />
            <p className="font-bold text-blue-600 text-sm md:text-base">{t('staff')}</p>
          </Link>

          <Link
            to="/admin/reports"
            className="bg-white rounded-xl p-4 md:p-6 text-center hover:shadow-md transition-shadow border border-gray-200"
            data-testid="nav-reports"
          >
            <FileText className="w-8 h-8 md:w-10 md:h-10 text-purple-600 mx-auto mb-2 md:mb-3" />
            <p className="font-bold text-purple-600 text-sm md:text-base">{t('reports')}</p>
          </Link>

          <Link
            to="/admin/sync"
            className="bg-white rounded-xl p-4 md:p-6 text-center hover:shadow-md transition-shadow border border-gray-200"
            data-testid="nav-sync"
          >
            <RefreshCw className="w-8 h-8 md:w-10 md:h-10 text-orange-600 mx-auto mb-2 md:mb-3" />
            <p className="font-bold text-orange-600 text-sm md:text-base">{t('sync')}</p>
          </Link>

          <Link
            to="/admin/settings"
            className="bg-white rounded-xl p-4 md:p-6 text-center hover:shadow-md transition-shadow border border-gray-200 col-span-2 md:col-span-1"
            data-testid="nav-settings"
          >
            <Settings className="w-8 h-8 md:w-10 md:h-10 text-gray-600 mx-auto mb-2 md:mb-3" />
            <p className="font-bold text-gray-600 text-sm md:text-base">الإعدادات</p>
          </Link>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">📋 آخر العمليات</h2>
            <Link to="/admin/reports" className="text-sm text-[#1A4D2E] hover:underline">
              عرض الكل
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">لا توجد عمليات حديثة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.slice(0, 5).map((transaction, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${getTransactionColor(transaction.transaction_type)}`}
                  data-testid={`transaction-${index}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getTransactionIcon(transaction.transaction_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {transaction.customer_name || 'عميل'}
                      </p>
                      <p className="text-xs text-gray-600 truncate">{transaction.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(transaction.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    <p className={`text-base font-bold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points.toFixed(0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
