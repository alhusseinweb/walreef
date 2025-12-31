import { Link, useLocation } from 'react-router-dom';
import { Home, History, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/customer/dashboard', icon: Home, label: t('home'), testId: 'nav-home' },
    { path: '/customer/transactions', icon: History, label: t('transactions'), testId: 'nav-transactions' },
    { path: '/customer/profile', icon: User, label: t('profile'), testId: 'nav-profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-emerald-100 h-20 pb-2 z-50 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]" data-testid="bottom-nav">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'text-[#1A4D2E] bg-emerald-50'
                : 'text-gray-600 hover:text-[#1A4D2E]'
            }`}
            data-testid={item.testId}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}