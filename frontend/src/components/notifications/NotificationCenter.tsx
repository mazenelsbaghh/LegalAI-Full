import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Calendar, FileText, AlertCircle, CreditCard } from 'lucide-react';
import { notificationManager } from '../../lib/notifications';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load notifications
    const loadedNotifications = notificationManager.getNotifications();
    setNotifications(loadedNotifications);
    setUnreadCount(loadedNotifications.length);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Calendar className="w-5 h-5 text-indigo-400" />;
      case 'document': return <FileText className="w-5 h-5 text-green-400" />;
      case 'case': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'payment': return <CreditCard className="w-5 h-5 text-red-400" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const clearNotifications = () => {
    notificationManager.clearNotifications();
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <Bell className="w-6 h-6 text-gold-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-0 mt-2 w-96 bg-dark-800/95 backdrop-blur-lg rounded-xl shadow-lg border border-gold-500/20 overflow-hidden"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">الإشعارات</h3>
              <button
                onClick={clearNotifications}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  لا توجد إشعارات
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <h4 className="font-bold text-white">{notification.title}</h4>
                        <p className="text-sm text-gray-400">{notification.message}</p>
                        <span className="text-xs text-gray-500 mt-1 block">
                          {new Date(notification.timestamp).toLocaleString('ar-EG')}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}