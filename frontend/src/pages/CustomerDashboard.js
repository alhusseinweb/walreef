import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Gift, TrendingUp, Clock, Award } from 'lucide-react';
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
      {/* Header */}
      <div className="bg-[#1A4D2E] text-white py-6 md:py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold mb-2" data-testid="welcome-message">
            {t('welcomeCustomer')}، {profile?.name}
          </h1>
          <p className="text-emerald-200 text-sm md:text-base" data-testid="phone-display">{profile?.phone}</p>
          <p className="text-xs md:text-sm text-emerald-100 mt-1">
            {profile?.active_points?.toFixed(2) || 0} {t('points')} = {profile?.points_value_sar?.toFixed(2) || 0} {t('sar')} {t('rewardValue')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 -mt-6">
        {/* Main Points Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white to-emerald-50 border-2 border-[#FFC107] rounded-2xl p-6 md:p-8 shadow-xl mb-6"
          data-testid="points-card"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="w-5 h-5 md:w-6 md:h-6 text-[#FFC107]" />
              <p className="text-sm md:text-base text-gray-600">{t('activePoints')}</p>
            </div>
            <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#FFC107] mb-3 md:mb-4" data-testid="active-points">
              {profile?.active_points?.toFixed(2) || 0}
            </p>
            <div className="bg-white/80 rounded-lg px-4 py-3">
              <p className="text-xs md:text-sm text-gray-600 mb-1">{t('rewardValue')}</p>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-[#1A4D2E]" data-testid="points-value">
                {profile?.points_value_sar?.toFixed(2) || 0} {t('sar')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 md:p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow"
            data-testid="expiring-points-card"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs md:text-sm text-gray-600 mb-1">{t('expiringPoints')}</p>
                <p className="text-xl md:text-2xl font-bold text-[#1A4D2E]" data-testid="expiring-points">
                  {profile?.expiring_points?.toFixed(0) || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 md:p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow"
            data-testid="total-points-card"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-[#10B981]" />
              </div>
              <div className="flex-1">
                <p className="text-xs md:text-sm text-gray-600 mb-1">{t('totalPoints')}</p>
                <p className="text-xl md:text-2xl font-bold text-[#1A4D2E]" data-testid="total-points">
                  {profile?.total_points?.toFixed(0) || 0}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 md:p-6 border border-emerald-100 shadow-sm"
          data-testid="info-section"
        >
          <h3 className="font-bold text-[#1A4D2E] mb-3 flex items-center gap-2 text-base md:text-lg">
            <Gift className="w-5 h-5" />
            كيف تكسب المزيد من النقاط؟
          </h3>
          <ul className="space-y-2 text-sm md:text-base text-gray-600">
            <li>• كل 10 ريال = نقطة واحدة</li>
            <li>• النقاط صالحة لمدة سنة واحدة</li>
            <li>• تحقق من عملياتك في صفحة العمليات</li>
          </ul>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
