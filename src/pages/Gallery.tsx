import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Search, Filter, Calendar, User, Eye, Grid, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { galleryAPI } from '../services/api';

interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  mime_type: string;
  category: string;
  uploaded_by_name: string;
  created_at: string;
}

const Gallery = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const { data: galleryData, isLoading } = useQuery(
    ['gallery', searchTerm, selectedCategory],
    () => galleryAPI.getAll({
      search: searchTerm || undefined,
      category: selectedCategory || undefined,
    })
  );

  const categories = [
    { value: '', label: 'Semua Kategori' },
    { value: 'kegiatan', label: 'Kegiatan Desa' },
    { value: 'infrastruktur', label: 'Infrastruktur' },
    { value: 'wisata', label: 'Wisata' },
    { value: 'budaya', label: 'Budaya' },
    { value: 'ekonomi', label: 'Ekonomi' },
  ];

  const isImage = (mimeType: string) => {
    return mimeType?.startsWith('image/');
  };

  const isVideo = (mimeType: string) => {
    return mimeType?.startsWith('video/');
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
          Galeri Desa
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          Dokumentasi foto dan video kegiatan desa
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
              placeholder="Cari foto atau video..."
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

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {galleryData?.data?.gallery?.map((item: GalleryItem, index: number) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
              onClick={() => setSelectedImage(item)}
            >
              {/* Media Preview */}
              <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                {isImage(item.mime_type) ? (
                  <img
                    src={`https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=400`}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : isVideo(item.mime_type) ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2 mx-auto">
                        <span className="text-white text-2xl">▶</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Video</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Category badge */}
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded-full">
                    {categories.find(cat => cat.value === item.category)?.label || item.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                
                {item.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{item.uploaded_by_name}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {format(new Date(item.created_at), 'dd MMM yyyy', { locale: id })}
                    </span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {isImage(selectedImage.mime_type) ? (
                <img
                  src={`https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=800`}
                  alt={selectedImage.title}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <p className="text-gray-600 dark:text-gray-400">Preview not available</p>
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedImage.title}
                </h3>
                {selectedImage.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedImage.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Diupload oleh: {selectedImage.uploaded_by_name}</span>
                  <span>{format(new Date(selectedImage.created_at), 'dd MMM yyyy', { locale: id })}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!isLoading && (!galleryData?.data?.gallery || galleryData.data.gallery.length === 0) && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Grid className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Belum Ada Media
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Belum ada foto atau video yang tersedia untuk kategori ini
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Gallery;