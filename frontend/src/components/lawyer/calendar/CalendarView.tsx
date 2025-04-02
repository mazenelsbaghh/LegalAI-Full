import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { useAppointmentStore } from '../../../store/appointmentStore';
import { 
  ChevronRight, 
  ChevronLeft, 
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  FileText
} from 'lucide-react';
import NewAppointmentModal from './NewAppointmentModal';

const viewOptions = [
  { id: 'month', label: 'شهر' },
  { id: 'week', label: 'أسبوع' },
  { id: 'day', label: 'يوم' }
];

export default function CalendarView() {
  const { appointments, loading, error, fetchAppointments } = useAppointmentStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const dayAppointments = appointments.filter(appointment => 
    isSameDay(new Date(appointment.date), selectedDate)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gold-500">التقويم والمواعيد</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsNewAppointmentModalOpen(true)}
          className="flex items-center px-4 py-2 bg-gold-500 hover:bg-gold-600 rounded-lg text-dark-900 font-bold transition-colors"
        >
          <Plus className="w-5 h-5 ml-2" />
          موعد جديد
        </motion.button>
      </div>

      {/* Calendar Controls */}
      <div className="flex justify-between items-center bg-dark-700/50 backdrop-blur-lg rounded-lg p-4 border border-gold-500/20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-dark-600/50 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gold-400" />
          </button>
          <h2 className="text-xl font-bold text-gold-500">
            {format(currentDate, 'MMMM yyyy', { locale: arSA })}
          </h2>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-dark-600/50 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gold-400" />
          </button>
        </div>
        <div className="flex gap-2">
          {viewOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setView(option.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === option.id
                  ? 'bg-gold-500 text-dark-900'
                  : 'text-gold-400 hover:bg-dark-600/50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {/* Week days header */}
        {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day) => (
          <div key={day} className="text-center text-gold-400 font-medium py-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {daysInMonth.map((date, index) => {
          const dayAppointments = appointments.filter(appointment => 
            isSameDay(new Date(appointment.date), date)
          );
          const isSelected = isSameDay(date, selectedDate);
          const isCurrentMonth = isSameMonth(date, currentDate);

          return (
            <motion.div
              key={date.toISOString()}
              whileHover={{ scale: 1.02 }}
              className={`min-h-24 p-2 rounded-lg cursor-pointer transition-colors bg-dark-700/50 hover:bg-dark-600/50 border border-gold-500/20 ${
                isSelected ? 'bg-gold-500/20' : ''
              } ${!isCurrentMonth && 'opacity-40'}`}
              onClick={() => setSelectedDate(date)}
            >
              <div className="text-right mb-2">
                <span className={`text-sm ${isSelected ? 'text-gold-500' : 'text-gold-400'}`}>
                  {format(date, 'd')}
                </span>
              </div>
              <div className="space-y-1">
                {dayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`text-xs p-1 rounded ${
                      appointment.type === 'court' 
                        ? 'bg-red-500/20 text-red-400'
                        : appointment.type === 'meeting'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {format(new Date(appointment.date), 'HH:mm')} - {appointment.title}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Day Details */}
      <div className="bg-dark-700/50 backdrop-blur-lg rounded-lg p-6 border border-gold-500/20">
        <h3 className="text-xl font-bold text-gold-500 mb-4">
          مواعيد {format(selectedDate, 'dd MMMM yyyy', { locale: arSA })}
        </h3>
        <div className="space-y-4">
          {dayAppointments.map((appointment) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-600/50 rounded-lg p-4 hover:bg-dark-500/50 transition-colors border border-gold-500/20"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-gold-500">{appointment.title}</h4>
                  <div className="flex items-center text-gray-400 text-sm mt-1">
                    <Clock className="w-4 h-4 ml-1" />
                    {format(new Date(appointment.date), 'HH:mm')}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  appointment.type === 'court'
                    ? 'bg-red-500/20 text-red-400'
                    : appointment.type === 'meeting'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {appointment.type === 'court' ? 'جلسة محكمة' :
                   appointment.type === 'meeting' ? 'اجتماع' :
                   'موعد نهائي'}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-300">
                  <MapPin className="w-4 h-4 ml-2 text-gold-400" />
                  {appointment.location}
                </div>
                <div className="flex items-center text-gray-300">
                  <Users className="w-4 h-4 ml-2 text-gold-400" />
                  {appointment.client}
                </div>
                {appointment.notes && (
                  <div className="flex items-center text-gray-300">
                    <FileText className="w-4 h-4 ml-2 text-gold-400" />
                    {appointment.notes}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* New Appointment Modal */}
      {isNewAppointmentModalOpen && (
        <NewAppointmentModal
          selectedDate={selectedDate}
          onClose={() => setIsNewAppointmentModalOpen(false)}
        />
      )}
    </div>
  );
}