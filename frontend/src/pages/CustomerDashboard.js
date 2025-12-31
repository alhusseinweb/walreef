import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Gift, TrendingUp, Clock } from 'lucide-react';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function CustomerDashboard() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/customer/profile');
      setProfile(response.data);
    } catch (error) {
      toast.error(t('loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen" data-testid="loading-spinner">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A4D2E]"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#F9FAF9] pb-24">
      <div className="bg-[#1A4D2E] text-white py-8 px-4">
        <div className="container mx-auto max-w-md">
          <h1 className="text-2xl font-bold mb-2" data-testid="welcome-message">
            {t('welcomeCustomer')}، {profile?.name}
          </h1>
          <p className="text-emerald-200" data-testid="phone-display">{profile?.phone}</p>
          <p className="text-xs text-emerald-100 mt-1">
            {profile?.active_points?.toFixed(2) || 0} {t('points')} = {profile?.points_value_sar?.toFixed(2) || 0} {t('sar')} {t('rewardValue')}
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-md px-4 -mt-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white to-emerald-50 border-2 border-[#FFC107] rounded-2xl p-6 shadow-xl mb-6"
          data-testid="points-card"
        >
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">{t('activePoints')}</p>
            <p className="text-5xl font-bold text-[#FFC107] mb-2" data-testid="active-points">
              {profile?.active_points?.toFixed(2) || 0}
            </p>
            <div className="mt-2 bg-white/80 rounded-lg px-4 py-2">
              <p className="text-xs text-gray-600">{t('rewardValue')}</p>
              <p className="text-2xl font-bold text-[#1A4D2E]" data-testid="points-value">
                {profile?.points_value_sar?.toFixed(2) || 0} {t('sar')}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm"
            data-testid="expiring-points-card"
          >
            <Clock className="w-8 h-8 text-orange-500 mb-2" />
            <p className="text-xs text-gray-600 mb-1">{t('expiringPoints')}</p>
            <p className="text-2xl font-bold text-[#1A4D2E]" data-testid="expiring-points">
              {profile?.expiring_points?.toFixed(0) || 0}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm"
            data-testid="total-points-card"
          >
            <TrendingUp className="w-8 h-8 text-[#10B981] mb-2" />
            <p className="text-xs text-gray-600 mb-1">{t('totalPoints')}</p>
            <p className="text-2xl font-bold text-[#1A4D2E]" data-testid="total-points">
              {profile?.total_points?.toFixed(0) || 0}
            </p>
          </motion.div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm" data-testid="info-section">
          <h3 className="font-bold text-[#1A4D2E] mb-3 flex items-center gap-2">
            <Gift className="w-5 h-5" />
            كيف تكسب المزيد من النقاط؟
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• كل 10 ريال = نقطة واحدة</li>
            <li>• النقاط صالحة لمدة سنة واحدة</li>
            <li>• تحقق من عملياتك في صفحة العمليات</li>
          </ul>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}