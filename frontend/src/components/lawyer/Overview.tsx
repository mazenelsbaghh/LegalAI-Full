import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Users, 
  Calendar, 
  MessageSquare,
  ArrowUp,
  ArrowDown,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCaseStore } from '../../store/caseStore';

const quickActions = [
  {
    title: 'إضافة قضية جديدة',
    icon: FileText,
    path: '/lawyer/cases',
    color: 'from-blue-600 to-blue-400'
  },
  {
    title: 'المساعد الذكي',
    icon: MessageSquare,
    path: '/lawyer/chat',
    color: 'from-purple-600 to-purple-400'
  },
  {
    title: 'إضافة موعد',
    icon: Calendar,
    path: '/lawyer/calendar',
    color: 'from-green-600 to-green-400'
  },
  {
    title: 'إضافة عميل',
    icon: Users,
    path: '/lawyer/clients',
    color: 'from-orange-600 to-orange-400'
  }
];

export default function Overview() {
  const { cases, loading, error, fetchCases } = useCaseStore();

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const metrics = {
    cases: {
      total: cases.length,
      open: cases.filter(c => c.status === 'open').length,
      closed: cases.filter(c => c.status === 'closed').length,
      pending: cases.filter(c => c.status === 'in_progress').length,
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
      >
        <h1 className="text-3xl font-bold text-white mb-2">مرحباً بك في لوحة التحكم</h1>
        <p className="text-gray-300">هذه نظرة عامة على نشاطك القانوني اليوم</p>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cases Metric */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 mb-1">إجمالي القضايا</p>
              <h3 className="text-3xl font-bold text-white">{metrics.cases.total}</h3>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center p-2 bg-white/5 rounded-lg">
              <p className="text-gray-400">مفتوحة</p>
              <p className="text-white font-bold">{metrics.cases.open}</p>
            </div>
            <div className="text-center p-2 bg-white/5 rounded-lg">
              <p className="text-gray-400">مغلقة</p>
              <p className="text-white font-bold">{metrics.cases.closed}</p>
            </div>
            <div className="text-center p-2 bg-white/5 rounded-lg">
              <p className="text-gray-400">معلقة</p>
              <p className="text-white font-bold">{metrics.cases.pending}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <Link to={action.path}>
              <div className={`bg-gradient-to-r ${action.color} p-6 rounded-2xl hover:shadow-lg transition-all`}>
                <action.icon className="w-8 h-8 text-white mb-4" />
                <h3 className="text-lg font-bold text-white">{action.title}</h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Cases */}
      {cases.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">آخر القضايا</h2>
          <div className="space-y-4">
            {cases.slice(0, 5).map((caseItem) => (
              <Link
                key={caseItem.id}
                to="/lawyer/cases"
                className="flex items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
              >
                <FileText className="w-5 h-5 text-indigo-400 ml-4" />
                <div>
                  <h4 className="font-bold text-white">{caseItem.title}</h4>
                  <p className="text-sm text-gray-400">{caseItem.number} - {caseItem.court}</p>
                </div>
                <span className={`mr-auto inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  caseItem.status === 'open' ? 'bg-green-500/10 text-green-400' :
                  caseItem.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-400' :
                  'bg-gray-500/10 text-gray-400'
                }`}>
                  {caseItem.status === 'open' ? 'مفتوحة' :
                   caseItem.status === 'in_progress' ? 'قيد النظر' :
                   'مغلقة'}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}