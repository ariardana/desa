import React from 'react';
import { useQuery } from 'react-query';
import { 
  Users, 
  Megaphone, 
  MessageSquare, 
  Calendar,
  FileText,
  TrendingUp,
  Activity,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { dashboardAPI } from '../../services/api';

const Dashboard = () => {
  const { data: statsData, isLoading: statsLoading } = useQuery(
    ['dashboard-stats'],
    dashboardAPI.getStats
  );

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    ['dashboard-analytics', '30d'],
    () => dashboardAPI.getAnalytics('30d')
  );

  const stats = statsData?.data;
  const analytics = analyticsData?.data;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const StatCard = ({ icon: Icon, title, value, change, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% dari bulan lalu
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
        >
          Dashboard Admin
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 dark:text-gray-400"
        >
          Monitor aktivitas dan statistik sistem informasi desa
        </motion.p>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            title="Total Pengguna"
            value={stats?.users || 0}
            change={12}
            color="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
          />
          <StatCard
            icon={Megaphone}
            title="Pengumuman Aktif"
            value={stats?.announcements || 0}
            change={5}
            color="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
          />
          <StatCard
            icon={MessageSquare}
            title="Total Aduan"
            value={stats?.complaints || 0}
            change={-3}
            color="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400"
          />
          <StatCard
            icon={FileText}
            title="Dokumen Tersedia"
            value={stats?.documents || 0}
            change={8}
            color="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400"
          />
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Registration Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Tren Registrasi Pengguna (30 Hari Terakhir)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.userRegistrations || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => format(new Date(value), 'dd/MM')}
              />
              <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => format(new Date(value), 'dd MMMM yyyy', { locale: id })}
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Complaints by Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Status Aduan Warga
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats?.complaintsByStatus || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {(stats?.complaintsByStatus || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Aduan Terbaru
        </h3>
        
        {stats?.recentComplaints?.length > 0 ? (
          <div className="space-y-4">
            {stats.recentComplaints.map((complaint: any) => (
              <div key={complaint.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {complaint.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Oleh: {complaint.user_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    complaint.status === 'submitted' 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : complaint.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {complaint.status === 'submitted' ? 'Disubmit' :
                     complaint.status === 'in_progress' ? 'Diproses' : 'Selesai'}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {format(new Date(complaint.created_at), 'dd MMM, HH:mm', { locale: id })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">Belum ada aduan terbaru</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;