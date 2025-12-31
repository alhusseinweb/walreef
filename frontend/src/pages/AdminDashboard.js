import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Gift, TrendingUp, Settings, UserCog, FileText, RefreshCw, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { logout } from '../utils/auth';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      toast.error(t('loadStatsFailed'));
    } finally {
      setLoading(false);
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
            🏪 {t('adminDashboard')}
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
      <div className="max-w-7xl mx-auto p-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm" data-testid="stat-customers">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Users className="w-6 h-6 text-[#1A4D2E]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('totalCustomers')}</p>
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
                <p className="text-sm text-gray-600">{t('activePoints')}</p>
                <p className="text-2xl font-bold text-[#FFC107]">{stats?.total_active_points?.toFixed(0) || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-purple-100 shadow-sm sm:col-span-2 lg:col-span-1" data-testid="stat-value">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('pointsValueSAR')}</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.points_value_sar?.toFixed(2) || 0} {t('sar')}</p>
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
            <p className="font-bold text-gray-600 text-sm md:text-base">{t('settings')}</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
