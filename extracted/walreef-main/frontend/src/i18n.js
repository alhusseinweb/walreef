import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ar: {
    translation: {
      // Navigation
      home: 'الرئيسية',
      transactions: 'العمليات',
      profile: 'الملف الشخصي',
      dashboard: 'لوحة التحكم',
      customers: 'العملاء',
      settings: 'الإعدادات',
      
      // Auth
      login: 'تسجيل الدخول',
      register: 'التسجيل',
      logout: 'تسجيل الخروج',
      phoneNumber: 'رقم الجوال',
      otpCode: 'رمز التحقق',
      sendOTP: 'إرسال رمز التحقق',
      verifyOTP: 'تحقق',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      noAccount: 'ليس لديك حساب؟',
      enterOTP: 'الرجاء إدخال رمز التحقق',
      
      // Points
      points: 'نقاط',
      activePoints: 'النقاط النشطة',
      expiringPoints: 'نقاط قريبة الانتهاء',
      expiredPoints: 'نقاط منتهية',
      totalPoints: 'إجمالي النقاط',
      pointsValue: 'قيمة النقاط',
      earnPoints: 'اجمع النقاط',
      rewardValue: 'قيمة المكافأة',
      
      // Transactions
      pointsEarned: 'نقاط مكتسبة',
      returnDeduction: 'خصم رجيع',
      pointsRedeemed: 'استبدال نقاط',
      expiredPointsTrans: 'نقاط منتهية',
      manualAddition: 'إضافة يدوية',
      noTransactions: 'لا توجد عمليات حتى الآن',
      
      // Loyalty Program
      loyaltyProgram: 'برنامج الولاء',
      welcomeMessage: 'مرحباً بك في برنامج ولاء واحة الريف',
      joinNow: 'انضم الآن',
      learnMore: 'اعرف المزيد',
      howItWorks: 'كيف يعمل البرنامج',
      benefits: 'المزايا',
      
      // Customer
      myProfile: 'ملفي الشخصي',
      myTransactions: 'عملياتي',
      myInvoices: 'فواتيري',
      welcomeCustomer: 'مرحباً',
      
      // Admin
      adminDashboard: 'لوحة تحكم المدير',
      totalCustomers: 'إجمالي العملاء',
      newCustomers: 'عملاء جدد',
      totalInvoices: 'إجمالي الفواتير',
      customersManagement: 'إدارة العملاء',
      addPoints: 'إضافة نقاط',
      sendEmail: 'إرسال بريد',
      manageCustomersPoints: 'إدارة العملاء والنقاط',
      syncManagement: 'إدارة المزامنة',
      syncInvoicesFromRewaa: 'مزامنة الفواتير من رواء',
      systemSettings: 'إعدادات النظام ورواء',
      thisMonth: 'هذا الشهر',
      sar: 'ريال',
      
      // Settings
      pointsMultiplier: 'معيار النقاط',
      rewaaSettings: 'إعدادات رواء',
      logoSettings: 'الشعار',
      
      // Common
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      search: 'بحث',
      loading: 'جاري التحميل...',
      success: 'نجح',
      error: 'خطأ',
      confirm: 'تأكيد',
      back: 'رجوع',
      next: 'التالي',
      submit: 'إرسال',
      understood: 'فهمت',
      
      // Messages
      otpSent: 'تم إرسال رمز التحقق',
      otpVerified: 'تم التحقق بنجاح',
      registrationSuccess: 'تم التسجيل بنجاح',
      loginSuccess: 'تم تسجيل الدخول بنجاح',
      updateSuccess: 'تم التحديث بنجاح',
      deleteSuccess: 'تم الحذف بنجاح',
      loadFailed: 'فشل تحميل البيانات',
      sendOTPFailed: 'فشل إرسال الرمز',
      loadStatsFailed: 'فشل تحميل الإحصائيات',
      loadTransactionsFailed: 'فشل تحميل العمليات',
      
      // Errors
      invalidOTP: 'رمز التحقق غير صحيح',
      expiredOTP: 'انتهت صلاحية رمز التحقق',
      phoneRequired: 'رقم الجوال مطلوب',
      emailRequired: 'البريد الإلكتروني مطلوب',
      nameRequired: 'الاسم مطلوب',
      
      // Points Redemption
      pointsRedemption: 'استبدال النقاط',
      enterCustomerPhone: 'أدخل رقم جوال العميل',
      searchCustomer: 'بحث عن العميل',
      customerInfo: 'معلومات العميل',
      availablePoints: 'النقاط المتاحة',
      availableBalance: 'الرصيد المتاح',
      pointsToRedeem: 'النقاط المراد استبدالها',
      redeemPoints: 'استبدال النقاط',
      sendVerificationCode: 'إرسال رمز التحقق',
      verificationCode: 'رمز التحقق',
      verifyAndRedeem: 'تحقق واستبدل',
      redemptionSuccess: 'تم استبدال النقاط بنجاح',
      insufficientPoints: 'رصيد النقاط غير كافي',
      customerNotFound: 'العميل غير موجود',
      enterValidPoints: 'أدخل عدد نقاط صالح',
      redeemAll: 'استبدال الكل',
      sarValue: 'القيمة بالريال',
      remainingPoints: 'النقاط المتبقية',
      
      // Staff Management
      staffManagement: 'إدارة الموظفين',
      addStaff: 'إضافة موظف',
      staffName: 'اسم الموظف',
      staffEmail: 'البريد الإلكتروني',
      staffPassword: 'كلمة المرور',
      createStaff: 'إنشاء حساب',
      staffCreated: 'تم إنشاء حساب الموظف',
      noStaff: 'لا يوجد موظفين',
      deleteStaff: 'حذف الموظف',
      confirmDeleteStaff: 'هل أنت متأكد من حذف هذا الموظف؟',
      
      // Customer Management
      editCustomer: 'تعديل بيانات العميل',
      deleteCustomer: 'حذف العميل',
      suspendCustomer: 'تعطيل الحساب',
      activateCustomer: 'تفعيل الحساب',
      suspensionReason: 'سبب التعطيل',
      enterSuspensionReason: 'أدخل سبب تعطيل الحساب',
      confirmDeleteCustomer: 'هل أنت متأكد من حذف هذا العميل؟ سيتم حذف جميع بياناته.',
      customerSuspended: 'تم تعطيل حساب العميل',
      customerActivated: 'تم تفعيل حساب العميل',
      customerDeleted: 'تم حذف العميل',
      customerUpdated: 'تم تحديث بيانات العميل',
      suspended: 'معطل',
      active: 'نشط',
      accountSuspended: 'الحساب معطل',
      accountSuspendedMessage: 'تم تعطيل حسابك من قبل الإدارة',
      suspensionReasonLabel: 'سبب التعطيل',
      contactSupport: 'يرجى مراجعة خدمة العملاء لتفعيل الحساب',
      close: 'إغلاق',
      
      // Landing Page
      joinLoyaltyProgram: 'الانضمام لبرنامج الولاء',
      joinInstructions: 'للانضمام لبرنامج الولاء، يرجى طلب التسجيل من خلال موظفي المحاسبة عند زيارة تموينات الريف',
      earnWithPurchase: 'اجمع النقاط مع كل شراء',
      tenSarOnePoint: 'كل 10 ريال = نقطة واحدة',
      exclusiveMemberRewards: 'مكافآت حصرية للأعضاء',
      registerFree: 'سجل مجاناً',
      joinEasily: 'انضم إلى برنامج الولاء بسهولة عبر رقم جوالك',
      shopEarnPoints: 'تسوق واجمع النقاط',
      everyTenSar: 'كل 10 ريال تنفقها = نقطة واحدة',
      getRewards: 'احصل على المكافآت',
      redeemPointsRewards: 'استبدل نقاطك بمكافآت وخصومات حصرية',
      pointsAccumulation: 'تراكم النقاط',
      autoPointsEveryInvoice: 'اجمع النقاط تلقائياً مع كل فاتورة',
      exclusiveRewards: 'مكافآت حصرية',
      specialOffersDiscounts: 'احصل على عروض وخصومات خاصة',
      
      // Footer
      allRightsReserved: 'جميع الحقوق محفوظة',
      tamweenatWahatAlReef: 'تموينات واحة الريف',
      
      // Admin Sync
      syncControl: 'التحكم في المزامنة',
      syncControlDesc: 'تفعيل أو إيقاف المزامنة التلقائية كل 15 دقيقة',
      stopSync: 'إيقاف المزامنة',
      enableSync: 'تفعيل المزامنة',
      manualSyncNow: 'مزامنة يدوية الآن',
      syncing: 'جاري المزامنة...',
      lastSyncStatus: 'حالة آخر مزامنة',
      status: 'الحالة',
      lastSyncTime: 'وقت آخر مزامنة',
      syncedInvoicesCount: 'عدد الفواتير المزامنة',
      lastInvoiceNumber: 'رقم آخر فاتورة',
      failureReason: 'سبب الفشل',
      syncStatusSuccess: 'نجحت',
      syncStatusFailed: 'فشلت',
      syncStatusRunning: 'جارية...',
      syncStatusPending: 'في الانتظار',
      notYet: 'لم تتم بعد',
      syncDisabledWarning: 'المزامنة التلقائية متوقفة. يجب تفعيلها أولاً لإجراء المزامنة اليدوية.',
      syncSuccessMsg: 'تمت المزامنة بنجاح! تم مزامنة',
      invoices: 'فاتورة',
      autoSyncEnabled: 'تم تفعيل المزامنة التلقائية',
      autoSyncDisabled: 'تم إيقاف المزامنة التلقائية',
      loadSyncStatusFailed: 'فشل تحميل حالة المزامنة',
      syncFailed: 'فشلت المزامنة',
      updateSyncStatusFailed: 'فشل تحديث حالة المزامنة',
      importantInfo: 'معلومات هامة',
      syncInfo1: 'يتم مزامنة الفواتير فقط للعملاء المسجلين في برنامج الولاء',
      syncInfo2: 'المزامنة التلقائية تعمل كل 15 دقيقة عند التفعيل',
      syncInfo3: 'يمكنك إجراء مزامنة يدوية في أي وقت',
      syncInfo4: 'بدأت المزامنة من الفاتورة رقم 160110',
      manageSyncWithRewaa: 'إدارة المزامنة مع رواء',
      
      // Admin Settings
      pointsEarningCriteria: 'معيار كسب النقاط (كم ريال لكل نقطة)',
      pointsEarningExample: 'مثال: إذا كانت القيمة 10، فكل 10 ريال = نقطة واحدة',
      rewardValueCriteria: 'معيار قيمة المكافأة (كم نقطة تساوي ريال واحد)',
      rewardValueExample: 'مثال: إذا كانت القيمة 10، فكل 10 نقاط = ريال واحد مكافأة',
      lastSyncedInvoiceNumber: 'رقم آخر فاتورة تم مزامنتها',
      systemStartsFromNext: 'سيبدأ النظام من الفاتورة التالية',
      updateRewaaSettingsNote: 'لتحديث إعدادات رواء (Rewaa)، يرجى تعديل ملف .env في الخادم',
      loadSettingsFailed: 'فشل تحميل الإعدادات',
      updateFailed: 'فشل التحديث',
      
      // Admin Customers
      noCustomers: 'لا يوجد عملاء',
      mobile: 'الجوال',
      loadCustomersFailed: 'فشل تحميل العملاء',
      
      // Recent Transactions
      recentTransactions: 'آخر العمليات',
      transactionType: 'نوع العملية',
      customer: 'العميل',
      date: 'التاريخ',
      noRecentTransactions: 'لا توجد عمليات حديثة',
      loadTransactionsFailed: 'فشل تحميل العمليات',
    }
  },
  en: {
    translation: {
      // Navigation
      home: 'Home',
      transactions: 'Transactions',
      profile: 'Profile',
      dashboard: 'Dashboard',
      customers: 'Customers',
      settings: 'Settings',
      
      // Auth
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      phoneNumber: 'Phone Number',
      otpCode: 'OTP Code',
      sendOTP: 'Send OTP',
      verifyOTP: 'Verify',
      name: 'Name',
      email: 'Email',
      password: 'Password',
      noAccount: "Don't have an account?",
      enterOTP: 'Please enter the verification code',
      
      // Points
      points: 'Points',
      activePoints: 'Active Points',
      expiringPoints: 'Expiring Soon',
      expiredPoints: 'Expired Points',
      totalPoints: 'Total Points',
      pointsValue: 'Points Value',
      earnPoints: 'Earn Points',
      rewardValue: 'Reward Value',
      
      // Transactions
      pointsEarned: 'Points Earned',
      returnDeduction: 'Return Deduction',
      pointsRedeemed: 'Points Redeemed',
      expiredPointsTrans: 'Expired Points',
      manualAddition: 'Manual Addition',
      noTransactions: 'No transactions yet',
      
      // Loyalty Program
      loyaltyProgram: 'Loyalty Program',
      welcomeMessage: 'Welcome to Al-Reef Loyalty Program',
      joinNow: 'Join Now',
      learnMore: 'Learn More',
      howItWorks: 'How It Works',
      benefits: 'Benefits',
      
      // Customer
      myProfile: 'My Profile',
      myTransactions: 'My Transactions',
      myInvoices: 'My Invoices',
      welcomeCustomer: 'Welcome',
      
      // Admin
      adminDashboard: 'Admin Dashboard',
      totalCustomers: 'Total Customers',
      newCustomers: 'New Customers',
      totalInvoices: 'Total Invoices',
      customersManagement: 'Customers Management',
      addPoints: 'Add Points',
      sendEmail: 'Send Email',
      manageCustomersPoints: 'Manage customers and points',
      syncManagement: 'Sync Management',
      syncInvoicesFromRewaa: 'Sync invoices from Rewaa',
      systemSettings: 'System and Rewaa settings',
      thisMonth: 'this month',
      sar: 'SAR',
      
      // Settings
      pointsMultiplier: 'Points Multiplier',
      rewaaSettings: 'Rewaa Settings',
      logoSettings: 'Logo',
      
      // Common
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      loading: 'Loading...',
      success: 'Success',
      error: 'Error',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      understood: 'Got it',
      
      // Messages
      otpSent: 'OTP code sent successfully',
      otpVerified: 'OTP verified successfully',
      registrationSuccess: 'Registration successful',
      loginSuccess: 'Login successful',
      updateSuccess: 'Updated successfully',
      deleteSuccess: 'Deleted successfully',
      loadFailed: 'Failed to load data',
      sendOTPFailed: 'Failed to send OTP',
      loadStatsFailed: 'Failed to load statistics',
      loadTransactionsFailed: 'Failed to load transactions',
      
      // Errors
      invalidOTP: 'Invalid OTP code',
      expiredOTP: 'OTP code expired',
      phoneRequired: 'Phone number is required',
      emailRequired: 'Email is required',
      nameRequired: 'Name is required',
      
      // Points Redemption
      pointsRedemption: 'Points Redemption',
      enterCustomerPhone: 'Enter customer phone number',
      searchCustomer: 'Search Customer',
      customerInfo: 'Customer Information',
      availablePoints: 'Available Points',
      availableBalance: 'Available Balance',
      pointsToRedeem: 'Points to Redeem',
      redeemPoints: 'Redeem Points',
      sendVerificationCode: 'Send Verification Code',
      verificationCode: 'Verification Code',
      verifyAndRedeem: 'Verify & Redeem',
      redemptionSuccess: 'Points redeemed successfully',
      insufficientPoints: 'Insufficient points balance',
      customerNotFound: 'Customer not found',
      enterValidPoints: 'Enter valid points amount',
      redeemAll: 'Redeem All',
      sarValue: 'SAR Value',
      remainingPoints: 'Remaining Points',
      
      // Staff Management
      staffManagement: 'Staff Management',
      addStaff: 'Add Staff',
      staffName: 'Staff Name',
      staffEmail: 'Email',
      staffPassword: 'Password',
      createStaff: 'Create Account',
      staffCreated: 'Staff account created',
      noStaff: 'No staff members',
      deleteStaff: 'Delete Staff',
      confirmDeleteStaff: 'Are you sure you want to delete this staff member?',
      
      // Customer Management
      editCustomer: 'Edit Customer',
      deleteCustomer: 'Delete Customer',
      suspendCustomer: 'Suspend Account',
      activateCustomer: 'Activate Account',
      suspensionReason: 'Suspension Reason',
      enterSuspensionReason: 'Enter the reason for suspension',
      confirmDeleteCustomer: 'Are you sure you want to delete this customer? All data will be deleted.',
      customerSuspended: 'Customer account suspended',
      customerActivated: 'Customer account activated',
      customerDeleted: 'Customer deleted',
      customerUpdated: 'Customer updated',
      suspended: 'Suspended',
      active: 'Active',
      accountSuspended: 'Account Suspended',
      accountSuspendedMessage: 'Your account has been suspended by the administration',
      suspensionReasonLabel: 'Reason',
      contactSupport: 'Please contact customer service to reactivate your account',
      close: 'Close',
      
      // Landing Page
      joinLoyaltyProgram: 'Join Loyalty Program',
      joinInstructions: 'To join the loyalty program, please request registration through our cashier staff when visiting Al-Reef Store',
      earnWithPurchase: 'Earn points with every purchase',
      tenSarOnePoint: 'Every 10 SAR = 1 point',
      exclusiveMemberRewards: 'Exclusive rewards for members',
      registerFree: 'Register Free',
      joinEasily: 'Join the loyalty program easily with your phone number',
      shopEarnPoints: 'Shop & Earn Points',
      everyTenSar: 'Every 10 SAR you spend = 1 point',
      getRewards: 'Get Rewards',
      redeemPointsRewards: 'Redeem your points for exclusive rewards and discounts',
      pointsAccumulation: 'Points Accumulation',
      autoPointsEveryInvoice: 'Earn points automatically with every invoice',
      exclusiveRewards: 'Exclusive Rewards',
      specialOffersDiscounts: 'Get special offers and exclusive discounts',
      
      // Footer
      allRightsReserved: 'All Rights Reserved',
      tamweenatWahatAlReef: 'Tamweenat Wahat Al-Reef',
      
      // Admin Sync
      syncControl: 'Sync Control',
      syncControlDesc: 'Enable or disable automatic sync every 15 minutes',
      stopSync: 'Stop Sync',
      enableSync: 'Enable Sync',
      manualSyncNow: 'Manual Sync Now',
      syncing: 'Syncing...',
      lastSyncStatus: 'Last Sync Status',
      status: 'Status',
      lastSyncTime: 'Last Sync Time',
      syncedInvoicesCount: 'Synced Invoices Count',
      lastInvoiceNumber: 'Last Invoice Number',
      failureReason: 'Failure Reason',
      syncStatusSuccess: 'Success',
      syncStatusFailed: 'Failed',
      syncStatusRunning: 'Running...',
      syncStatusPending: 'Pending',
      notYet: 'Not yet',
      syncDisabledWarning: 'Automatic sync is disabled. Enable it first to perform manual sync.',
      syncSuccessMsg: 'Sync completed successfully! Synced',
      invoices: 'invoices',
      autoSyncEnabled: 'Automatic sync enabled',
      autoSyncDisabled: 'Automatic sync disabled',
      loadSyncStatusFailed: 'Failed to load sync status',
      syncFailed: 'Sync failed',
      updateSyncStatusFailed: 'Failed to update sync status',
      importantInfo: 'Important Information',
      syncInfo1: 'Only invoices for registered loyalty program customers are synced',
      syncInfo2: 'Automatic sync runs every 15 minutes when enabled',
      syncInfo3: 'You can perform manual sync at any time',
      syncInfo4: 'Sync started from invoice number 160110',
      manageSyncWithRewaa: 'Manage Sync with Rewaa',
      
      // Admin Settings
      pointsEarningCriteria: 'Points Earning Criteria (SAR per point)',
      pointsEarningExample: 'Example: If value is 10, every 10 SAR = 1 point',
      rewardValueCriteria: 'Reward Value Criteria (points per SAR)',
      rewardValueExample: 'Example: If value is 10, every 10 points = 1 SAR reward',
      lastSyncedInvoiceNumber: 'Last Synced Invoice Number',
      systemStartsFromNext: 'System will start from the next invoice',
      updateRewaaSettingsNote: 'To update Rewaa settings, please modify the .env file on the server',
      loadSettingsFailed: 'Failed to load settings',
      updateFailed: 'Failed to update',
      
      // Admin Customers
      noCustomers: 'No customers',
      mobile: 'Mobile',
      loadCustomersFailed: 'Failed to load customers',
      
      // Recent Transactions
      recentTransactions: 'Recent Transactions',
      transactionType: 'Transaction Type',
      customer: 'Customer',
      date: 'Date',
      noRecentTransactions: 'No recent transactions',
      loadTransactionsFailed: 'Failed to load transactions',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;