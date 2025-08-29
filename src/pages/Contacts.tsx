import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle,
  User,
  Building
} from 'lucide-react';
import { motion } from 'framer-motion';
import { contactsAPI } from '../services/api';

const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const { data: contactsData, isLoading } = useQuery(
    ['contacts', searchTerm, selectedDepartment],
    () => contactsAPI.getAll({
      search: searchTerm || undefined,
      department: selectedDepartment || undefined,
    })
  );

  const departments = [
    { value: '', label: 'Semua Bidang' },
    { value: 'pemerintahan', label: 'Pemerintahan' },
    { value: 'pelayanan', label: 'Pelayanan' },
    { value: 'pembangunan', label: 'Pembangunan' },
    { value: 'kemasyarakatan', label: 'Kemasyarakatan' },
    { value: 'kesejahteraan', label: 'Kesejahteraan' },
  ];

  const handleWhatsAppClick = (phone: string, name: string) => {
    const message = encodeURIComponent(`Halo ${name}, saya ingin bertanya mengenai layanan desa.`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleEmailClick = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
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
          Direktori Kontak
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          Temukan kontak pejabat dan instansi terkait di desa
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
              placeholder="Cari nama atau jabatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all appearance-none"
            >
              {departments.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Contacts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {contactsData?.data?.contacts?.map((contact: any, index: number) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    {contact.photo ? (
                      <img
                        src={contact.photo}
                        alt={contact.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {contact.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {contact.position}
                    </p>
                  </div>
                </div>

                {/* Department */}
                <div className="flex items-center space-x-2 mb-4">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {departments.find(dept => dept.value === contact.department)?.label || contact.department}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  {contact.phone && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {contact.phone}
                        </span>
                      </div>
                      <button
                        onClick={() => window.open(`tel:${contact.phone}`)}
                        className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {contact.email && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {contact.email}
                        </span>
                      </div>
                      <button
                        onClick={() => handleEmailClick(contact.email)}
                        className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {contact.whatsapp && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          WhatsApp
                        </span>
                      </div>
                      <button
                        onClick={() => handleWhatsAppClick(contact.whatsapp, contact.name)}
                        className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 rounded transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {contact.office_hours && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {contact.office_hours}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && (!contactsData?.data?.contacts || contactsData.data.contacts.length === 0) && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Tidak Ada Kontak
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Belum ada kontak yang tersedia untuk pencarian ini
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Contacts;