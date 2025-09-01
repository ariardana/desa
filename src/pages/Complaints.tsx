import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle,
  Star,
  Upload,
  FileText,
  User,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { complaintsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const complaintSchema = yup.object({
  title: yup.string().min(5, 'Judul minimal 5 karakter').required('Judul diperlukan'),
  description: yup.string().min(10, 'Deskripsi minimal 10 karakter').required('Deskripsi diperlukan'),
  category: yup.string().required('Kategori diperlukan'),
  location: yup.string().optional(),
  priority: yup.string().oneOf(['low', 'normal', 'high']).default('normal'),
});

type ComplaintForm = yup.InferType<typeof complaintSchema>;

interface Complaint {
  id: string | number;
  title: string;
  user_name: string;
  created_at: string;
  status: string;
  description: string;
  location?: string;
  attachments: string; // This is a JSON string
  response?: string;
  rating?: number;
  user_id: string;
}

interface Attachment {
  filename: string;
  originalName: string;
  path: string;
  size: number;
}

const Complaints = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ComplaintForm>({
    resolver: yupResolver(complaintSchema),
  });

  const { data: complaintsData, isLoading } = useQuery(
    ['complaints', searchTerm, selectedStatus],
    () => complaintsAPI.getAll({
      search: searchTerm || undefined,
      status: selectedStatus || undefined,
    })
  );

  const createMutation = useMutation(complaintsAPI.create, {
    onSuccess: () => {
      toast.success('Aduan berhasil disubmit!');
      queryClient.invalidateQueries(['complaints']);
      setShowForm(false);
      reset();
      setSelectedFiles(null);
    },
    onError: (error: unknown) => {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || 'Gagal submit aduan');
      } else {
        toast.error('Gagal submit aduan');
      }
    },
  });

  const rateMutation = useMutation(
    ({ id, rating, feedback }: { id: string; rating: number; feedback?: string }) =>
      complaintsAPI.rate(id, { rating, feedback }),
    {
      onSuccess: () => {
        toast.success('Rating berhasil diberikan!');
        queryClient.invalidateQueries(['complaints']);
      },
      onError: (error: unknown) => {
        if (typeof error === 'object' && error !== null && 'response' in error) {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(err.response?.data?.message || 'Gagal memberikan rating');
        } else {
          toast.error('Gagal memberikan rating');
        }
      },
    }
  );

  const onSubmit = async (data: ComplaintForm) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        formData.append(key, value);
      }
    });

    if (selectedFiles) {
      Array.from(selectedFiles).forEach((file) => {
        formData.append('complaints', file);
      });
    }

    createMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <MessageSquare className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Aduan Warga</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Sampaikan keluhan atau saran Anda untuk kemajuan desa
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Buat Aduan</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari aduan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all appearance-none"
            >
              <option value="">Semua Status</option>
              <option value="submitted">Disubmit</option>
              <option value="in_progress">Diproses</option>
              <option value="resolved">Selesai</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
          complaintsData?.data?.complaints?.map((complaint: Complaint, index: number) => (
            <motion.div
              key={complaint.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {complaint.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{complaint.user_name}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(complaint.created_at), 'dd MMM yyyy', { locale: id })}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                      {getStatusIcon(complaint.status)}
                      <span>
                        {complaint.status === 'submitted' ? 'Disubmit' :
                         complaint.status === 'in_progress' ? 'Diproses' :
                         complaint.status === 'resolved' ? 'Selesai' : 'Ditolak'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {complaint.description}
                </p>

                {/* Location */}
                {complaint.location && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    📍 {complaint.location}
                  </p>
                )}

                {/* Attachments */}
                {complaint.attachments && JSON.parse(complaint.attachments).length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lampiran:</p>
                    <div className="flex space-x-2">
                      {JSON.parse(complaint.attachments).map((file: Attachment, i: number) => (
                        <span key={i} className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          <FileText className="w-3 h-3" />
                          <span>{file.originalName}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Response */}
                {complaint.response && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tanggapan:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {complaint.response}
                    </p>
                  </div>
                )}

                {/* Rating (for resolved complaints) */}
                {complaint.status === 'resolved' && !complaint.rating && complaint.user_id === user?.id && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Berikan Rating:</p>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => rateMutation.mutate({ id: complaint.id, rating })}
                          className="text-gray-400 hover:text-yellow-500 transition-colors"
                        >
                          <Star className="w-5 h-5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Display rating */}
                {complaint.rating && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rating:</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= complaint.rating 
                                ? 'text-yellow-500 fill-current' 
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {complaint.feedback && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {complaint.feedback}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Complaint Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Buat Aduan Baru
                </h3>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Judul Aduan
                  </label>
                  <input
                    {...register('title')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all"
                    placeholder="Masukkan judul aduan"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kategori
                  </label>
                  <select
                    {...register('category')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  >
                    <option value="">Pilih kategori</option>
                    <option value="infrastruktur">Infrastruktur</option>
                    <option value="pelayanan">Pelayanan</option>
                    <option value="kebersihan">Kebersihan</option>
                    <option value="keamanan">Keamanan</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all resize-none"
                    placeholder="Jelaskan detail aduan Anda"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lokasi (Opsional)
                  </label>
                  <input
                    {...register('location')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all"
                    placeholder="Contoh: RT 01/RW 05, Jl. Mawar No. 10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prioritas
                  </label>
                  <select
                    {...register('priority')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  >
                    <option value="low">Rendah</option>
                    <option value="normal">Normal</option>
                    <option value="high">Tinggi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lampiran (Opsional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setSelectedFiles(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Klik untuk upload foto (maksimal 3 file, 10MB per file)
                      </p>
                    </label>
                    {selectedFiles && (
                      <div className="mt-2">
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {selectedFiles.length} file dipilih
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {createMutation.isLoading ? 'Mengirim...' : 'Submit Aduan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Complaints;