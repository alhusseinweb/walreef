import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Receipt, TrendingUp, TrendingDown, RotateCcw, Gift, Calendar, Clock } from 'lucide-react';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// Helper function to calculate expiry date (1 year from transaction date)
const getExpiryDate = (createdAt) => {
  const date = new Date(createdAt);
  date.setFullYear(date.getFullYear() + 1);
  return date;
};

// Helper function to check if points are about to expire (within 30 days)
const isAboutToExpire = (expiryDate) => {
  const now = new Date();
  const diffTime = expiryDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= 30;
};

// Helper function to check if points have expired
const hasExpired = (expiryDate) => {
  return new Date() > expiryDate;
};

// Helper function to get transaction display info
const getTransactionInfo = (type, t) => {
  switch (type) {
    case 'earned':
      return {
        label: t('pointsEarned'),
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        iconColor: 'text-green-500',
        borderColor: 'border-green-200'
      };
    case 'returned':
      return {
        label: t('returnDeduction'),
        icon: RotateCcw,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        iconColor: 'text-red-500',
        borderColor: 'border-red-200'
      };
    case 'redeemed':
      return {
        label: t('pointsRedeemed'),
        icon: Gift,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        iconColor: 'text-orange-500',
        borderColor: 'border-orange-200'
      };
    case 'expired':
      return {
        label: t('expiredPointsTrans'),
        icon: TrendingDown,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        iconColor: 'text-gray-500',
        borderColor: 'border-gray-200'
      };
    case 'manual_add':
      return {
        label: t('manualAddition'),
        icon: TrendingUp,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-500',
        borderColor: 'border-blue-200'
      };
    default:
      return {
        label: type,
        icon: Receipt,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        iconColor: 'text-gray-500',
        borderColor: 'border-gray-200'
      };
  }
};

export default function CustomerTransactions() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/customer/transactions');
      setTransactions(response.data.transactions);
    } catch (error) {
      toast.error(t('loadTransactionsFailed'));
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-xl md:text-2xl font-bold" data-testid="page-title">{t('myTransactions')}</h1>
          <p className="text-emerald-200 text-xs md:text-sm mt-1">
            سجل بجميع عمليات النقاط
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 mt-6">
        {transactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-8 md:p-12 text-center"
            data-testid="no-transactions"
          >
            <Receipt className="w-16 h-16 md:w-20 md:h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-sm md:text-base">{t('noTransactions')}</p>
          </motion.div>
        ) : (
          <div className="space-y-3 md:space-y-4" data-testid="transactions-list">
            {transactions.map((trans, index) => {
              const transInfo = getTransactionInfo(trans.transaction_type, t);
              const IconComponent = transInfo.icon;
              
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-xl p-4 md:p-5 border shadow-sm hover:shadow-md transition-shadow ${transInfo.borderColor}`}
                  data-testid={`transaction-${index}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`p-2 md:p-3 rounded-lg ${transInfo.bgColor} flex-shrink-0`}>
                      <IconComponent className={`w-5 h-5 md:w-6 md:h-6 ${transInfo.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm md:text-base ${transInfo.color} truncate`} data-testid={`trans-type-${index}`}>
                            {transInfo.label}
                          </p>
                          <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2" data-testid={`trans-desc-${index}`}>
                            {trans.description}
                          </p>
                        </div>
                        <p className={`text-lg md:text-xl lg:text-2xl font-bold flex-shrink-0 ${trans.points > 0 ? 'text-green-600' : 'text-red-600'}`} data-testid={`trans-points-${index}`}>
                          {trans.points > 0 ? '+' : ''}{trans.points.toFixed(1)}
                        </p>
                      </div>

                      {/* Date */}
                      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-500">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span data-testid={`trans-date-${index}`}>
                            {new Date(trans.created_at).toLocaleDateString('ar-SA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        {/* Expiry date for earned and manual_add transactions */}
                        {(trans.transaction_type === 'earned' || trans.transaction_type === 'manual_add') && trans.points > 0 && (
                          (() => {
                            const expiryDate = getExpiryDate(trans.created_at);
                            const expired = hasExpired(expiryDate);
                            const aboutToExpire = isAboutToExpire(expiryDate);
                            
                            return (
                              <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                                expired 
                                  ? 'bg-red-50 text-red-600' 
                                  : aboutToExpire 
                                    ? 'bg-amber-50 text-amber-600' 
                                    : 'bg-emerald-50 text-emerald-600'
                              }`}>
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                <span data-testid={`trans-expiry-${index}`}>
                                  {expired ? (
                                    'منتهية الصلاحية'
                                  ) : aboutToExpire ? (
                                    <>تنتهي قريباً: {expiryDate.toLocaleDateString('ar-SA', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}</>
                                  ) : (
                                    <>تنتهي: {expiryDate.toLocaleDateString('ar-SA', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}</>
                                  )}
                                </span>
                              </div>
                            );
                          })()
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
