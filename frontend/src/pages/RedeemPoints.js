import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Gift, User, Phone, CheckCircle, ArrowRight, Loader2, LogOut, Award, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { logout, isStaff } from '../utils/auth';

export default function RedeemPoints() {
  const { t, i18n } = useTranslation();
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState(null);
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [redemptionResult, setRedemptionResult] = useState(null);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const isArabic = i18n.language === 'ar';

  const searchCustomer = async () => {
    if (!phone || phone.length < 9) {
      toast.error(t('phoneRequired'));
      return;
    }
    
    setSearching(true);
    setCustomer(null);
    setOtpSent(false);
    setOtp('');
    setPointsToRedeem('');
    setRedemptionResult(null);
    
    try {
      const response = await api.get(`/redeem/customer/${phone}`);
      setCustomer(response.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || t('customerNotFound'));
    } finally {
      setSearching(false);
    }
  };

  const sendOTP = async () => {
    if (!pointsToRedeem || parseFloat(pointsToRedeem) <= 0) {
      toast.error(t('enterValidPoints'));
      return;
    }
    
    if (parseFloat(pointsToRedeem) > customer.active_points) {
      toast.error(t('insufficientPoints'));
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/redeem/send-otp', { phone: customer.phone_international });
      setOtpSent(true);
      toast.success(t('otpSent'));
    } catch (error) {
      toast.error(error.response?.data?.detail || t('sendOTPFailed'));
    } finally {
      setLoading(false);
    }
  };

  const verifyAndRedeem = async () => {
    if (!otp || otp.length < 4) {
      toast.error(t('enterOTP'));
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/redeem/verify-and-redeem', {
        customer_phone: customer.phone_international,
        points_to_redeem: parseFloat(pointsToRedeem),
        otp_code: otp
      });
      
      setRedemptionResult(response.data);
      toast.success(t('redemptionSuccess'));
      
      setTimeout(() => {
        setCustomer(null);
        setPhone('');
        setPointsToRedeem('');
        setOtp('');
        setOtpSent(false);
        setRedemptionResult(null);
      }, 5000);
      
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const redeemAll = () => {
    if (customer) {
      setPointsToRedeem(customer.active_points.toString());
    }
  };

  const calculateSARValue = (points) => {
    if (!customer || !points) return 0;
    const ratio = customer.points_value_sar / customer.active_points;
    return (parseFloat(points) * ratio).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1A4D2E] text-white p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!isStaff() && (
                <Link to="/admin/dashboard" data-testid="back-btn">
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
              <h1 className="text-lg font-bold" data-testid="page-title">
                🎁 {t('pointsRedemption')}
              </h1>
            </div>
            <button
              onClick={logout}
              className="bg-white/10 p-2 rounded-lg hover:bg-white/20"
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4">
        {/* Success Result */}
        <AnimatePresence>
          {redemptionResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-green-50 border-2 border-green-500 rounded-xl p-6 text-center mb-4"
              data-testid="redemption-result"
            >
              <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-green-800 mb-3">{t('redemptionSuccess')}</h2>
              <p className="text-green-700 text-lg">
                <span className="font-bold">{redemptionResult.points_redeemed}</span> {t('points')}
              </p>
              <p className="text-green-700 text-lg">
                <span className="font-bold">{redemptionResult.sar_value}</span> {t('sar')}
              </p>
              <p className="text-gray-600 text-sm mt-4 pt-3 border-t border-green-200">
                {t('remainingPoints')}: <span className="font-bold">{redemptionResult.remaining_points?.toFixed(0)}</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Section */}
        {!redemptionResult && (
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-4" data-testid="search-section">
            <h2 className="text-base font-bold text-[#1A4D2E] mb-4 flex items-center gap-2">
              <Search className="w-4 h-4 flex-shrink-0" />
              <span>{t('searchCustomer')}</span>
            </h2>
            
            {/* Phone Input */}
            <div className="mb-3">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('enterCustomerPhone')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base text-center"
                dir="ltr"
                data-testid="phone-input"
              />
            </div>
            
            {/* Search Button */}
            <button
              onClick={searchCustomer}
              disabled={searching}
              className="w-full bg-[#1A4D2E] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              data-testid="search-btn"
            >
              {searching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>بحث</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Customer Info Section */}
        <AnimatePresence>
          {customer && !redemptionResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Customer Card */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-4" data-testid="customer-card">
                {/* Customer Info */}
                <div className="text-center mb-4 pb-4 border-b border-gray-100">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <User className="w-7 h-7 text-[#1A4D2E]" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900" data-testid="customer-name">{customer.name}</h3>
                  <p className="text-sm text-gray-500" dir="ltr" data-testid="customer-phone">{customer.phone}</p>
                </div>
                
                {/* Points Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-yellow-50 rounded-xl p-4 text-center">
                    <Award className="w-6 h-6 text-[#FFC107] mx-auto mb-2" />
                    <p className="text-xs text-gray-600 mb-1">{t('availablePoints')}</p>
                    <p className="text-2xl font-bold text-[#FFC107]" data-testid="available-points">
                      {customer.active_points?.toFixed(0)}
                    </p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4 text-center">
                    <Gift className="w-6 h-6 text-[#1A4D2E] mx-auto mb-2" />
                    <p className="text-xs text-gray-600 mb-1">{t('availableBalance')}</p>
                    <p className="text-2xl font-bold text-[#1A4D2E]" data-testid="available-sar">
                      {customer.points_value_sar?.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">{t('sar')}</p>
                  </div>
                </div>
              </div>

              {/* Redemption Form */}
              {!otpSent ? (
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm" data-testid="redemption-form">
                  <h2 className="text-base font-bold text-[#1A4D2E] mb-4 flex items-center gap-2">
                    <Gift className="w-4 h-4 flex-shrink-0" />
                    <span>{t('redeemPoints')}</span>
                  </h2>
                  
                  {/* Points Input Label */}
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                    {t('pointsToRedeem')}
                  </label>
                  
                  {/* Points Input */}
                  <div className="mb-3">
                    <input
                      type="number"
                      value={pointsToRedeem}
                      onChange={(e) => setPointsToRedeem(e.target.value)}
                      placeholder="0"
                      max={customer.active_points}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl text-2xl font-bold text-center"
                      data-testid="points-input"
                    />
                  </div>
                  
                  {/* Redeem All Button */}
                  <div className="mb-3">
                    <button
                      onClick={redeemAll}
                      className="w-full bg-[#FFC107] text-[#1A4D2E] py-3 rounded-xl font-bold text-base"
                      data-testid="redeem-all-btn"
                    >
                      {t('redeemAll')}
                    </button>
                  </div>
                  
                  {/* SAR Value Display */}
                  {pointsToRedeem && (
                    <div className="bg-emerald-50 rounded-xl p-4 text-center mb-3">
                      <p className="text-sm text-gray-600 mb-1">{t('sarValue')}</p>
                      <p className="text-2xl font-bold text-[#1A4D2E]">
                        {calculateSARValue(pointsToRedeem)} {t('sar')}
                      </p>
                    </div>
                  )}
                  
                  {/* Send OTP Button */}
                  <button
                    onClick={sendOTP}
                    disabled={loading || !pointsToRedeem}
                    className="w-full bg-[#1A4D2E] text-white py-4 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                    data-testid="send-otp-btn"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Phone className="w-5 h-5" />
                        <span>{t('sendVerificationCode')}</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                  data-testid="otp-form"
                >
                  <h2 className="text-base font-bold text-[#1A4D2E] mb-4 text-center">{t('verificationCode')}</h2>
                  
                  {/* OTP Sent Message */}
                  <p className="text-sm text-gray-600 text-center bg-gray-50 py-3 px-4 rounded-xl mb-4">
                    {i18n.language === 'ar' 
                      ? `📱 تم إرسال رمز التحقق إلى ${customer.phone}`
                      : `📱 Verification code sent to ${customer.phone}`}
                  </p>
                  
                  {/* OTP Input */}
                  <div className="mb-4">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-4 border-2 border-emerald-300 rounded-xl text-2xl font-bold text-center"
                      dir="ltr"
                      data-testid="otp-input"
                    />
                  </div>
                  
                  {/* Points Summary */}
                  <div className="bg-yellow-50 rounded-xl p-4 text-center mb-4">
                    <p className="text-gray-700">
                      <span className="font-bold text-xl text-[#FFC107]">{pointsToRedeem}</span>
                      <span className="mx-2 text-gray-400">{t('points')}</span>
                      <span className="mx-2">=</span>
                      <span className="font-bold text-xl text-[#1A4D2E]">{calculateSARValue(pointsToRedeem)}</span>
                      <span className="mx-2 text-gray-400">{t('sar')}</span>
                    </p>
                  </div>
                  
                  {/* Verify Button */}
                  <div className="mb-2">
                    <button
                      onClick={verifyAndRedeem}
                      disabled={loading || !otp}
                      className="w-full bg-green-600 text-white py-4 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                      data-testid="verify-redeem-btn"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>{t('verifyAndRedeem')}</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Back Button */}
                  <button
                    onClick={() => setOtpSent(false)}
                    className="w-full text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-100"
                    data-testid="back-btn"
                  >
                    {t('back')}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
