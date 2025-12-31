import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ArrowRight, Edit2, Trash2, Ban, CheckCircle, Loader2, AlertTriangle, X, User, Phone, Gift, Award, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'sonner';

export default function AdminCustomers() {
  const { t, i18n } = useTranslation();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Modals
  const [editModal, setEditModal] = useState(null);
  const [suspendModal, setSuspendModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [addPointsModal, setAddPointsModal] = useState(null);
  
  // Forms
  const [editForm, setEditForm] = useState({ name: '', phone: '' });
  const [suspendReason, setSuspendReason] = useState('');
  const [pointsForm, setPointsForm] = useState({ points: '', description: '' });

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get(`/admin/customers?search=${search}`);
      setCustomers(response.data.customers);
    } catch (error) {
      toast.error(t('loadCustomersFailed'));
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (phone) => {
    if (phone && phone.startsWith('+966')) {
      return '0' + phone.slice(4);
    }
    return phone;
  };

  const openEditModal = (customer) => {
    setEditForm({
      name: customer.name,
      phone: formatPhone(customer.phone)
    });
    setEditModal(customer);
  };

  const openAddPointsModal = (customer) => {
    setPointsForm({ points: '', description: '' });
    setAddPointsModal(customer);
  };

  const handleUpdate = async () => {
    if (!editForm.name || !editForm.phone) {
      toast.error(t('nameRequired'));
      return;
    }
    
    setActionLoading('edit');
    try {
      await api.put(`/admin/customers/${editModal.id}`, {
        name: editForm.name,
        phone: editForm.phone
      });
      toast.success(t('customerUpdated'));
      setEditModal(null);
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddPoints = async () => {
    if (!pointsForm.points || !pointsForm.description) {
      toast.error('يرجى إدخال النقاط والوصف');
      return;
    }
    
    setActionLoading('points');
    try {
      await api.post(`/admin/customers/${addPointsModal.id}/add-points`, {
        points: parseFloat(pointsForm.points),
        description: pointsForm.description
      });
      toast.success('تم إضافة النقاط بنجاح');
      setAddPointsModal(null);
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'فشل إضافة النقاط');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      toast.error(t('enterSuspensionReason'));
      return;
    }
    
    setActionLoading('suspend');
    try {
      await api.post(`/admin/customers/${suspendModal.id}/suspend`, {
        reason: suspendReason
      });
      toast.success(t('customerSuspended'));
      setSuspendModal(null);
      setSuspendReason('');
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (customerId) => {
    setActionLoading(customerId);
    try {
      await api.post(`/admin/customers/${customerId}/activate`);
      toast.success(t('customerActivated'));
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    setActionLoading('delete');
    try {
      await api.delete(`/admin/customers/${deleteModal.id}`);
      toast.success(t('customerDeleted'));
      setDeleteModal(null);
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A4D2E]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="p-4">
          {/* Back Button */}
          <Link 
            to="/admin/dashboard"
            className="flex items-center gap-2 text-[#1A4D2E] mb-3"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="text-sm font-medium">لوحة التحكم</span>
          </Link>

          {/* Title & Search */}
          <h1 className="text-xl font-bold text-gray-900 mb-3">
            👥 إدارة العملاء
          </h1>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالاسم أو الجوال..."
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A4D2E] focus:border-transparent"
            />
          </div>

          {/* Results Count */}
          <p className="text-sm text-gray-600 mt-2">
            {customers.length} عميل
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الاسم</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الجوال</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">النقاط</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الحالة</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{customer.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatPhone(customer.phone)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#1A4D2E]">
                      {customer.active_points?.toFixed(1) || 0}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        customer.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.is_active ? 'نشط' : 'معطل'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(customer)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openAddPointsModal(customer)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          <Gift className="w-4 h-4" />
                        </button>
                        {customer.is_active ? (
                          <button
                            onClick={() => setSuspendModal(customer)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(customer.id)}
                            disabled={actionLoading === customer.id}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          >
                            {actionLoading === customer.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteModal(customer)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-3">
          {customers.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">لا يوجد عملاء</p>
            </div>
          ) : (
            customers.map((customer) => (
              <div 
                key={customer.id} 
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {customer.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{formatPhone(customer.phone)}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    customer.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {customer.is_active ? '✓ نشط' : '✗ معطل'}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-emerald-50 p-3 rounded-lg text-center">
                    <Award className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600 mb-1">النقاط</p>
                    <p className="text-lg font-bold text-emerald-700">
                      {customer.active_points?.toFixed(0) || 0}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600 mb-1">الإجمالي</p>
                    <p className="text-lg font-bold text-blue-700">
                      {customer.total_points?.toFixed(0) || 0}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <Gift className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600 mb-1">الفواتير</p>
                    <p className="text-lg font-bold text-purple-700">
                      {customer.invoice_count || 0}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openEditModal(customer)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => openAddPointsModal(customer)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    <Gift className="w-4 h-4" />
                    <span>نقاط</span>
                  </button>
                  {customer.is_active ? (
                    <button
                      onClick={() => setSuspendModal(customer)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                    >
                      <Ban className="w-4 h-4" />
                      <span>تعطيل</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(customer.id)}
                      disabled={actionLoading === customer.id}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === customer.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>تفعيل</span>
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteModal(customer)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">تعديل بيانات العميل</h3>
              <button onClick={() => setEditModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A4D2E] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الجوال</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A4D2E] focus:border-transparent"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdate}
                disabled={actionLoading === 'edit'}
                className="flex-1 bg-[#1A4D2E] text-white py-3 rounded-xl font-bold hover:bg-[#143d24] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === 'edit' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>حفظ التعديلات</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setEditModal(null)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Points Modal */}
      {addPointsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">إضافة نقاط</h3>
              <button onClick={() => setAddPointsModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl mb-4">
              <p className="text-sm text-gray-700">العميل: <span className="font-bold">{addPointsModal.name}</span></p>
              <p className="text-sm text-gray-700">النقاط الحالية: <span className="font-bold text-emerald-700">{addPointsModal.active_points?.toFixed(0) || 0}</span></p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عدد النقاط</label>
                <input
                  type="number"
                  value={pointsForm.points}
                  onChange={(e) => setPointsForm({...pointsForm, points: e.target.value})}
                  placeholder="مثال: 100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A4D2E] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">السبب</label>
                <input
                  type="text"
                  value={pointsForm.description}
                  onChange={(e) => setPointsForm({...pointsForm, description: e.target.value})}
                  placeholder="مثال: مكافأة خاصة"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A4D2E] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddPoints}
                disabled={actionLoading === 'points'}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === 'points' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Gift className="w-5 h-5" />
                    <span>إضافة النقاط</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setAddPointsModal(null)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {suspendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">تعطيل الحساب</h3>
              <button onClick={() => setSuspendModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 mb-1">تحذير</p>
                  <p className="text-sm text-gray-700">سيتم تعطيل حساب <span className="font-bold">{suspendModal.name}</span></p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">سبب التعطيل</label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="يرجى ذكر سبب تعطيل الحساب..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSuspend}
                disabled={actionLoading === 'suspend'}
                className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === 'suspend' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Ban className="w-5 h-5" />
                    <span>تعطيل الحساب</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setSuspendModal(null)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-red-600">حذف العميل</h3>
              <button onClick={() => setDeleteModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 mb-1">تحذير: هذا الإجراء لا يمكن التراجع عنه</p>
                  <p className="text-sm text-gray-700">سيتم حذف <span className="font-bold">{deleteModal.name}</span> وجميع بياناته نهائياً</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={actionLoading === 'delete'}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === 'delete' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    <span>حذف نهائياً</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
