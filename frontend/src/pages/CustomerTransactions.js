import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Receipt, TrendingUp, TrendingDown, RotateCcw, Gift } from 'lucide-react';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { toast } from 'sonner';

// Helper function to get transaction display info
const getTransactionInfo = (type, t) => {
  switch (type) {
    case 'earned':
      return {
        label: t('pointsEarned'),
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        iconColor: 'text-green-500'
      };
    case 'returned':
      return {
        label: t('returnDeduction'),
        icon: RotateCcw,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        iconColor: 'text-red-500'
      };
    case 'redeemed':
      return {
        label: t('pointsRedeemed'),
        icon: Gift,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        iconColor: 'text-orange-500'
      };
    case 'expired':
      return {
        label: t('expiredPointsTrans'),
        icon: TrendingDown,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        iconColor: 'text-gray-500'
      };
    case 'manual_add':
      return {
        label: t('manualAddition'),
        icon: TrendingUp,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-500'
      };
    default:
      return {
        label: type,
        icon: Receipt,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        iconColor: 'text-gray-500'
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
      <div className="bg-[#1A4D2E] text-white py-6 px-4">
        <div className="container mx-auto max-w-md">
          <h1 className="text-2xl font-bold" data-testid="page-title">{t('myTransactions')}</h1>
        </div>
      </div>

      <div className="container mx-auto max-w-md px-4 mt-6">
        {transactions.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center" data-testid="no-transactions">
            <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">{t('noTransactions')}</p>
          </div>
        ) : (
          <div className="space-y-4" data-testid="transactions-list">
            {transactions.map((trans, index) => {
              const transInfo = getTransactionInfo(trans.transaction_type, t);
              const IconComponent = transInfo.icon;
              
              return (
                <div 
                  key={index} 
                  className={`bg-white rounded-xl p-4 border shadow-sm ${trans.transaction_type === 'returned' ? 'border-red-200' : 'border-emerald-100'}`}
                  data-testid={`transaction-${index}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${transInfo.bgColor}`}>
                      <IconComponent className={`w-5 h-5 ${transInfo.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`font-bold ${transInfo.color}`} data-testid={`trans-type-${index}`}>
                            {transInfo.label}
                          </p>
                          <p className="text-sm text-gray-600 mt-1" data-testid={`trans-desc-${index}`}>
                            {trans.description}
                          </p>
                        </div>
                        <p className={`text-xl font-bold ${trans.points > 0 ? 'text-green-600' : 'text-red-600'}`} data-testid={`trans-points-${index}`}>
                          {trans.points > 0 ? '+' : ''}{trans.points.toFixed(1)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2" data-testid={`trans-date-${index}`}>
                        {new Date(trans.created_at).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}