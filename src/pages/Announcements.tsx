import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Info, 
  Star,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { announcementsAPI } from '../services/api';

const Announcements = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery(
    ['announcements', page, selectedCategory, searchTerm],
    () => announcementsAPI.getAll({
      page,
      limit: 6,
      category: selectedCategory || undefined,
      search: searchTerm || undefined,
    }),
    { keepPreviousData: true }
  );

  const categories = [
    { value: '', label: 'Semua Kategori' },
    { value: 'urgent', label: 'Urgent', icon: AlertTriangle, color: 'text-red-600' },
    { value: 'info', label: 'Informasi', icon: Info, color: 'text-blue-600' },
    { value: 'event', label: 'Acara', icon: Calendar, color: 'text-green-600' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'normal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.value === category);
    if (categoryData && categoryData.icon) {
      const Icon = categoryData.icon;
      return <Icon className={`w-4 h-4 ${categoryData.color}`} />;
    }
    return <Info className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
        >
          Pengumuman Desa
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          Dapatkan informasi terkini dan pengumuman penting dari pemerintah desa
        </motion.p>
      </div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari pengumuman..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all appearance-none"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Announcements Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div 
            key={page}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {data?.data?.announcements?.map((announcement: any, index: number) => (
              <motion.article
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                {/* Priority indicator */}
                {announcement.priority === 'high' && (
                  <div className="h-1 bg-red-500"></div>
                )}

                <div className="p-6">
                  {/* Category and date */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1">
                      {getCategoryIcon(announcement.category)}
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(announcement.priority)}`}>
                        {announcement.category === 'urgent' ? 'Urgent' : 
                         announcement.category === 'info' ? 'Info' : 'Acara'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {format(new Date(announcement.created_at), 'dd MMM yyyy', { locale: id })}
                      </span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {announcement.title}
                  </h3>

                  {/* Content preview */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                    {announcement.content.replace(/<[^>]*>/g, '')}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>Oleh {announcement.author_name}</span>
                    </span>
                    {announcement.priority === 'high' && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {data?.data?.pagination && (
        <div className="flex justify-center space-x-2">
          {[...Array(data.data.pagination.pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                page === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;