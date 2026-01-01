import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, ArrowRight, Save, Mail, Send, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AdminSettings() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchNotificationEmail();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      const settingsObj = {};
      response.data.settings.forEach(s => {
        settingsObj[s.key] = s.value;
      });
      setSettings(settingsObj);
    } catch (error) {
      toast.error(t('loadSettingsFailed'));
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationEmail = async () => {
    try {
      const response = await api.get('/admin/settings/notification-email');
      setNotificationEmail(response.data.email || '');
    } catch (error) {
      console.error('Error fetching notification email:', error);
    }
  };

  const updateSetting = async (key, value) => {
    setSaving(true);
    try {
      await api.put(`/admin/settings/${key}?value=${encodeURIComponent(value)}`);
      toast.success(t('updateSuccess'));
    } catch (error) {
      console.error('Update setting error:', error);
      toast.error(t('updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  const updateNotificationEmail = async () => {
    if (!notificationEmail) {
      toast.error('يرجى إدخال البريد الإلكتروني');
      return;
    }
    
    setSaving(true);
    try {
      await api.put(`/admin/settings/notification-email?email=${encodeURIComponent(notificationEmail)}`);
      toast.success('تم تحديث البريد الإلكتروني بنجاح');
    } catch (error) {
      console.error('Update notification email error:', error);
      toast.error(error.response?.data?.detail || 'فشل تحديث البريد الإلكتروني');
    } finally {
      setSaving(false);
    }
  };

  const sendTestEmail = async () => {
    setSendingTestEmail(true);
    setTestEmailSent(false);
    try {
      await api.post('/admin/settings/test-email');
      setTestEmailSent(true);
      toast.success('تم إرسال رسالة الاختبار بنجاح');
      setTimeout(() => setTestEmailSent(false), 5000);
    } catch (error) {
      console.error('Send test email error:', error);
      toast.error(error.response?.data?.detail || 'فشل إرسال رسالة الاختبار');
    } finally {
      setSendingTestEmail(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen" data-testid="loading-spinner">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A4D2E]"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#F9FAF9]">
      {/* Header */}
      <header className="bg-[#1A4D2E] text-white p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link to="/admin/dashboard" data-testid="back-btn">
            <ArrowRight className="w-6 h-6" />
          </Link>
          <h1 className="text-xl md:text-2xl font-bold" data-testid="page-title">{t('settings')}</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 md:p-6 border border-emerald-100 shadow-sm space-y-6"
          data-testid="settings-form"
        >
          {/* Points Multiplier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('pointsEarningCriteria')}
            </label>
            <div className="relative">
              <input
                type="number"
                value={settings.points_multiplier || 10}
                onChange={(e) => setSettings({...settings, points_multiplier: e.target.value})}
                onBlur={(e) => updateSetting('points_multiplier', e.target.value)}
                className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-[#1A4D2E] focus:border-transparent text-base md:text-base"
                data-testid="points-multiplier-input"
                min="1"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {t('pointsEarningExample')}
            </p>
          </div>

          {/* Reward Multiplier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('rewardValueCriteria')}
            </label>
            <input
              type="number"
              value={settings.points_reward_multiplier || 10}
              onChange={(e) => setSettings({...settings, points_reward_multiplier: e.target.value})}
              onBlur={(e) => updateSetting('points_reward_multiplier', e.target.value)}
              className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-[#1A4D2E] focus:border-transparent text-base md:text-base"
              data-testid="points-reward-multiplier-input"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-2">
              {t('rewardValueExample')}
            </p>
          </div>

          {/* Last Synced Invoice */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('lastSyncedInvoiceNumber')}
            </label>
            <input
              type="number"
              value={settings.last_synced_invoice || 0}
              onChange={(e) => setSettings({...settings, last_synced_invoice: e.target.value})}
              onBlur={(e) => updateSetting('last_synced_invoice', e.target.value)}
              className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-[#1A4D2E] focus:border-transparent text-base md:text-base"
              data-testid="last-synced-invoice-input"
            />
            <p className="text-xs text-gray-500 mt-2">{t('systemStartsFromNext')}</p>
          </div>

          {/* Info Note */}
          <div className="pt-4 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 flex items-start gap-2">
                <SettingsIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{t('updateRewaaSettingsNote')}</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
