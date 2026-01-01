import { useState } from 'react';
import { ArrowRight, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsAndConditions() {
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
            {isArabic ? 'الشروط والأحكام' : 'Terms and Conditions'}
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
              {/* تعريفات */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  التعريفات
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-[#1A4D2E]">العميل النشط:</strong> هو العميل الذي قام بالشراء خلال فترة 12 شهر بأي وسيلة من وسائل الدفع أو قام باستبدال نقاط الولاء.
                  </p>
                  <p>
                    <strong className="text-[#1A4D2E]">صلاحية النقاط:</strong> مدة صلاحية النقاط المكتسبة سنة من تاريخ اكتسابها.
                  </p>
                </div>
              </section>

              {/* مزايا الاشتراك */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  مزايا الاشتراك ببرنامج الولاء
                </h2>
                <ol className="list-decimal list-inside space-y-2 mr-4">
                  <li>يمكن للعميل استبدال النقاط المكتسبة بمكافآت وهدايا وعروض خاصة من خلال تموينات واحة الريف للمواد الغذائية.</li>
                  <li>خصومات خاصة على منتجات تموينات واحة الريف أو من أحد شركائها لجميع العملاء أو لفئة محددة منهم.</li>
                </ol>
              </section>

              {/* طريقة احتساب المكافآت */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  طريقة احتساب المكافآت
                </h2>
                <p className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  يتم منح العملاء النقاط المكتسبة من شراء المنتجات حيث يحصل العميل على <strong className="text-[#1A4D2E]">نقطة واحدة مقابل كل 10 ريال</strong> يصرفها لدى منافذ البيع وتقدر قيمة النقطة الواحدة بـ <strong className="text-[#1A4D2E]">10 هللات</strong>.
                </p>
              </section>

              {/* صلاحية النقاط */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  صلاحية النقاط
                </h2>
                <p>
                  يتم تحديد فترة صلاحية هذا الخصم وإبلاغ العملاء به مسبقاً حيث تكون هذه الفترة دون غيرها صالحة للاستفادة من الخصم الممنوح.
                </p>
              </section>

              {/* آلية استبدال النقاط */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  آلية استبدال النقاط
                </h2>
                <p>
                  يستطيع العميل استبدال نقاطه من خلال الفروع وذلك بإعطاء رقم الجوال للمحاسب حيث سيصل العميل رسالة (SMS) للتحقق وسيطلعه المحاسب على رصيده من النقاط وكم تعادل بالريال السعودي.
                </p>
              </section>

              {/* الشروط العامة */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  الشروط العامة
                </h2>
                <ul className="space-y-3">
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>تتم إضافة النقاط المستحقة في رصيد العميل في برنامج الولاء من خلال عملية الشراء التي يجريها العميل في تموينات واحة الريف للمواد الغذائية.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>لا يستطيع العميل صرف نقاط الولاء في حال عدم إكمال العميل للمعلومات الأساسية للتسجيل في البرنامج أو في حال لم تنتهي فترة الإرجاع المقررة حسب سياسة وشروط الإرجاع.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>لا يستحق العميل نقاط الولاء لطلبات الشراء في حال عدم استكمال العميل للطلب أو إتمام عملية الشراء بواسطة المكافآت الخاصة ببرنامج الولاء.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>يستحق العميل النقاط للمبلغ المدفوع كاش أو بالبطاقات البنكية.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>تمتلك تموينات واحة الريف للمواد الغذائية الحق في إلغاء جميع أو بعض من نقاط الولاء المكتسبة في حساب العميل في حال قررت، وفقاً لتقديرها الخاص، أن العميل قام بخرق هذه الأحكام أو كان شريكاً بأي عملية احتيال أو كذب متعمد أو استغلال أو غيرها من السلوكيات السيئة.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>يحق لتموينات واحة الريف للمواد الغذائية أن تقوم بتعليق أو إلغاء حساب أي عميل (و/أو تجميد النقاط التابعة لهذا الحساب) في حال عدم التزام العميل بقوانين البرنامج.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>يحق لتموينات واحة الريف للمواد الغذائية أن تعدل الطريقة التي تكتسب بها النقاط أو استرداد قيمتها بما في ذلك عدد النقاط المكتسبة وقيمة هذه النقاط وسوف تسعى لإبلاغ عملاؤها بهذه التغييرات مسبقاً دون المساس بالنقاط المكتسبة فعلياً.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>بقيام العميل بالاشتراك في برنامج الولاء فإنه يمنح تموينات واحة الريف للمواد الغذائية موافقته الغير مشروطة بجمع واستخدام والاحتفاظ بالمعلومات الموجودة في طلب العضوية ومعلوماته الشخصية بما في ذلك ودون حصر (البريد الإلكتروني وأرقام الاتصال) وذلك للأغراض التالية:</span>
                  </li>
                </ul>
                <ol className="list-decimal list-inside mr-8 mt-2 space-y-1">
                  <li>التواصل مع العملاء.</li>
                  <li>للإبلاغ عن أي عروض خاصة بنا.</li>
                </ol>
                <ul className="space-y-3 mt-3">
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>تقع على العميل مسؤولية قراءة جميع قواعد البرامج والنشرات وكشوفات الحسابات الخاصة ببرنامج الولاء لكي يطلع على حقوقه ومسؤولياته في البرنامج إضافة إلى هيكل اكتساب المكافآت وتحتفظ المؤسسة بحق تفسير وتطبيق تلك القواعد وتتم الإجابة على جميع الأسئلة وتسوية كافة النزاعات المرتبطة بتلك القواعد من قبل المؤسسة حسب الشروط والأحكام.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>يشترط على العميل إدخال رقم الجوال المسجل في البرنامج عند كل زيارة لإضافة أو استبدال النقاط بهدايا حسب النظام، وذلك خلال زيارة الفرع.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>تحتفظ تموينات واحة الريف للمواد الغذائية بحقها في تعديل أو إيقاف البرنامج أو تغيير أو إلغاء أو سحب أي من الشروط والأحكام حسب تقديرها دون الحاجة لإعطاء أي سبب من الأسباب وفي أي وقت من الأوقات.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>يحق لتموينات واحة الريف للمواد الغذائية مضاعفة النقاط الخاصة بالعملاء في بعض العروض الخاصة.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>يتم منح عملاء الولاء عروض حصرية وأسعار خاصة على منتجات مختارة ومكافآت دورية بالإضافة إلى خاصية تجميع النقاط، بشرط إشعار المحاسب بأنه عضو في برنامج الولاء من خلال تزويده برقم الجوال بداية العملية الشرائية بفروع المؤسسة.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>يتم منح العملاء زيادة معدل حساب النقاط الخاصة بمشترياتهم لأصناف خاصة ومحددة في أوقات وفترات محددة، تحددها المؤسسة، مثال على ذلك مضاعفة النقاط الممنوحة عند شراء صنف أو أصناف معينة أو بقيمة محددة في فترة محددة يتم إعلام العميل بها مسبقاً طبقاً للشروط التالية:</span>
                  </li>
                </ul>
                <ol className="list-decimal list-inside mr-8 mt-2 space-y-1">
                  <li>تحديث بيانات العميل.</li>
                  <li>المشاركة في الحملات.</li>
                </ol>
                <ul className="space-y-3 mt-3">
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>يتم منح عملاء البرنامج أو فئة منهم زيادة معدل حساب النقاط الخاصة بمشترياتهم خلال فترات محددة في بعض أو كل الفروع المشاركة بالبرنامج على جميع مشترياتهم أو فئة معينة منها.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>يتم منح عملاء البرنامج أو فئة منهم خصومات خاصة بمشترياتهم خلال فترة محددة في بعض أو كل الفروع المشاركة بالبرنامج على جميع مشترياتهم أو فئة معينة منها وذلك باستبدال نقاط محددة كشرط للحصول على الخصم أو العرض.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>تحتفظ المؤسسة بالحق في عدم إرسال العروض المطروحة إلى جميع عملاء البرنامج أو فئة منهم وكذلك تعليق أو إنهاء برنامج الولاء في أي وقت.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>في حال قررت المؤسسة تعليق أو إنهاء برنامج الولاء ستقوم بإبلاغ العملاء بالطرق التي تراها مناسبة عن طريق الإعلان بالفروع أو الوسائل الرقمية ... الخ. وفي هذه الحالة لا تعد المؤسسة مسؤولة أمام العميل فيما يتعلق بالنقاط غير المستخدمة وعلاوة على ذلك كما أنه لن يكون من حق العميل الحصول على أي تعويض في حال تعديل أو إنهاء برنامج الولاء من قبل المؤسسة في أي وقت.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>يحق للمؤسسة ووفقاً لرؤيتها وتقديرها وضع حد أدنى أو أعلى لعمليات استبدال أو تحويل النقاط إذا كان ذلك ضرورياً.</span>
                  </li>
                </ul>
              </section>

              {/* الاستثناءات */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  الاستثناءات
                </h2>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p>
                    لا يسري هذا الخصم الخاص على الأصناف الخاضعة للعروض الترويجية والتخفيضات الموسمية.
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
              {/* Definitions */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  Definitions
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-[#1A4D2E]">Active Customer:</strong> A customer who has made a purchase within a 12-month period using any payment method or has redeemed loyalty points.
                  </p>
                  <p>
                    <strong className="text-[#1A4D2E]">Points Validity:</strong> Earned points are valid for one year from the date of earning.
                  </p>
                </div>
              </section>

              {/* Program Benefits */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  Loyalty Program Benefits
                </h2>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Customers can redeem earned points for rewards, gifts, and special offers through Al-Reef Oasis Groceries.</li>
                  <li>Special discounts on Al-Reef Oasis products or from partner stores for all customers or specific categories.</li>
                </ol>
              </section>

              {/* Rewards Calculation */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  Rewards Calculation Method
                </h2>
                <p className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  Customers earn points from product purchases, receiving <strong className="text-[#1A4D2E]">one point for every 10 SAR</strong> spent at our outlets. Each point is valued at <strong className="text-[#1A4D2E]">10 halalas</strong>.
                </p>
              </section>

              {/* Points Validity */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  Points Validity
                </h2>
                <p>
                  The validity period of discounts will be determined and communicated to customers in advance. Only during this period can customers benefit from the granted discount.
                </p>
              </section>

              {/* Redemption Process */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  Points Redemption Process
                </h2>
                <p>
                  Customers can redeem their points at our branches by providing their mobile number to the cashier. A verification SMS will be sent, and the cashier will inform the customer of their points balance and its equivalent value in Saudi Riyals.
                </p>
              </section>

              {/* General Terms */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  General Terms
                </h2>
                <ul className="space-y-3">
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>Points are added to the customer's loyalty program account through purchases made at Al-Reef Oasis Groceries.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>Customers cannot redeem loyalty points if they haven't completed basic registration information or if the return period according to our return policy hasn't expired.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>Customers don't earn loyalty points if they don't complete their purchase or if the transaction is completed using loyalty program rewards.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>Customers earn points for amounts paid in cash or by bank card.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>Al-Reef Oasis Groceries reserves the right to cancel all or some loyalty points in a customer's account if it determines, at its sole discretion, that the customer has violated these terms or been involved in fraud, intentional misrepresentation, exploitation, or other misconduct.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>Al-Reef Oasis Groceries has the right to suspend or cancel any customer's account (and/or freeze associated points) if the customer fails to comply with program rules.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>Al-Reef Oasis Groceries reserves the right to modify how points are earned or redeemed, including the number and value of points, and will endeavor to notify customers of such changes in advance without affecting already earned points.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>By joining the loyalty program, customers grant Al-Reef Oasis Groceries unconditional consent to collect, use, and retain information from their membership application and personal information, including but not limited to email addresses and contact numbers, for the following purposes:</span>
                  </li>
                </ul>
                <ol className="list-decimal list-inside ml-8 mt-2 space-y-1">
                  <li>Customer communication.</li>
                  <li>Notification of special offers.</li>
                </ol>
                <ul className="space-y-3 mt-3">
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>Customers are responsible for reading all program rules, bulletins, and statements to understand their rights and responsibilities, reward structure, and the company retains the right to interpret and apply these rules, answer all questions, and settle disputes according to terms and conditions.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>Customers must provide their registered mobile number at each visit to add or redeem points according to the system during branch visits.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>Al-Reef Oasis Groceries reserves the right to modify, suspend the program, or change, cancel, or withdraw any terms and conditions at its discretion without needing to provide reasons at any time.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>Al-Reef Oasis Groceries may double customer points during certain special offers.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>Loyalty customers receive exclusive offers, special prices on selected products, and periodic rewards in addition to point accumulation, provided they notify the cashier of their membership by providing their mobile number at the start of transactions at company branches.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>Customers may receive increased points calculation rates for specific items during certain periods determined by the company, such as doubled points when purchasing specific items or spending a certain amount during a specified period, communicated to customers in advance, subject to conditions including:</span>
                  </li>
                </ul>
                <ol className="list-decimal list-inside ml-8 mt-2 space-y-1">
                  <li>Updating customer information.</li>
                  <li>Participating in campaigns.</li>
                </ol>
                <ul className="space-y-3 mt-3">
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>Program customers or specific categories may receive increased points calculation rates during certain periods at some or all participating branches on all or certain purchases.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>Program customers or specific categories may receive special discounts during certain periods at some or all participating branches on all or certain purchases by redeeming specific points as a condition for obtaining the discount or offer.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>The company reserves the right not to send available offers to all program customers or specific categories, and to suspend or terminate the loyalty program at any time.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>If the company decides to suspend or terminate the loyalty program, it will notify customers through appropriate means such as branch announcements or digital media, etc. In this case, the company is not liable to customers regarding unused points, and customers have no right to compensation if the program is modified or terminated by the company at any time.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1A4D2E] font-bold">•</span>
                    <span>The company may, at its vision and discretion, set minimum or maximum limits for point redemption or transfer operations if necessary.</span>
                  </li>
                </ul>
              </section>

              {/* Exceptions */}
              <section>
                <h2 className="text-xl font-bold text-[#1A4D2E] mb-4 pb-2 border-b-2 border-emerald-100">
                  Exceptions
                </h2>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p>
                    This special discount does not apply to items subject to promotional offers and seasonal discounts.
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
