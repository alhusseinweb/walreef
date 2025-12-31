import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  Award, 
  Activity,
  Calendar,
  RefreshCw,
  ArrowRight,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const COLORS = ['#1A4D2E', '#4F772D', '#90A955', '#FFC107', '#FF6B35', '#6C757D'];

const AdminReports = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("month");
  const [activeTab, setActiveTab] = useState("customers");
  
  // Reports data
  const [customerReports, setCustomerReports] = useState(null);
  const [pointsReports, setPointsReports] = useState(null);
  const [performanceReports, setPerformanceReports] = useState(null);
  const [chartsData, setChartsData] = useState(null);

  useEffect(() => {
    fetchAllReports();
  }, [period]);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [customers, points, performance, charts] = await Promise.all([
        axios.get(`${API}/admin/reports/customers?period=${period}`, { headers }),
        axios.get(`${API}/admin/reports/points?period=${period}`, { headers }),
        axios.get(`${API}/admin/reports/performance?period=${period}`, { headers }),
        axios.get(`${API}/admin/reports/charts?period=${period}`, { headers })
      ]);

      setCustomerReports(customers.data);
      setPointsReports(points.data);
      setPerformanceReports(performance.data);
      setChartsData(charts.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = "green" }) => (
    <Card className="p-4" data-testid={`stat-card-${title}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      {subtitle && <p className="text-xs text-gray-600">{subtitle}</p>}
    </Card>
  );

  const MobileTable = ({ title, data, columns }) => (
    <Card className="p-4" data-testid={`table-${title}`}>
      <h3 className="text-base font-semibold mb-3">{title}</h3>
      <div className="space-y-3">
        {data && data.length > 0 ? (
          data.map((row, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">{row.name}</span>
                <span className="text-lg font-bold text-[#1A4D2E]">
                  {columns[columns.length - 1].render ? 
                    columns[columns.length - 1].render(row[columns[columns.length - 1].key], row) : 
                    row[columns[columns.length - 1].key]}
                </span>
              </div>
              {row.phone && (
                <p className="text-xs text-gray-500">{row.phone}</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">لا توجد بيانات</p>
        )}
      </div>
    </Card>
  );

  const TabButton = ({ value, icon: Icon, label, isActive }) => (
    <button
      onClick={() => setActiveTab(value)}
      className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
        isActive 
          ? 'bg-[#1A4D2E] text-white shadow-lg' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      data-testid={`tab-${value}`}
    >
      <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-white' : 'text-gray-600'}`} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50" data-testid="admin-reports-page">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="p-4">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-[#1A4D2E] mb-3"
            data-testid="back-to-dashboard"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="text-sm font-medium">لوحة التحكم</span>
          </button>

          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            📊 التقارير والتحليلات
          </h1>
          <p className="text-sm text-gray-600 mb-3">تقارير شاملة عن أداء برنامج الولاء</p>

          {/* Controls */}
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod} data-testid="period-select">
              <SelectTrigger className="flex-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">اليوم</SelectItem>
                <SelectItem value="week">الأسبوع</SelectItem>
                <SelectItem value="month">الشهر</SelectItem>
                <SelectItem value="year">السنة</SelectItem>
                <SelectItem value="all">الكل</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={fetchAllReports} 
              disabled={loading}
              size="icon"
              data-testid="refresh-button"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="px-2 pb-2">
          <div className="grid grid-cols-4 gap-2">
            <TabButton value="customers" icon={Users} label="العملاء" isActive={activeTab === 'customers'} />
            <TabButton value="points" icon={Award} label="النقاط" isActive={activeTab === 'points'} />
            <TabButton value="performance" icon={Activity} label="الأداء" isActive={activeTab === 'performance'} />
            <TabButton value="charts" icon={TrendingUp} label="الرسوم" isActive={activeTab === 'charts'} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto text-[#1A4D2E] mb-4" />
            <p className="text-gray-600">جاري تحميل البيانات...</p>
          </div>
        ) : (
          <>
            {/* Customer Reports Tab */}
            {activeTab === 'customers' && customerReports && (
              <div className="space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-3">
                  <StatCard
                    title="إجمالي العملاء"
                    value={customerReports.total_customers}
                    icon={Users}
                    color="blue"
                  />
                  <StatCard
                    title="عملاء جدد"
                    value={customerReports.new_customers}
                    subtitle={`خلال ${period === 'month' ? 'الشهر' : period === 'week' ? 'الأسبوع' : 'الفترة'}`}
                    icon={TrendingUp}
                    color="green"
                  />
                  <StatCard
                    title="عملاء غير نشطين"
                    value={customerReports.inactive_customers}
                    subtitle="لم يكسبوا نقاط منذ 30 يوم"
                    icon={Activity}
                    color="red"
                  />
                </div>

                {/* Top Customers Tables */}
                <MobileTable
                  title="أكثر 10 عملاء حسب النقاط المكتسبة"
                  data={customerReports.top_customers_by_points?.slice(0, 5)}
                  columns={[
                    { label: "الاسم", key: "name" },
                    { label: "الهاتف", key: "phone" },
                    { label: "النقاط", key: "total_points", render: (val) => val.toFixed(0) }
                  ]}
                />
                <MobileTable
                  title="أكثر 10 عملاء استبدالاً للنقاط"
                  data={customerReports.top_customers_by_redemption?.slice(0, 5)}
                  columns={[
                    { label: "الاسم", key: "name" },
                    { label: "النقاط المستبدلة", key: "total_redeemed" }
                  ]}
                />

                {/* Points Distribution */}
                <Card className="p-4">
                  <h3 className="text-base font-semibold mb-3">توزيع العملاء حسب رصيد النقاط</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {customerReports.points_distribution?.map((item, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg text-center">
                        <div className="text-xl font-bold text-[#1A4D2E]">{item.count}</div>
                        <div className="text-xs text-gray-600">{item.range} نقطة</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Points Reports Tab */}
            {activeTab === 'points' && pointsReports && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <StatCard
                    title="النقاط المكتسبة"
                    value={(pointsReports.total_earned || 0).toFixed(0)}
                    icon={Award}
                    color="green"
                  />
                  <StatCard
                    title="النقاط المستبدلة"
                    value={(pointsReports.total_redeemed || 0).toFixed(0)}
                    icon={Activity}
                    color="blue"
                  />
                  <StatCard
                    title="معدل الاستبدال"
                    value={`${(pointsReports.redemption_rate || 0).toFixed(1)}%`}
                    subtitle="نسبة النقاط المستبدلة"
                    icon={TrendingUp}
                    color="purple"
                  />
                  <StatCard
                    title="نقاط قريبة الانتهاء"
                    value={(pointsReports.points_expiring_soon || 0).toFixed(0)}
                    subtitle="خلال 30 يوم"
                    icon={Calendar}
                    color="orange"
                  />
                </div>

                <Card className="p-4">
                  <h3 className="text-base font-semibold mb-3">ملخص النقاط</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">إجمالي النقاط النشطة</span>
                      <span className="font-bold text-lg">{pointsReports.total_active_points.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">متوسط النقاط لكل عميل</span>
                      <span className="font-bold text-lg">{pointsReports.average_points_per_customer.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm">النقاط المنتهية</span>
                      <span className="font-bold text-lg">{pointsReports.total_expired.toFixed(0)}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="text-base font-semibold mb-3">مقارنة النقاط</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "مكتسبة", value: pointsReports.total_earned },
                          { name: "مستبدلة", value: pointsReports.total_redeemed },
                          { name: "نشطة", value: pointsReports.total_active_points }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.value.toFixed(0)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[0, 1, 2].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            )}

            {/* Performance Reports Tab */}
            {activeTab === 'performance' && performanceReports && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <StatCard
                    title="معدل النمو"
                    value={`${performanceReports.growth_rate.toFixed(1)}%`}
                    subtitle={`${performanceReports.new_customers_current} عميل جديد`}
                    trend={performanceReports.growth_rate}
                    icon={TrendingUp}
                    color="green"
                  />
                  <StatCard
                    title="معدل الاحتفاظ"
                    value={`${performanceReports.retention_rate.toFixed(1)}%`}
                    subtitle={`${performanceReports.retained_customers} عميل محتفظ`}
                    icon={Users}
                    color="blue"
                  />
                  <StatCard
                    title="ROI النقاط"
                    value={`${performanceReports.roi_percentage.toFixed(1)}%`}
                    subtitle="العائد على الاستثمار"
                    icon={Activity}
                    color="purple"
                  />
                  <StatCard
                    title="CLV"
                    value={`${performanceReports.customer_lifetime_value.toFixed(0)} ر.س`}
                    subtitle="قيمة العميل مدى الحياة"
                    icon={Award}
                    color="orange"
                  />
                </div>

                <Card className="p-4">
                  <h3 className="text-base font-semibold mb-3">تفاصيل النمو</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">العملاء الجدد (الحالية)</span>
                      <span className="font-bold">{performanceReports.new_customers_current}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">العملاء الجدد (السابقة)</span>
                      <span className="font-bold">{performanceReports.new_customers_previous}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">الفرق</span>
                      <span className="font-bold text-green-600">
                        {performanceReports.new_customers_current - performanceReports.new_customers_previous > 0 ? '+' : ''}
                        {performanceReports.new_customers_current - performanceReports.new_customers_previous}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="text-base font-semibold mb-3">تفاصيل ROI</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">قيمة النقاط الممنوحة</span>
                      <span className="font-bold">{performanceReports.value_given_sar.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">قيمة النقاط المستبدلة</span>
                      <span className="font-bold">{performanceReports.value_redeemed_sar.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm">إجمالي المبيعات</span>
                      <span className="font-bold text-blue-600">{performanceReports.total_sales.toFixed(2)} ر.س</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Charts Tab */}
            {activeTab === 'charts' && chartsData && (
              <div className="space-y-4">
                {/* Customer Growth Chart */}
                <Card className="p-4">
                  <h3 className="text-base font-semibold mb-3">نمو العملاء بمرور الوقت</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartsData.customer_growth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{fontSize: 10}} />
                      <YAxis tick={{fontSize: 10}} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="customers" 
                        stroke="#1A4D2E" 
                        strokeWidth={2}
                        name="العملاء"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                {/* Points Comparison Chart */}
                <Card className="p-4">
                  <h3 className="text-base font-semibold mb-3">النقاط المكتسبة مقابل المستبدلة</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartsData.points_comparison}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{fontSize: 10}} />
                      <YAxis tick={{fontSize: 10}} />
                      <Tooltip />
                      <Legend wrapperStyle={{fontSize: '12px'}} />
                      <Bar dataKey="earned" fill="#1A4D2E" name="مكتسبة" />
                      <Bar dataKey="redeemed" fill="#FFC107" name="مستبدلة" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* Sales Chart */}
                <Card className="p-4">
                  <h3 className="text-base font-semibold mb-3">المبيعات بمرور الوقت</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartsData.sales_data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{fontSize: 10}} />
                      <YAxis tick={{fontSize: 10}} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#4F772D" 
                        strokeWidth={2}
                        name="المبيعات (ر.س)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                {/* Customer Distribution Pie Chart */}
                <Card className="p-4">
                  <h3 className="text-base font-semibold mb-3">توزيع العملاء حسب رصيد النقاط</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartsData.customer_distribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartsData.customer_distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{fontSize: '12px'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
