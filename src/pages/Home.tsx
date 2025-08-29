import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Megaphone, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Camera, 
  Users,
  ArrowRight,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const features = [
    {
      icon: Megaphone,
      title: 'Pengumuman Desa',
      description: 'Dapatkan informasi terkini tentang kegiatan dan pengumuman penting dari pemerintah desa',
      href: '/announcements',
      color: 'bg-blue-500',
    },
    {
      icon: Calendar,
      title: 'Agenda Kegiatan',
      description: 'Lihat jadwal kegiatan dan acara yang akan berlangsung di desa',
      href: '/events',
      color: 'bg-green-500',
    },
    {
      icon: MessageSquare,
      title: 'Aduan Warga',
      description: 'Sampaikan keluhan atau saran Anda untuk kemajuan desa',
      href: '/complaints',
      color: 'bg-orange-500',
    },
    {
      icon: FileText,
      title: 'Dokumen Publik',
      description: 'Akses dokumen-dokumen penting dan SOP pelayanan desa',
      href: '/documents',
      color: 'bg-purple-500',
    },
    {
      icon: Camera,
      title: 'Galeri Desa',
      description: 'Lihat dokumentasi foto dan video kegiatan desa',
      href: '/gallery',
      color: 'bg-pink-500',
    },
    {
      icon: Users,
      title: 'Direktori Kontak',
      description: 'Temukan kontak pejabat dan instansi terkait di desa',
      href: '/contacts',
      color: 'bg-teal-500',
    },
  ];

  const stats = [
    { label: 'Total Warga', value: '2,847', icon: Users },
    { label: 'Pengumuman Aktif', value: '12', icon: Megaphone },
    { label: 'Aduan Terselesaikan', value: '94%', icon: MessageSquare },
    { label: 'Dokumen Tersedia', value: '156', icon: FileText },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative px-8 py-16 text-center text-white">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Selamat Datang di
            <br />
            <span className="text-yellow-300">Desa Maju Bersama</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl mb-8 max-w-3xl mx-auto"
          >
            Portal digital untuk memudahkan akses informasi dan layanan desa. 
            Bersama membangun desa yang transparan, efisien, dan responsif.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/announcements"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Lihat Pengumuman</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/complaints"
              className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Sampaikan Aduan
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Layanan Digital Desa
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Akses berbagai layanan dan informasi desa dengan mudah melalui platform digital kami
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={feature.href}
                  className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                    <span>Selengkapnya</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Contact Information */}
      <section className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Kontak Kantor Desa
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Hubungi kami untuk informasi lebih lanjut
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Alamat</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Jl. Raya Desa No. 123<br />
                Kec. Contoh, Kab. Contoh
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/50 rounded-lg">
              <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Telepon</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                (021) 1234-5678<br />
                (021) 8765-4321
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-50 dark:bg-orange-900/50 rounded-lg">
              <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Email</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                info@desamajubersama.id<br />
                admin@desamajubersama.id
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;