import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Download,
  Edit,
  Trash,
  CreditCard,
  Check,
  Clock
} from 'lucide-react';
import NewInvoiceModal from './NewInvoiceModal';

// Placeholder data - will be replaced with Supabase data
const invoices = [
  {
    id: '1',
    number: 'INV-2024-001',
    client: 'أحمد محمد',
    amount: 5000,
    date: '2024-02-20',
    dueDate: '2024-03-20',
    status: 'unpaid',
    services: [
      { description: 'استشارة قانونية', amount: 2000 },
      { description: 'إعداد مذكرة دفاع', amount: 3000 }
    ]
  },
  {
    id: '2',
    number: 'INV-2024-002',
    client: 'شركة الأمل التجارية',
    amount: 8000,
    date: '2024-02-15',
    dueDate: '2024-03-15',
    status: 'paid',
    services: [
      { description: 'صياغة عقد', amount: 3000 },
      { description: 'مراجعة مستندات', amount: 2000 },
      { description: 'تمثيل قانوني', amount: 3000 }
    ]
  },
  {
    id: '3',
    number: 'INV-2024-003',
    client: 'محمد أحمد',
    amount: 3000,
    date: '2024-01-20',
    dueDate: '2024-02-20',
    status: 'overdue',
    services: [
      { description: 'استشارة قانونية', amount: 1500 },
      { description: 'إعداد مستندات', amount: 1500 }
    ]
  }
];

export default function InvoiceManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);

  const filteredInvoices = invoices.filter(invoice =>
    invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/10 text-green-400';
      case 'unpaid':
        return 'bg-yellow-500/10 text-yellow-400';
      case 'overdue':
        return 'bg-red-500/10 text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'مدفوعة';
      case 'unpaid':
        return 'غير مدفوعة';
      case 'overdue':
        return 'متأخرة';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">الفواتير والمدفوعات</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsNewInvoiceModalOpen(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-bold"
        >
          <Plus className="w-5 h-5 ml-2" />
          فاتورة جديدة
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="البحث في الفواتير..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-4 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-lg rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 mb-1">إجمالي المدفوعات</p>
              <h3 className="text-2xl font-bold text-white">8,000 ج.م</h3>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-lg rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 mb-1">المستحقات</p>
              <h3 className="text-2xl font-bold text-white">5,000 ج.م</h3>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-lg rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 mb-1">متأخرات</p>
              <h3 className="text-2xl font-bold text-white">3,000 ج.م</h3>
            </div>
            <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Invoices List */}
      <div className="bg-white/5 backdrop-blur-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">رقم الفاتورة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">العميل</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">المبلغ</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">تاريخ الإصدار</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">تاريخ الاستحقاق</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">الحالة</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 text-indigo-400 ml-2" />
                      <span className="text-white">{invoice.number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">{invoice.client}</td>
                  <td className="px-6 py-4 text-white">{invoice.amount} ج.م</td>
                  <td className="px-6 py-4 text-white">{invoice.date}</td>
                  <td className="px-6 py-4 text-white">{invoice.dueDate}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(invoice.status)}`}>
                      {getStatusText(invoice.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <Download className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <Trash className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Invoice Modal */}
      {isNewInvoiceModalOpen && (
        <NewInvoiceModal onClose={() => setIsNewInvoiceModalOpen(false)} />
      )}
    </div>
  );
}