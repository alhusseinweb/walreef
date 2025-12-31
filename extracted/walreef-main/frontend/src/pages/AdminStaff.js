import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Plus, Trash2, ArrowRight, Loader2, Shield, UserCog, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'sonner';

export default function AdminStaff() {
  const { t, i18n } = useTranslation();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'staff'
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await api.get('/admin/staff');
      setStaff(response.data.staff);
    } catch (error) {
      toast.error(t('loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast.error(t('nameRequired'));
      return;
    }
    
    setSaving(true);
    try {
      await api.post('/admin/staff', formData);
      toast.success(t('staffCreated'));
      setFormData({ name: '', phone: '', role: 'staff' });
      setShowForm(false);
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (staffId, staffName) => {
    setConfirmDelete({ id: staffId, name: staffName });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    
    setDeleting(confirmDelete.id);
    try {
      await api.delete(`/admin/staff/${confirmDelete.id}`);
      toast.success(t('deleteSuccess'));
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  const getRoleDisplay = (role) => {
    if (i18n.language === 'ar') {
      return role === 'admin' ? 'مدير' : 'موظف';
    }
    return role === 'admin' ? 'Admin' : 'Staff';
  };

  const formatPhone = (phone) => {
    if (phone && phone.startsWith('+966')) {
      return '0' + phone.slice(4);
    }
    return phone;
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
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('confirmDeleteStaff')}</h3>
              <p className="text-gray-600 mb-6">{confirmDelete.name}</p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDeleteAction}
                  disabled={deleting}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  {t('delete')}
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="bg-[#1A4D2E] text-white py-6 px-4">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" data-testid="back-btn">
              <ArrowRight className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold" data-testid="page-title">{t('staffManagement')}</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-[#1A4D2E] px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-50"
            data-testid="add-staff-btn"
          >
            <Plus className="w-5 h-5" />
            {t('addStaff')}
          </button>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Add Staff Form */}
        {showForm && (
          <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm mb-6" data-testid="staff-form">
            <h2 className="text-lg font-bold text-[#1A4D2E] mb-4">{t('addStaff')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('name')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="اسم الموظف"
                  className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-[#1A4D2E] focus:border-transparent"
                  data-testid="staff-name-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('phoneNumber')}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="05XXXXXXXX"
                  className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-[#1A4D2E] focus:border-transparent"
                  dir="ltr"
                  data-testid="staff-phone-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {i18n.language === 'ar' ? 'نوع الصلاحية' : 'Role'}
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-[#1A4D2E] focus:border-transparent"
                  data-testid="staff-role-select"
                >
                  <option value="staff">{i18n.language === 'ar' ? 'موظف خدمة العملاء' : 'Staff'}</option>
                  <option value="admin">{i18n.language === 'ar' ? 'مدير' : 'Admin'}</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#1A4D2E] text-white py-3 rounded-xl font-bold hover:bg-[#143d24] disabled:opacity-50 flex items-center justify-center gap-2"
                  data-testid="create-staff-btn"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  {t('createStaff')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-50"
                  data-testid="cancel-btn"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Staff List */}
        {staff.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center" data-testid="no-staff">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">{t('noStaff')}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden" data-testid="staff-list">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">{t('name')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">{t('phoneNumber')}</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-700">
                      {i18n.language === 'ar' ? 'الصلاحية' : 'Role'}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-700">{t('delete')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {staff.map((member, index) => (
                    <tr key={member.id} className="hover:bg-emerald-50" data-testid={`staff-row-${index}`}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900" data-testid={`staff-name-${index}`}>
                        <div className="flex items-center gap-2">
                          {member.role === 'admin' ? (
                            <Shield className="w-4 h-4 text-[#FFC107]" />
                          ) : (
                            <UserCog className="w-4 h-4 text-gray-400" />
                          )}
                          {member.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600" dir="ltr" data-testid={`staff-phone-${index}`}>
                        {formatPhone(member.phone)}
                      </td>
                      <td className="px-6 py-4 text-center" data-testid={`staff-role-${index}`}>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          member.role === 'admin' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {getRoleDisplay(member.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(member.id, member.name)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                          data-testid={`delete-staff-${index}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
