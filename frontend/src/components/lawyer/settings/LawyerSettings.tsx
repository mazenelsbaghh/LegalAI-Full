import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Brain, Camera } from 'lucide-react';

export default function LawyerSettings() {
  const [profileData, setProfileData] = useState({
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    phone: '+20 123 456 789',
    address: 'القاهرة، مصر'
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });

  const [aiPreferences, setAiPreferences] = useState({
    suggestionsEnabled: true,
    autoComplete: true,
    documentAnalysis: true,
    legalResearch: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    caseUpdates: true,
    appointmentReminders: true,
    paymentAlerts: true
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">الإعدادات</h1>
      </div>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-lg rounded-2xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <User className="w-5 h-5 ml-2" />
          الملف الشخصي
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              الاسم
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              رقم الهاتف
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              العنوان
            </label>
            <input
              type="text"
              value={profileData.address}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            الصورة الشخصية
          </label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
              تغيير الصورة
            </button>
          </div>
        </div>
      </motion.div>

      {/* Security Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-lg rounded-2xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <Lock className="w-5 h-5 ml-2" />
          الأمان
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              كلمة المرور الحالية
            </label>
            <input
              type="password"
              value={securityData.currentPassword}
              onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                كلمة المرور الجديدة
              </label>
              <input
                type="password"
                value={securityData.newPassword}
                onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                تأكيد كلمة المرور الجديدة
              </label>
              <input
                type="password"
                value={securityData.confirmPassword}
                onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <h3 className="font-bold text-white">المصادقة الثنائية</h3>
              <p className="text-sm text-gray-400">تفعيل المصادقة الثنائية لحماية حسابك</p>
            </div>
            <button
              onClick={() => setSecurityData({ ...securityData, twoFactorEnabled: !securityData.twoFactorEnabled })}
              className={`w-12 h-6 rounded-full transition-colors ${
                securityData.twoFactorEnabled ? 'bg-indigo-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                securityData.twoFactorEnabled ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* AI Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 backdrop-blur-lg rounded-2xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <Brain className="w-5 h-5 ml-2" />
          إعدادات الذكاء الاصطناعي
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <h3 className="font-bold text-white">اقتراحات قانونية</h3>
              <p className="text-sm text-gray-400">تمكين الاقتراحات القانونية الذكية</p>
            </div>
            <button
              onClick={() => setAiPreferences({ ...aiPreferences, suggestionsEnabled: !aiPreferences.suggestionsEnabled })}
              className={`w-12 h-6 rounded-full transition-colors ${
                aiPreferences.suggestionsEnabled ? 'bg-indigo-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                aiPreferences.suggestionsEnabled ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <h3 className="font-bold text-white">إكمال تلقائي</h3>
              <p className="text-sm text-gray-400">إكمال النصوص القانونية تلقائياً</p>
            </div>
            <button
              onClick={() => setAiPreferences({ ...aiPreferences, autoComplete: !aiPreferences.autoComplete })}
              className={`w-12 h-6 rounded-full transition-colors ${
                aiPreferences.autoComplete ? 'bg-indigo-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                aiPreferences.autoComplete ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <h3 className="font-bold text-white">تحليل المستندات</h3>
              <p className="text-sm text-gray-400">تحليل ذكي للمستندات القانونية</p>
            </div>
            <button
              onClick={() => setAiPreferences({ ...aiPreferences, documentAnalysis: !aiPreferences.documentAnalysis })}
              className={`w-12 h-6 rounded-full transition-colors ${
                aiPreferences.documentAnalysis ? 'bg-indigo-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                aiPreferences.documentAnalysis ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <h3 className="font-bold text-white">البحث القانوني</h3>
              <p className="text-sm text-gray-400">بحث ذكي في المراجع القانونية</p>
            </div>
            <button
              onClick={() => setAiPreferences({ ...aiPreferences, legalResearch: !aiPreferences.legalResearch })}
              className={`w-12 h-6 rounded-full transition-colors ${
                aiPreferences.legalResearch ? 'bg-indigo-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                aiPreferences.legalResearch ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 backdrop-blur-lg rounded-2xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <Bell className="w-5 h-5 ml-2" />
          إعدادات الإشعارات
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <h3 className="font-bold text-white">إشعارات البريد الإلكتروني</h3>
              <p className="text-sm text-gray-400">استلام الإشعارات عبر البريد الإلكتروني</p>
            </div>
            <button
              onClick={() => setNotificationSettings({ ...notificationSettings, emailNotifications: !notificationSettings.emailNotifications })}
              className={`w-12 h-6 rounded-full transition-colors ${
                notificationSettings.emailNotifications ? 'bg-indigo-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                notificationSettings.emailNotifications ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <h3 className="font-bold text-white">تحديثات القضايا</h3>
              <p className="text-sm text-gray-400">إشعارات بتحديثات القضايا</p>
            </div>
            <button
              onClick={() => setNotificationSettings({ ...notificationSettings, caseUpdates: !notificationSettings.caseUpdates })}
              className={`w-12 h-6 rounded-full transition-colors ${
                notificationSettings.caseUpdates ? 'bg-indigo-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                notificationSettings.caseUpdates ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <h3 className="font-bold text-white">تذكير بالمواعيد</h3>
              <p className="text-sm text-gray-400">تذكير بالمواعيد والجلسات</p>
            </div>
            <button
              onClick={() => setNotificationSettings({ ...notificationSettings, appointmentReminders: !notificationSettings.appointmentReminders })}
              className={`w-12 h-6 rounded-full transition-colors ${
                notificationSettings.appointmentReminders ? 'bg-indigo-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                notificationSettings.appointmentReminders ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <h3 className="font-bold text-white">تنبيهات المدفوعات</h3>
              <p className="text-sm text-gray-400">إشعارات بحالة المدفوعات والفواتير</p>
            </div>
            <button
              onClick={() => setNotificationSettings({ ...notificationSettings, paymentAlerts: !notificationSettings.paymentAlerts })}
              className={`w-12 h-6 rounded-full transition-colors ${
                notificationSettings.paymentAlerts ? 'bg-indigo-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                notificationSettings.paymentAlerts ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-bold"
        >
          حفظ التغييرات
        </motion.button>
      </div>
    </div>
  );
}