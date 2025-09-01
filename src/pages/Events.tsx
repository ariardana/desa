import React, { useState } from 'react';
import { useQuery } from 'react-query';
import Calendar from 'react-calendar';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Users,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { eventsAPI } from '../services/api';

interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  organizer?: string;
  max_participants?: number;
  current_participants?: number;
  category: string;
  created_at: string;
}


const Events = () => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: eventsData, isLoading } = useQuery(
    ['events', selectedCategory, selectedDate],
    () => eventsAPI.getAll({
      category: selectedCategory || undefined,
      month: selectedDate.getMonth() + 1,
      year: selectedDate.getFullYear(),
    })
  );

  const categories = [
    { value: '', label: 'Semua Kategori' },
    { value: 'rapat', label: 'Rapat' },
    { value: 'acara', label: 'Acara' },
    { value: 'pelatihan', label: 'Pelatihan' },
    { value: 'gotong_royong', label: 'Gotong Royong' },
  ];

  const getEventColor = (category: string) => {
    switch (category) {
      case 'rapat': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'acara': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pelatihan': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'gotong_royong': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const isEventOnDate = (event: Event, date: Date) => {
    const eventDate = new Date(event.start_date);
    return eventDate.toDateString() === date.toDateString();
  };

  const getEventsForDate = (date: Date) => {
    return eventsData?.data?.events?.filter((event: Event) => isEventOnDate(event, date)) || [];
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
          Agenda Kegiatan Desa
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          Lihat jadwal kegiatan dan acara yang akan berlangsung di desa
        </motion.p>
      </div>

      {/* Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
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

          {/* View Mode Toggle */}
          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-3 py-1 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center space-x-2 px-3 py-1 rounded-md transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Kalender</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      {viewMode === 'calendar' ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Calendar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <Calendar
                onChange={(date) => setSelectedDate(date as Date)}
                value={selectedDate}
                locale="id-ID"
                className="w-full"
                tileClassName={({ date }) => {
                  const events = getEventsForDate(date);
                  return events.length > 0 ? 'has-events' : '';
                }}
              />
            </div>
          </div>

          {/* Selected Date Events */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Kegiatan pada {format(selectedDate, 'dd MMMM yyyy', { locale: id })}
              </h3>

              <div className="space-y-4">
                {getEventsForDate(selectedDate).length > 0 ? (
                  getEventsForDate(selectedDate).map((event: Event) => (
                    <div key={event.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{event.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getEventColor(event.category)}`}>
                          {event.category}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{event.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{format(new Date(event.start_date), 'HH:mm')}</span>
                        </span>
                        {event.location && (
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Tidak ada kegiatan pada tanggal ini
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            eventsData?.data?.events?.map((event: Event, index: number) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  {/* Category and Date */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventColor(event.category)}`}>
                      {event.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                      <CalendarIcon className="w-3 h-3" />
                      <span>
                        {format(new Date(event.start_date), 'dd MMM yyyy', { locale: id })}
                      </span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {event.title}
                  </h3>

                  {/* Description */}
                  {event.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                      {event.description}
                    </p>
                  )}

                  {/* Event Details */}
                  <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {format(new Date(event.start_date), 'HH:mm', { locale: id })}
                        {event.end_date && ` - ${format(new Date(event.end_date), 'HH:mm', { locale: id })}`}
                      </span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}

                    {event.organizer && (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{event.organizer}</span>
                      </div>
                    )}

                    {event.max_participants && (
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {event.current_participants || 0} / {event.max_participants} peserta
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Status Footer */}
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Dibuat: {format(new Date(event.created_at), 'dd/MM/yyyy', { locale: id })}
                    </span>
                    
                    {new Date(event.start_date) > new Date() ? (
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        Akan Datang
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Selesai
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && (!eventsData?.data?.events || eventsData.data.events.length === 0) && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Belum Ada Kegiatan
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Tidak ada kegiatan yang dijadwalkan untuk periode ini
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Events;