import { useState } from 'react';
import { ArrowRight, Globe, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQ() {
  const [language, setLanguage] = useState('ar');
  const [openIndex, setOpenIndex] = useState(null);

  const isArabic = language === 'ar';

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData = {
    ar: [
      {
        question: 'كيف يمكنني الانضمام لبرنامج الولاء؟',
        answer: 'يمكنك الانضمام مجاناً من خلال طلب التسجيل من موظفي المحاسبة عند زيارة أي فرع من فروع تموينات واحة الريف. كل ما تحتاجه هو رقم جوالك.'
      },
      {
        question: 'كيف أكسب النقاط؟',
        answer: 'تحصل على نقطة واحدة مقابل كل 10 ريال تنفقها في مشترياتك. يتم إضافة النقاط تلقائياً عند إعطاء رقم جوالك للمحاسب قبل إتمام عملية الشراء.'
      },
      {
        question: 'كم تساوي قيمة النقطة الواحدة؟',
        answer: 'قيمة النقطة الواحدة تعادل 10 هللات (0.10 ريال سعودي). أي أن 100 نقطة = 10 ريال.'
      },
      {
        question: 'ما هي مدة صلاحية النقاط؟',
        answer: 'صلاحية النقاط المكتسبة سنة واحدة من تاريخ اكتسابها. ننصحك باستخدام نقاطك قبل انتهاء صلاحيتها.'
      },
      {
        question: 'كيف يمكنني استبدال نقاطي؟',
        answer: 'عند زيارة أي فرع: أعطِ رقم جوالك للمحاسب، ستصلك رسالة تحقق (SMS) على جوالك، أدخل رمز التحقق، وسيُخصم المبلغ المطلوب من رصيد نقاطك.'
      },
      {
        question: 'كيف أعرف رصيد نقاطي؟',
        answer: 'يمكنك معرفة رصيدك بطريقتين: من خلال الموقع بتسجيل دخولك وستجد رصيدك في لوحة التحكم، أو من خلال الفرع بسؤال المحاسب وسيُعلمك برصيدك.'
      },
      {
        question: 'هل أحصل على نقاط عند الدفع ببطاقة بنكية؟',
        answer: 'نعم، تحصل على النقاط سواء دفعت نقداً أو ببطاقة بنكية.'
      },
      {
        question: 'هل هناك منتجات لا تُكسب نقاطاً؟',
        answer: 'لا تُحتسب النقاط على الأصناف الخاضعة للعروض الترويجية والتخفيضات الموسمية.'
      },
      {
        question: 'ماذا يحدث إذا أرجعت منتجاً؟',
        answer: 'في حال إرجاع منتج، لن تتمكن من استبدال النقاط إلا بعد انتهاء فترة الإرجاع المقررة حسب سياسة الإرجاع.'
      },
      {
        question: 'هل يمكنني تحويل نقاطي لشخص آخر؟',
        answer: 'لا، النقاط مرتبطة بحسابك الشخصي ولا يمكن تحويلها لحساب آخر.'
      }
    ],
    en: [
      {
        question: 'How can I join the loyalty program?',
        answer: 'You can join for free by requesting registration from the cashier staff when visiting any Al-Reef Oasis Groceries branch. All you need is your mobile number.'
      },
      {
        question: 'How do I earn points?',
        answer: 'You earn one point for every 10 SAR you spend on your purchases. Points are automatically added when you provide your mobile number to the cashier before completing your purchase.'
      },
      {
        question: 'How much is one point worth?',
        answer: 'One point is worth 10 halalas (0.10 SAR). This means 100 points = 10 SAR.'
      },
      {
        question: 'What is the validity period of the points?',
        answer: 'Earned points are valid for one year from the date of earning. We recommend using your points before they expire.'
      },
      {
        question: 'How can I redeem my points?',
        answer: 'When visiting any branch: Give your mobile number to the cashier, you will receive a verification SMS on your phone, enter the verification code, and the required amount will be deducted from your points balance.'
      },
      {
        question: 'How do I check my points balance?',
        answer: 'You can check your balance in two ways: Through the website by logging in and viewing your dashboard, or at the branch by asking the cashier who will inform you of your balance.'
      },
      {
        question: 'Do I earn points when paying with a bank card?',
        answer: 'Yes, you earn points whether you pay in cash or with a bank card.'
      },
      {
        question: 'Are there products that don\'t earn points?',
        answer: 'Points are not calculated on items subject to promotional offers and seasonal discounts.'
      },
      {
        question: 'What happens if I return a product?',
        answer: 'In case of returning a product, you will not be able to redeem points until after the return period has ended according to the return policy.'
      },
      {
        question: 'Can I transfer my points to someone else?',
        answer: 'No, points are linked to your personal account and cannot be transferred to another account.'
      }
    ]
  };

  const currentFAQ = isArabic ? faqData.ar : faqData.en;

  return (
    <div className={`min-h-screen bg-gray-50 ${isArabic ? 'font-arabic' : 'font-sans'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-[#1A4D2E] text-white py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center gap-2 text-white hover:text-emerald-200">
              <ArrowRight className="w-5 h-5" />
              <span className="text-sm">{isArabic ? 'العودة للرئيسية' : 'Back to Home'}</span>
            </Link>
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm">{isArabic ? 'English' : 'العربية'}</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-3 rounded-xl">
              <HelpCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {isArabic ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
              </h1>
              <p className="text-emerald-200 mt-1">
                {isArabic 
                  ? 'برنامج الولاء - تموينات واحة الريف للمواد الغذائية'
                  : 'Loyalty Program - Al-Reef Oasis Groceries'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Quick Info Box */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-[#FFC107] p-3 rounded-xl shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h3 className="font-bold text-[#1A4D2E] mb-2">
                {isArabic ? 'معلومة سريعة' : 'Quick Info'}
              </h3>
              <p className="text-gray-700">
                {isArabic 
                  ? 'كل 10 ريال = نقطة واحدة | كل نقطة = 10 هللات | صلاحية النقاط = سنة واحدة'
                  : 'Every 10 SAR = 1 point | Each point = 10 halalas | Points validity = 1 year'}
              </p>
            </div>
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {currentFAQ.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-right hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="bg-[#1A4D2E] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-gray-800 text-right">
                    {faq.question}
                  </span>
                </div>
                <div className={`shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-5 h-5 text-[#1A4D2E]" />
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-2">
                      <div className={`bg-emerald-50 rounded-xl p-4 ${isArabic ? 'mr-12' : 'ml-12'}`}>
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-10 bg-[#1A4D2E] rounded-2xl p-6 text-center text-white">
          <h3 className="text-xl font-bold mb-2">
            {isArabic ? 'لم تجد إجابة لسؤالك؟' : "Didn't find an answer to your question?"}
          </h3>
          <p className="text-emerald-200 mb-4">
            {isArabic 
              ? 'تواصل معنا وسنسعد بمساعدتك'
              : 'Contact us and we will be happy to help you'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href="https://wa.me/966559489908"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-3 rounded-xl font-bold transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>📱</span>
              <span dir="ltr">0559489908</span>
            </a>
            <a 
              href="mailto:info@walreef.com"
              className="bg-[#FFC107] hover:bg-[#e0a800] text-[#1A4D2E] px-6 py-3 rounded-xl font-bold transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>✉️</span>
              <span>info@walreef.com</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>© 2025 {isArabic ? 'تموينات واحة الريف للمواد الغذائية. جميع الحقوق محفوظة.' : 'Al-Reef Oasis Groceries. All rights reserved.'}</p>
        </div>
      </div>
    </div>
  );
}
