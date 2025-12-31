import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Phone, Mail, LogOut } from 'lucide-react';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { logout } from '../utils/auth';
import { toast } from 'sonner';

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
      <div className="bg-[#1A4D2E] text-white py-6 px-4">
        <div className="container mx-auto max-w-md">
          <h1 className="text-2xl font-bold" data-testid="page-title">{t('myProfile')}</h1>
        </div>
      </div>

      <div className="container mx-auto max-w-md px-4 mt-6 space-y-4">
        <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm" data-testid="profile-info">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-[#1A4D2E]" />
              <div>
                <p className="text-xs text-gray-600">{t('name')}</p>
                <p className="font-bold text-[#1A4D2E]" data-testid="profile-name">{profile?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#1A4D2E]" />
              <div>
                <p className="text-xs text-gray-600">{t('email')}</p>
                <p className="font-bold text-[#1A4D2E]" data-testid="profile-email" dir="ltr">{profile?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#1A4D2E]" />
              <div>
                <p className="text-xs text-gray-600">{t('phoneNumber')}</p>
                <p className="font-bold text-[#1A4D2E]" data-testid="profile-phone" dir="ltr">{profile?.phone}</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={toggleLanguage}
          className="w-full bg-white text-[#1A4D2E] py-3 rounded-xl border border-emerald-200 hover:bg-emerald-50 font-medium"
          data-testid="language-toggle"
        >
          {i18n.language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
        </button>

        <button
          onClick={logout}
          className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 font-bold flex items-center justify-center gap-2"
          data-testid="logout-btn"
        >
          <LogOut className="w-5 h-5" />
          {t('logout')}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}