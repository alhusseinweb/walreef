import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Phone, Mail, LogOut, Globe } from 'lucide-react';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { logout } from '../utils/auth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function CustomerProfile() {
  const { t, i18n } = useTranslation();
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
      toast.error('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
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
          <h1 className="text-xl md:text-2xl font-bold" data-testid="page-title">{t('myProfile')}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 mt-6 space-y-4">
        {/* Profile Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 md:p-6 border border-emerald-100 shadow-sm"
          data-testid="profile-info"
        >
          <h2 className="text-base md:text-lg font-bold text-[#1A4D2E] mb-4">بياناتي</h2>
          <div className="space-y-4">
            {/* Name */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <User className="w-5 h-5 text-[#1A4D2E]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">{t('name')}</p>
                <p className="font-bold text-[#1A4D2E] text-sm md:text-base" data-testid="profile-name">{profile?.name}</p>
              </div>
            </div>

            {/* Email */}
            {profile?.email && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600">{t('email')}</p>
                  <p className="font-bold text-[#1A4D2E] text-sm md:text-base break-all" data-testid="profile-email" dir="ltr">
                    {profile?.email}
                  </p>
                </div>
              </div>
            )}

            {/* Phone */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Phone className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">{t('phoneNumber')}</p>
                <p className="font-bold text-[#1A4D2E] text-sm md:text-base" data-testid="profile-phone" dir="ltr">
                  {profile?.phone}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Language Toggle */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={toggleLanguage}
          className="w-full bg-white text-[#1A4D2E] py-3 md:py-4 rounded-xl border border-emerald-200 hover:bg-emerald-50 font-medium flex items-center justify-center gap-2 shadow-sm"
          data-testid="language-toggle"
        >
          <Globe className="w-5 h-5" />
          <span className="text-sm md:text-base">
            {i18n.language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
          </span>
        </motion.button>

        {/* Logout Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={logout}
          className="w-full bg-red-600 text-white py-3 md:py-4 rounded-xl hover:bg-red-700 font-bold flex items-center justify-center gap-2 shadow-sm"
          data-testid="logout-btn"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm md:text-base">{t('logout')}</span>
        </motion.button>
      </div>

      <BottomNav />
    </div>
  );
}
