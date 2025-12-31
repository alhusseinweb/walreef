import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Mail } from 'lucide-react';
import api from '../utils/api';
import { setAuthToken } from '../utils/auth';
import { toast } from 'sonner';

export default function CustomerRegister() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/customer/register', formData);
      setAuthToken(response.data.access_token, 'customer');
      toast.success(t('registrationSuccess'));
      navigate('/customer/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'فشل التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAF9] px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-emerald-100">
        <div className="text-center mb-8">
          <img 
            src="https://customer-assets.emergentagent.com/job_alrif-points/artifacts/r9bwchf3_Al%20Reef%20logo-3.png" 
            alt="Logo" 
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-[#1A4D2E]" data-testid="register-title">{t('register')}</h1>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline w-4 h-4 ml-2" />
              {t('name')}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-[#1A4D2E] focus:border-transparent"
              data-testid="name-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline w-4 h-4 ml-2" />
              {t('email')}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-[#1A4D2E] focus:border-transparent"
              data-testid="email-input"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline w-4 h-4 ml-2" />
              {t('phoneNumber')}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="05XXXXXXXX"
              className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-[#1A4D2E] focus:border-transparent"
              data-testid="phone-input"
              dir="ltr"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A4D2E] text-white py-3 rounded-xl font-bold hover:bg-[#143d24] disabled:opacity-50"
            data-testid="register-btn"
          >
            {loading ? t('loading') : t('register')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            لديك حساب؟{' '}
            <Link to="/customer/login" className="text-[#1A4D2E] font-bold hover:underline" data-testid="login-link">
              {t('login')}
            </Link>
          </p>
        </div>
        <Link to="/" className="block mt-4 text-center text-sm text-gray-600 hover:text-[#1A4D2E]" data-testid="home-link">
          {t('back')}
        </Link>
      </div>
    </div>
  );
}