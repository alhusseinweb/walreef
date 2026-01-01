import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Store, Gift, TrendingUp, Users, X, Phone, Mail, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function Landing() {
  const { t, i18n } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  return (
    <div className="min-h-screen bg-[#F9FAF9]">
      {/* Header */}
      <header className="bg-white border-b border-emerald-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_alrif-points/artifacts/r9bwchf3_Al%20Reef%20logo-3.png" 
              alt="Al Reef Logo" 
              className="h-12 w-auto"
              data-testid="logo"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 text-sm font-medium text-[#1A4D2E] hover:bg-emerald-50 rounded-lg"
              data-testid="language-toggle"
            >
              {i18n.language === 'ar' ? 'EN' : 'ع'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1581264669997-3f222f331aaa?crop=entropy&cs=srgb&fm=jpg&q=85')`
          }}
        />
        <div className="container mx-auto px-4 relative z-10 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-[#1A4D2E] mb-3" data-testid="hero-title">
              {i18n.language === 'ar' 
                ? 'مرحباً بك في برنامج الولاء'
                : 'Welcome to the Loyalty Program'}
            </h1>
            <p className="text-2xl md:text-3xl text-[#1A4D2E] font-semibold mb-6">
              {i18n.language === 'ar' 
                ? 'تموينات واحة الريف للمواد الغذائية'
                : 'Al-Reef Grocery Store'}
            </p>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {i18n.language === 'ar' 
                ? 'اجمع النقاط مع كل عملية شراء واستمتع بالمكافآت الحصرية'
                : 'Earn points with every purchase and enjoy exclusive rewards'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowModal(true)}
                className="bg-[#1A4D2E] text-white hover:bg-[#143d24] rounded-full px-8 py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
                data-testid="join-now-btn"
              >
                {t('joinNow')}
              </button>
              <Link
                to="/customer/login"
                className="bg-[#FFC107] text-[#1A4D2E] hover:bg-[#e0a800] rounded-full px-8 py-4 text-lg font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
                data-testid="login-btn"
              >
                {t('login')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Registration Info Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
            data-testid="modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
              data-testid="registration-modal"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                data-testid="close-modal-btn"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>

              <div className="text-center">
                <div className="bg-gradient-to-br from-[#1A4D2E] to-emerald-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Store className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-[#1A4D2E] mb-4">
                  {i18n.language === 'ar' 
                    ? 'الانضمام لبرنامج الولاء'
                    : 'Join Loyalty Program'}
                </h2>

                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed">
                    {i18n.language === 'ar' 
                      ? 'للانضمام لبرنامج الولاء، يرجى طلب التسجيل من خلال موظفي المحاسبة عند زيارة تموينات الريف'
                      : 'To join the loyalty program, please request registration through our cashier staff when visiting Al-Reef Store'}
                  </p>
                </div>

                <div className="space-y-3 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-3 justify-center">
                    <Gift className="w-5 h-5 text-[#FFC107]" />
                    <span>{i18n.language === 'ar' ? 'اجمع النقاط مع كل شراء' : 'Earn points with every purchase'}</span>
                  </div>
                  <div className="flex items-center gap-3 justify-center">
                    <TrendingUp className="w-5 h-5 text-[#FFC107]" />
                    <span>{i18n.language === 'ar' ? 'كل 10 ريال = نقطة واحدة' : 'Every 10 SAR = 1 point'}</span>
                  </div>
                  <div className="flex items-center gap-3 justify-center">
                    <Users className="w-5 h-5 text-[#FFC107]" />
                    <span>{i18n.language === 'ar' ? 'مكافآت حصرية للأعضاء' : 'Exclusive rewards for members'}</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-[#1A4D2E] text-white py-3 rounded-xl font-bold hover:bg-[#143d24] transition-colors"
                  data-testid="modal-close-btn"
                >
                  {i18n.language === 'ar' ? 'فهمت' : 'Got it'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Modal */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowContactModal(false)}
            data-testid="contact-modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden"
              data-testid="contact-modal"
            >
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-100 to-transparent rounded-full translate-y-1/2 -translate-x-1/2 opacity-50" />
              
              <button
                onClick={() => setShowContactModal(false)}
                className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                data-testid="close-contact-modal-btn"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>

              <div className="text-center relative z-10">
                <div className="bg-gradient-to-br from-[#1A4D2E] to-emerald-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-[#1A4D2E] mb-2">
                  {i18n.language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                </h2>
                <p className="text-gray-500 mb-6">
                  {i18n.language === 'ar' 
                    ? 'يسعدنا تواصلكم معنا في أي وقت'
                    : 'We are happy to hear from you anytime'}
                </p>

                {/* Phone/WhatsApp */}
                <a 
                  href="https://wa.me/966559489908"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border-2 border-emerald-200 rounded-2xl p-4 mb-4 transition-all group"
                >
                  <div className="bg-[#25D366] w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right flex-1">
                    <p className="text-sm text-gray-500 mb-1">
                      {i18n.language === 'ar' ? 'اتصال أو واتساب' : 'Call or WhatsApp'}
                    </p>
                    <p className="text-lg font-bold text-[#1A4D2E] tracking-wide" dir="ltr">
                      0559489908
                    </p>
                  </div>
                </a>

                {/* Email */}
                <a 
                  href="mailto:info@walreef.com"
                  className="flex items-center gap-4 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 border-2 border-amber-200 rounded-2xl p-4 mb-6 transition-all group"
                >
                  <div className="bg-[#FFC107] w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6 text-[#1A4D2E]" />
                  </div>
                  <div className="text-right flex-1">
                    <p className="text-sm text-gray-500 mb-1">
                      {i18n.language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    </p>
                    <p className="text-lg font-bold text-[#1A4D2E]">
                      info@walreef.com
                    </p>
                  </div>
                </a>

                <button
                  onClick={() => setShowContactModal(false)}
                  className="w-full bg-[#1A4D2E] text-white py-3 rounded-xl font-bold hover:bg-[#143d24] transition-colors"
                  data-testid="contact-modal-close-btn"
                >
                  {i18n.language === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A4D2E] text-center mb-12" data-testid="how-it-works-title">
            {t('howItWorks')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gradient-to-br from-white to-emerald-50 border-2 border-emerald-100 rounded-2xl p-6 text-center"
              data-testid="step-1"
            >
              <div className="bg-[#FFC107] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[#1A4D2E]" />
              </div>
              <h3 className="text-xl font-bold text-[#1A4D2E] mb-3">
                {i18n.language === 'ar' ? '1. سجل مجاناً' : '1. Register Free'}
              </h3>
              <p className="text-gray-600">
                {i18n.language === 'ar' 
                  ? 'انضم إلى برنامج الولاء بسهولة عبر رقم جوالك'
                  : 'Join the loyalty program easily with your phone number'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-white to-emerald-50 border-2 border-emerald-100 rounded-2xl p-6 text-center"
              data-testid="step-2"
            >
              <div className="bg-[#FFC107] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-[#1A4D2E]" />
              </div>
              <h3 className="text-xl font-bold text-[#1A4D2E] mb-3">
                {i18n.language === 'ar' ? '2. تسوق واجمع النقاط' : '2. Shop & Earn Points'}
              </h3>
              <p className="text-gray-600">
                {i18n.language === 'ar' 
                  ? 'كل 10 ريال تنفقها = نقطة واحدة'
                  : 'Every 10 SAR you spend = 1 point'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gradient-to-br from-white to-emerald-50 border-2 border-emerald-100 rounded-2xl p-6 text-center"
              data-testid="step-3"
            >
              <div className="bg-[#FFC107] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-[#1A4D2E]" />
              </div>
              <h3 className="text-xl font-bold text-[#1A4D2E] mb-3">
                {i18n.language === 'ar' ? '3. احصل على المكافآت' : '3. Get Rewards'}
              </h3>
              <p className="text-gray-600">
                {i18n.language === 'ar' 
                  ? 'استبدل نقاطك بمكافآت وخصومات حصرية'
                  : 'Redeem your points for exclusive rewards and discounts'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-[#F9FAF9]">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A4D2E] text-center mb-12" data-testid="benefits-title">
            {t('benefits')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow"
              data-testid="benefit-1"
            >
              <TrendingUp className="w-8 h-8 text-[#FFC107] mb-3" />
              <h3 className="text-xl font-bold text-[#1A4D2E] mb-2">
                {i18n.language === 'ar' ? 'تراكم النقاط' : 'Points Accumulation'}
              </h3>
              <p className="text-gray-600">
                {i18n.language === 'ar' 
                  ? 'اجمع النقاط تلقائياً مع كل فاتورة'
                  : 'Earn points automatically with every invoice'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow"
              data-testid="benefit-2"
            >
              <Gift className="w-8 h-8 text-[#FFC107] mb-3" />
              <h3 className="text-xl font-bold text-[#1A4D2E] mb-2">
                {i18n.language === 'ar' ? 'مكافآت حصرية' : 'Exclusive Rewards'}
              </h3>
              <p className="text-gray-600">
                {i18n.language === 'ar' 
                  ? 'احصل على عروض وخصومات خاصة'
                  : 'Get special offers and exclusive discounts'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A4D2E] text-white py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col items-center gap-4">
            {/* Legal Links */}
            <div className="flex items-center gap-4">
              <Link 
                to="/terms" 
                className="text-emerald-200 hover:text-white transition-colors text-sm underline"
                data-testid="terms-link"
              >
                {i18n.language === 'ar' ? 'الشروط والأحكام' : 'Terms and Conditions'}
              </Link>
              <span className="text-emerald-300">|</span>
              <Link 
                to="/privacy" 
                className="text-emerald-200 hover:text-white transition-colors text-sm underline"
                data-testid="privacy-link"
              >
                {i18n.language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </Link>
            </div>
            
            {/* Copyright */}
            <p className="text-sm text-center" data-testid="footer-text">
              {new Date().getFullYear()} © {t('tamweenatWahatAlReef')} - {t('allRightsReserved')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}