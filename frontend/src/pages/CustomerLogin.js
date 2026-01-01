import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, Key, Shield, AlertTriangle, X, Headphones, Smartphone } from 'lucide-react';
import api from '../utils/api';
import { setAuthToken } from '../utils/auth';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';

// Helper functions for device token management
const DEVICE_TOKEN_KEY = 'trusted_device_token';
const DEVICE_PHONE_KEY = 'trusted_device_phone';

const getStoredDeviceToken = () => localStorage.getItem(DEVICE_TOKEN_KEY);
const getStoredDevicePhone = () => localStorage.getItem(DEVICE_PHONE_KEY);
const storeDeviceToken = (token, phone) => {
  localStorage.setItem(DEVICE_TOKEN_KEY, token);
  localStorage.setItem(DEVICE_PHONE_KEY, phone);
};
const clearDeviceToken = () => {
  localStorage.removeItem(DEVICE_TOKEN_KEY);
  localStorage.removeItem(DEVICE_PHONE_KEY);
};

export default function CustomerLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: phone, 2: role-selection, 3: otp
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [suspendedModal, setSuspendedModal] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null); // 'admin' or 'customer'
  const [trustDevice, setTrustDevice] = useState(false); // Trust this device option
  const [checkingTrustedDevice, setCheckingTrustedDevice] = useState(false);

  // Check for trusted device on phone input
  const checkTrustedDevice = async (phoneNumber) => {
    const storedToken = getStoredDeviceToken();
    const storedPhone = getStoredDevicePhone();
    
    if (!storedToken || !storedPhone) return false;
    
    // Check if stored phone matches (normalize for comparison)
    const normalizedPhone = phoneNumber.replace(/\D/g, '');
    const normalizedStoredPhone = storedPhone.replace(/\D/g, '');
    
    if (!normalizedStoredPhone.includes(normalizedPhone.slice(-9)) && 
        !normalizedPhone.includes(normalizedStoredPhone.slice(-9))) {
      return false;
    }
    
    try {
      setCheckingTrustedDevice(true);
      const response = await api.post('/auth/check-trusted-device', {
        phone: phoneNumber,
        device_token: storedToken
      });
      
      if (response.data.trusted) {
        return response.data;
      }
      return false;
    } catch (error) {
      console.log('Device not trusted or error:', error);
      clearDeviceToken();
      return false;
    } finally {
      setCheckingTrustedDevice(false);
    }
  };

  // Login with trusted device
  const loginWithTrustedDevice = async () => {
    const storedToken = getStoredDeviceToken();
    
    if (!storedToken || !phone) return;
    
    setLoading(true);
    try {
      const response = await api.post('/auth/login-trusted-device', {
        phone,
        device_token: storedToken
      });
      
      const token = response.data.access_token;
      const decoded = jwtDecode(token);
      const role = decoded.role || 'admin';
      const userType = decoded.type || 'admin';
      const name = decoded.name || '';
      
      setAuthToken(token, userType, role, name);
      toast.success(t('loginSuccess'));
      
      if (role === 'staff') {
        navigate('/admin/redeem');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.log('Trusted device login failed:', error);
      clearDeviceToken();
      toast.error('انتهت صلاحية الجهاز الموثوق، يرجى تسجيل الدخول مجدداً');
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async () => {
    if (!phone) {
      toast.error(t('phoneRequired'));
      return;
    }
    setLoading(true);
    try {
      // First, check if this is a trusted device for admin
      const trustedResult = await checkTrustedDevice(phone);
      
      if (trustedResult && trustedResult.trusted) {
        // This is a trusted device - show option to use it
        setIsAdmin(true);
        setAdminInfo({
          name: trustedResult.name,
          role: trustedResult.role,
          is_also_customer: trustedResult.is_also_customer,
          customer_name: trustedResult.customer_name,
          is_trusted_device: true
        });
        
        // If user has both roles, show role selection
        if (trustedResult.is_also_customer) {
          setStep(2);
        } else {
          // Auto-login with trusted device
          await loginWithTrustedDevice();
        }
        return;
      }
      
      // Not a trusted device - proceed with normal OTP flow
      // First check if this is an admin/staff phone
      const checkResponse = await api.post('/auth/check-admin-phone', { phone });
      
      if (checkResponse.data.is_admin) {
        // This is an admin/staff - OTP already sent by the check endpoint
        setIsAdmin(true);
        setAdminInfo({
          name: checkResponse.data.name,
          role: checkResponse.data.role,
          is_also_customer: checkResponse.data.is_also_customer,
          customer_name: checkResponse.data.customer_name
        });
        toast.success(t('otpSent'));
        
        // If user has both roles, show role selection
        if (checkResponse.data.is_also_customer) {
          setStep(2); // Role selection step
        } else {
          setSelectedRole('admin');
          setStep(3); // OTP step
        }
      } else {
        // Regular customer login
        await api.post('/auth/customer/send-otp', { phone });
        setIsAdmin(false);
        setAdminInfo(null);
        setSelectedRole('customer');
        toast.success(t('otpSent'));
        setStep(3); // OTP step
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || t('sendOTPFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = async (role) => {
    setSelectedRole(role);
    
    // If admin role selected and device is trusted, auto-login
    if (role === 'admin' && adminInfo?.is_trusted_device) {
      await loginWithTrustedDevice();
      return;
    }
    
    // If admin role selected but not trusted device, need to send OTP
    if (role === 'admin' && !adminInfo?.is_trusted_device) {
      // OTP was already sent when checking admin phone
    }
    
    setStep(3); // Move to OTP step
  };

  const verifyOTP = async () => {
    if (!otp) {
      toast.error(t('enterOTP'));
      return;
    }
    setLoading(true);
    try {
      if (selectedRole === 'admin') {
        // Admin/Staff login
        const response = await api.post('/auth/admin/verify-otp', { 
          phone, 
          code: otp,
          trust_device: trustDevice  // Send trust device preference
        });
        const token = response.data.access_token;
        
        // Store device token if provided (device was trusted)
        if (response.data.device_token) {
          storeDeviceToken(response.data.device_token, phone);
        }
        
        // Decode token to get role
        const decoded = jwtDecode(token);
        const role = decoded.role || 'admin';
        const userType = decoded.type || 'admin';
        const name = decoded.name || '';
        
        setAuthToken(token, userType, role, name);
        toast.success(t('loginSuccess'));
        
        // Redirect based on role
        if (role === 'staff') {
          navigate('/admin/redeem');
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        // Customer login
        const response = await api.post('/auth/customer/verify-otp', { phone, code: otp });
        setAuthToken(response.data.access_token, 'customer');
        toast.success(t('loginSuccess'));
        navigate('/customer/dashboard');
      }
    } catch (error) {
      // Get error detail and ensure it's a string
      let errorDetail = error.response?.data?.detail || '';
      
      // If errorDetail is an object, try to extract the message
      if (typeof errorDetail === 'object') {
        errorDetail = errorDetail.message || JSON.stringify(errorDetail);
      }
      
      // Ensure it's a string
      errorDetail = String(errorDetail);
      
      // Check if account is suspended
      if (errorDetail.startsWith('ACCOUNT_SUSPENDED|')) {
        const reason = errorDetail.replace('ACCOUNT_SUSPENDED|', '');
        setSuspendedModal({ reason });
      } else {
        toast.error(errorDetail || t('invalidOTP'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAF9] px-4">
      {/* Account Suspended Modal */}
      {suspendedModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('accountSuspended')}</h2>
              <p className="text-gray-600 mb-6">{t('accountSuspendedMessage')}</p>
              
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-right">
                <p className="text-xs text-red-600 font-medium mb-1">{t('suspensionReasonLabel')}:</p>
                <p className="text-red-800 font-bold">{suspendedModal.reason}</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-blue-800">
                  <Headphones className="w-5 h-5" />
                  <p className="text-sm font-medium">{t('contactSupport')}</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setSuspendedModal(null);
                  setStep(1);
                  setOtp('');
                }}
                className="w-full bg-gray-800 text-white py-4 rounded-xl font-bold hover:bg-gray-900 flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-emerald-100">
        <div className="text-center mb-8">
          <img 
            src="https://customer-assets.emergentagent.com/job_alrif-points/artifacts/r9bwchf3_Al%20Reef%20logo-3.png" 
            alt="Logo" 
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-[#1A4D2E]" data-testid="login-title">{t('login')}</h1>
        </div>

        {step === 1 ? (
          <div className="space-y-4" data-testid="step-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline w-4 h-4 ml-2" />
                {t('phoneNumber')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-[#1A4D2E] focus:border-transparent"
                data-testid="phone-input"
                dir="ltr"
              />
            </div>
            <button
              onClick={sendOTP}
              disabled={loading}
              className="w-full bg-[#1A4D2E] text-white py-3 rounded-xl font-bold hover:bg-[#143d24] disabled:opacity-50"
              data-testid="send-otp-btn"
            >
              {loading ? t('loading') : t('sendOTP')}
            </button>
          </div>
        ) : step === 2 ? (
          // Role Selection Step
          <div className="space-y-4" data-testid="step-2-role-selection">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">اختر طريقة الدخول</h2>
              <p className="text-sm text-gray-600">لديك حسابين، اختر أي منهما تريد الدخول إليه</p>
            </div>

            {/* Admin Role Card */}
            <button
              onClick={() => handleRoleSelection('admin')}
              className="w-full p-6 border-2 border-[#1A4D2E] rounded-xl hover:bg-emerald-50 transition-all group"
              data-testid="select-admin-role"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#1A4D2E] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="text-right flex-1">
                  <h3 className="text-lg font-bold text-[#1A4D2E] mb-1">
                    الدخول كمدير
                  </h3>
                  <p className="text-sm text-gray-600">{adminInfo?.name}</p>
                  <p className="text-xs text-emerald-600 font-medium">
                    {adminInfo?.role === 'admin' ? 'مدير النظام' : 'موظف خدمة العملاء'}
                  </p>
                </div>
              </div>
            </button>

            {/* Customer Role Card */}
            <button
              onClick={() => handleRoleSelection('customer')}
              className="w-full p-6 border-2 border-blue-500 rounded-xl hover:bg-blue-50 transition-all group"
              data-testid="select-customer-role"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <div className="text-right flex-1">
                  <h3 className="text-lg font-bold text-blue-600 mb-1">
                    الدخول كعميل
                  </h3>
                  <p className="text-sm text-gray-600">{adminInfo?.customer_name || 'حسابي الشخصي'}</p>
                  <p className="text-xs text-blue-600 font-medium">
                    عرض نقاطي ومعاملاتي
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setStep(1);
                setPhone('');
                setAdminInfo(null);
                setIsAdmin(false);
              }}
              className="w-full text-gray-600 py-2 text-sm hover:text-gray-900"
            >
              ← رجوع
            </button>
          </div>
        ) : (
          <div className="space-y-4" data-testid="step-3-otp">
            {selectedRole === 'admin' && adminInfo && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center mb-4">
                <Shield className="w-8 h-8 text-[#1A4D2E] mx-auto mb-2" />
                <p className="font-bold text-[#1A4D2E]">{adminInfo.name}</p>
                <p className="text-sm text-emerald-700">
                  {adminInfo.role === 'admin' ? 'مدير النظام' : 'موظف خدمة العملاء'}
                </p>
              </div>
            )}
            {selectedRole === 'customer' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center mb-4">
                <Phone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-bold text-blue-600">حساب العميل</p>
                <p className="text-sm text-blue-700">عرض نقاطي ومعاملاتي</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Key className="inline w-4 h-4 ml-2" />
                {t('otpCode')}
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="1234"
                maxLength="6"
                className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-[#1A4D2E] focus:border-transparent text-center text-2xl tracking-widest"
                data-testid="otp-input"
                dir="ltr"
              />
            </div>
            <button
              onClick={verifyOTP}
              disabled={loading}
              className="w-full bg-[#1A4D2E] text-white py-3 rounded-xl font-bold hover:bg-[#143d24] disabled:opacity-50"
              data-testid="verify-otp-btn"
            >
              {loading ? t('loading') : t('verifyOTP')}
            </button>
            <button
              onClick={() => {
                setStep(1);
                setIsAdmin(false);
                setAdminInfo(null);
                setOtp('');
              }}
              className="w-full text-[#1A4D2E] py-2 text-sm hover:underline"
              data-testid="back-btn"
            >
              ← {t('back')}
            </button>
          </div>
        )}

        {step === 1 && (
          <Link to="/" className="block mt-6 text-center text-sm text-gray-600 hover:text-[#1A4D2E]" data-testid="home-link">
            ← {t('back')}
          </Link>
        )}
      </div>
    </div>
  );
}
