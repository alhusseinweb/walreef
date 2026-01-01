import { useState } from 'react';
import { ArrowRight, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  const [language, setLanguage] = useState('ar');

  const isArabic = language === 'ar';

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
          <h1 className="text-2xl md:text-3xl font-bold">
            {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </h1>
          <p className="text-emerald-200 mt-2">
            {isArabic 
              ? 'برنامج الولاء - تموينات واحة الريف للمواد الغذائية'
              : 'Loyalty Program - Al-Reef Oasis Groceries'}
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          {isArabic ? (
            // Arabic Content
            <div className="space-y-6 text-gray-800">
              {/* متى وما هي المعلومات التي تطلبها المؤسسة؟ */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  متى وما هي المعلومات التي تطلبها المؤسسة؟
                </h2>
                <p className="leading-relaxed">
                  تطلب المؤسسة المعلومات الخاصة بالعميل عند انضمامه إلى موقع المؤسسة، أو اشتراكه في نشرتها أو تقديم أي طلب لها. يمكن زيارة موقع المؤسسة بصفة مجهولة، ولكن ينبغي إدخال معلومات مثل الاسم والبريد الإلكتروني، والعنوان ورقم الهاتف عند تقديم أي طلب أو الاشتراك بالموقع.
                </p>
              </section>

              {/* ما هي حاجتنا للمعلومات الخاصة بك؟ */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  ما هي حاجتنا للمعلومات الخاصة بك؟
                </h2>
                <p className="mb-4">قد نستخدم أي من المعلومات التي نطلبها من العميل للأغراض الآتية:</p>
                <ul className="space-y-3 mr-4">
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span><strong className="text-[#1A4D2E]">تخصيص خبرات العميل:</strong> تساعد معلومات العميل المؤسسة على الاستجابة بشكل أفضل لحاجاته الفردية.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span><strong className="text-[#1A4D2E]">تحسين موقع المؤسسة على شبكة الإنترنت:</strong> تسعى المؤسسة دوما لتحسين العروض على موقعها استنادا على المعلومات وردود الفعل التي تلقاها من العملاء.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span><strong className="text-[#1A4D2E]">تحسين خدمة العملاء:</strong> تساعد معلومات العميل المؤسسة الاستجابة بفعالية أكبر لطلبات العملاء ودعمهم.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span><strong className="text-[#1A4D2E]">إرسال رسائل الكترونية بشكل دوري:</strong> يمكن للمؤسسة استخدام عنوان البريد الإلكتروني الذي يزودنا به العميل لإرسال المعلومات والردود على الاستفسارات و/أو غيرها من الطلبات أو الأسئلة إلى العميل.</span>
                  </li>
                </ul>
              </section>

              {/* كيف نقوم بحماية المعلومات الخاصة بك؟ */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  كيف نقوم بحماية المعلومات الخاصة بك؟
                </h2>
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <p className="leading-relaxed">
                    تلتزم المؤسسة بتطبيق مجموعة من الإجراءات الأمنية التي تساهم في الحفاظ على سلامة معلومات العميل الشخصية عند دخول الموقع، والتسجيل والمراجعة.
                  </p>
                </div>
              </section>

              {/* هل تكشف المؤسسة معلومات العميل للغير؟ */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  هل تكشف المؤسسة معلومات العميل للغير؟
                </h2>
                <p className="leading-relaxed mb-4">
                  تلتزم المؤسسة بعدم بيع أو متاجرة أو نقل أي معلومات شخصية خاصة بالعميل للغير. باستثناء الأطراف الموثوق بها التي تساهم في تشغيل موقع المؤسسة على شبكة الإنترنت، أو إدارة أعمال المؤسسة، أو التي تقدم الخدمات للعميل، شريطة التزام هذه الأطراف بسرية المعلومات.
                </p>
                <p className="leading-relaxed mb-4">
                  ويجوز للمؤسسة الإفصاح عن المعلومات الخاصة بالعميل عند الضرورة بما يتفق مع القانون، وتعزيزًا لسياسات المؤسسة، وحمايةً لحقوق المؤسسة والغير والملكية والأمان.
                </p>
                <p className="leading-relaxed">
                  ومع ذلك، يمكن أن تقدم المؤسسة معلومات غير شخصية عن زوار مجهولين لموقع المؤسسة لأطراف أخرى بغاية التسويق والإعلان، أو غير ذلك من الاستخدامات الأخرى.
                </p>
              </section>

              {/* نطاق سياسة الخصوصية */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  نطاق سياسة الخصوصية
                </h2>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="leading-relaxed">
                    تطبق سياسة الخصوصية على المعلومات التي يتم جمعها من موقع المؤسسة فقط، خلافًا لذلك، لا تطبق سياسة الخصوصية.
                  </p>
                </div>
              </section>

              {/* شروط وأحكام */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  شروط وأحكام
                </h2>
                <p className="leading-relaxed">
                  يرجى زيارة قسم{' '}
                  <Link to="/terms" className="text-[#1A4D2E] font-bold underline hover:text-emerald-600">
                    الأحكام والشروط
                  </Link>{' '}
                  للإطلاع على شروط الاستخدام وإخلاء المسؤولية وتقييد الالتزامات التي تطبق عند استخدام موقع المؤسسة.
                </p>
              </section>

              {/* موافقة العميل */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  موافقة العميل
                </h2>
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <p className="leading-relaxed font-medium">
                    باستخدام موقع المؤسسة، يوافق العميل على سياسة الخصوصية الخاصة بالمؤسسة.
                  </p>
                </div>
              </section>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
                <p>© 2025 تموينات واحة الريف للمواد الغذائية. جميع الحقوق محفوظة.</p>
              </div>
            </div>
          ) : (
            // English Content
            <div className="space-y-6 text-gray-800">
              {/* When and What Information Does the Company Request? */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  When and What Information Does the Company Request?
                </h2>
                <p className="leading-relaxed">
                  The company requests customer information when joining the company's website, subscribing to its newsletter, or submitting any request. You can visit the company's website anonymously, but you must enter information such as name, email address, address, and phone number when submitting any request or subscribing to the website.
                </p>
              </section>

              {/* Why Do We Need Your Information? */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  Why Do We Need Your Information?
                </h2>
                <p className="mb-4">We may use any information we request from the customer for the following purposes:</p>
                <ul className="space-y-3 ml-4">
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span><strong className="text-[#1A4D2E]">Personalizing Customer Experience:</strong> Customer information helps the company respond better to individual needs.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span><strong className="text-[#1A4D2E]">Improving Our Website:</strong> The company continuously strives to improve offerings on its website based on information and feedback received from customers.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span><strong className="text-[#1A4D2E]">Improving Customer Service:</strong> Customer information helps the company respond more effectively to customer requests and support.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span><strong className="text-[#1A4D2E]">Sending Periodic Emails:</strong> The company may use the email address provided by the customer to send information, respond to inquiries, and/or other requests or questions.</span>
                  </li>
                </ul>
              </section>

              {/* How Do We Protect Your Information? */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  How Do We Protect Your Information?
                </h2>
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <p className="leading-relaxed">
                    The company is committed to implementing a set of security measures that contribute to maintaining the safety of customer personal information when accessing the website, registering, and reviewing.
                  </p>
                </div>
              </section>

              {/* Does the Company Disclose Customer Information to Third Parties? */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  Does the Company Disclose Customer Information to Third Parties?
                </h2>
                <p className="leading-relaxed mb-4">
                  The company is committed to not selling, trading, or transferring any personal customer information to third parties. Except for trusted parties that contribute to operating the company's website, managing the company's business, or providing services to customers, provided these parties maintain information confidentiality.
                </p>
                <p className="leading-relaxed mb-4">
                  The company may disclose customer information when necessary in accordance with the law, to enforce company policies, and to protect the rights, property, and safety of the company and others.
                </p>
                <p className="leading-relaxed">
                  However, the company may provide non-personal information about anonymous visitors to the company's website to other parties for marketing, advertising, or other uses.
                </p>
              </section>

              {/* Scope of Privacy Policy */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  Scope of Privacy Policy
                </h2>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="leading-relaxed">
                    The privacy policy applies only to information collected from the company's website. Otherwise, the privacy policy does not apply.
                  </p>
                </div>
              </section>

              {/* Terms and Conditions */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  Terms and Conditions
                </h2>
                <p className="leading-relaxed">
                  Please visit the{' '}
                  <Link to="/terms" className="text-[#1A4D2E] font-bold underline hover:text-emerald-600">
                    Terms and Conditions
                  </Link>{' '}
                  section to review the terms of use, disclaimers, and limitations of liability that apply when using the company's website.
                </p>
              </section>

              {/* Customer Consent */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  Customer Consent
                </h2>
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <p className="leading-relaxed font-medium">
                    By using the company's website, the customer agrees to the company's privacy policy.
                  </p>
                </div>
              </section>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
                <p>© 2025 Al-Reef Oasis Groceries. All rights reserved.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
