import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  Search, 
  Filter, 
  Download, 
  FileText, 
  File, 
  Calendar,
  Eye,
  FolderOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { documentsAPI } from '../services/api';

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: documentsData, isLoading } = useQuery(
    ['documents', searchTerm, selectedCategory],
    () => documentsAPI.getAll({
      search: searchTerm || undefined,
      category: selectedCategory || undefined,
    })
  );

  const categories = [
    { value: '', label: 'Semua Kategori' },
    { value: 'sop', label: 'Standar Operasional Prosedur' },
    { value: 'peraturan', label: 'Peraturan Desa' },
    { value: 'laporan', label: 'Laporan Keuangan' },
    { value: 'formulir', label: 'Formulir Layanan' },
    { value: 'profil', label: 'Profil Desa' },
  ];

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('word')) return '📝';
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return '📊';
    if (mimeType?.includes('powerpoint') || mimeType?.includes('presentation')) return '📋';
    return '📄';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (documentId: string, title: string) => {
    try {
      const response = await documentsAPI.download(documentId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
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
          Dokumen Publik
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          Akses dokumen-dokumen penting dan SOP pelayanan desa
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
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari dokumen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all"
            />
          </div>

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

      {/* Documents Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {documentsData?.data?.documents?.map((document: any, index: number) => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden group"
            >
              <div className="p-6">
                {/* File Icon and Category */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-4xl">
                      {getFileIcon(document.mime_type)}
                    </div>
                    <div>
                      <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                        {categories.find(cat => cat.value === document.category)?.label || document.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {document.title}
                </h3>

                {/* Description */}
                {document.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                    {document.description}
                  </p>
                )}

                {/* File Details */}
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center justify-between">
                    <span>Ukuran: {formatFileSize(document.file_size)}</span>
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{document.download_count} unduhan</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Diupload: {format(new Date(document.created_at), 'dd MMM yyyy', { locale: id })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(document.id, document.title)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && (!documentsData?.data?.documents || documentsData.data.documents.length === 0) && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Tidak Ada Dokumen
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Belum ada dokumen yang tersedia untuk kategori ini
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Documents;