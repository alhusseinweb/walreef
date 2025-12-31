import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, Power, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AdminSync() {
  const { t, i18n } = useTranslation();
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    try {
      const response = await api.get('/admin/sync/status');
      setSyncStatus(response.data);
    } catch (error) {
      toast.error(t('loadSyncStatusFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const response = await api.post('/admin/sync/manual');
      toast.success(`${t('syncSuccessMsg')} ${response.data.synced_count} ${t('invoices')}`);
      await fetchSyncStatus();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('syncFailed'));
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleSync = async () => {
    const newStatus = syncStatus?.sync_enabled !== 'true';
    try {
      await api.put('/admin/sync/toggle', newStatus);
      toast.success(newStatus ? t('autoSyncEnabled') : t('autoSyncDisabled'));
      await fetchSyncStatus();
    } catch (error) {
      toast.error(t('updateSyncStatusFailed'));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return t('notYet');
    try {
      return new Date(dateStr).toLocaleString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'running':
        return <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success':
        return t('syncStatusSuccess');
      case 'failed':
        return t('syncStatusFailed');
      case 'running':
        return t('syncStatusRunning');
      default:
        return t('syncStatusPending');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A4D2E]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAF9]">
      {/* Header */}
      <header className="bg-[#1A4D2E] text-white p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link to="/admin/dashboard" data-testid="back-btn">
            <ArrowRight className="w-6 h-6" />
          </Link>
          <h1 className="text-xl md:text-2xl font-bold" data-testid="page-title">
            {t('manageSyncWithRewaa')}
          </h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Sync Control Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 md:p-6 border border-emerald-100 shadow-sm"
          data-testid="sync-control-card"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-[#1A4D2E] mb-2">{t('syncControl')}</h2>
              <p className="text-sm text-gray-600">{t('syncControlDesc')}</p>
            </div>
            <button
              onClick={handleToggleSync}
              className={`flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-xl font-bold transition-colors whitespace-nowrap ${
                syncStatus?.sync_enabled === 'true'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
              data-testid="toggle-sync-btn"
            >
              <Power className="w-5 h-5" />
              <span className="text-sm md:text-base">
                {syncStatus?.sync_enabled === 'true' ? t('stopSync') : t('enableSync')}
              </span>
            </button>
          </div>

          <button
            onClick={handleManualSync}
            disabled={syncing || syncStatus?.sync_enabled !== 'true'}
            className="w-full bg-[#1A4D2E] text-white py-3 md:py-4 rounded-xl font-bold hover:bg-[#143d24] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            data-testid="manual-sync-btn"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? t('syncing') : t('manualSyncNow')}
          </button>

          {syncStatus?.sync_enabled !== 'true' && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">{t('syncDisabledWarning')}</p>
            </div>
          )}
        </motion.div>

        {/* Sync Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 md:p-6 border border-emerald-100 shadow-sm"
          data-testid="sync-status-card"
        >
          <h2 className="text-lg md:text-xl font-bold text-[#1A4D2E] mb-6">{t('lastSyncStatus')}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                {getStatusIcon(syncStatus?.last_sync_status)}
                <h3 className="font-bold text-gray-700 text-sm md:text-base">{t('status')}</h3>
              </div>
              <p className="text-lg md:text-2xl font-bold text-[#1A4D2E]" data-testid="sync-status">
                {getStatusText(syncStatus?.last_sync_status)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-[#FFC107]" />
                <h3 className="font-bold text-gray-700 text-sm md:text-base">{t('lastSyncTime')}</h3>
              </div>
              <p className="text-xs md:text-sm text-gray-600" data-testid="last-sync-time">
                {formatDate(syncStatus?.last_sync_time)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="font-bold text-gray-700 text-sm md:text-base">{t('syncedInvoicesCount')}</h3>
              </div>
              <p className="text-lg md:text-2xl font-bold text-[#1A4D2E]" data-testid="sync-count">
                {syncStatus?.last_sync_count || 0}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-6 h-6 text-[#1A4D2E]" />
                <h3 className="font-bold text-gray-700 text-sm md:text-base">{t('lastInvoiceNumber')}</h3>
              </div>
              <p className="text-lg md:text-2xl font-bold text-[#1A4D2E]" data-testid="last-invoice">
                {syncStatus?.last_synced_invoice || '160110'}
              </p>
            </div>
          </div>

          {syncStatus?.last_sync_error && syncStatus.last_sync_status === 'failed' && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4" data-testid="sync-error">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-800 mb-1">{t('failureReason')}:</h4>
                  <p className="text-sm text-red-700">{syncStatus.last_sync_error}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6"
        >
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-sm md:text-base">
            <AlertCircle className="w-5 h-5" />
            {t('importantInfo')}
          </h3>
          <ul className="space-y-2 text-xs md:text-sm text-blue-800">
            <li>• {t('syncInfo1')}</li>
            <li>• {t('syncInfo2')}</li>
            <li>• {t('syncInfo3')}</li>
            <li>• {t('syncInfo4')}</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
