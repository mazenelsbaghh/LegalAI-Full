import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileText, 
  Phone,
  Mail,
  MapPin,
  Upload,
  Download,
  Edit
} from 'lucide-react';

interface ClientDetailsProps {
  clientData: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    type: 'individual' | 'company';
    cases: Array<{
      id: string;
      title: string;
      number: string;
      status: string;
    }> | [];
    documents: Array<{
      id: string;
      name: string;
      type: string;
      date: string;
    }> | [];
  };
  onClose: () => void;
}

export default function ClientDetails({ clientData, onClose }: ClientDetailsProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed top-0 right-0 w-96 h-full bg-gray-900/95 backdrop-blur-lg shadow-xl overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-lg p-6 border-b border-white/10">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-white">{clientData.name}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Contact Info */}
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-400">معلومات الاتصال</h3>
                <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                  <Edit className="w-4 h-4 text-indigo-400" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-indigo-400 ml-2" />
                  <span className="text-white">{clientData.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-indigo-400 ml-2" />
                  <span className="text-white">{clientData.email}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-indigo-400 ml-2" />
                  <span className="text-white">{clientData.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cases */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gold-500">القضايا</h3>
            <div className="space-y-2">
              {(clientData.cases || []).map((caseItem: any) => (
                <div
                  key={caseItem.id}
                  className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg hover:bg-dark-600/50 transition-colors"
                >
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-indigo-400 ml-2" />
                    <div>
                      <span className="text-white block">{caseItem.title}</span>
                      <span className="text-sm text-gray-400">{caseItem.number}</span>
                    </div>
                  </div>
                  <span className={`text-sm ${
                    caseItem.status === 'open' ? 'text-green-400' :
                    caseItem.status === 'in_progress' ? 'text-yellow-400' :
                    'text-gray-400'
                  }`}>
                    {caseItem.status === 'open' ? 'مفتوحة' :
                     caseItem.status === 'in_progress' ? 'قيد النظر' :
                     'مغلقة'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">المستندات</h3>
              <button className="flex items-center text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                <Upload className="w-4 h-4 ml-1" />
                رفع مستند
              </button>
            </div>
            <div className="space-y-2">
              {(clientData.documents || []).map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg hover:bg-dark-600/50 transition-colors"
                >
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-indigo-400 ml-2" />
                    <div>
                      <span className="text-white block">{doc.name}</span>
                      <span className="text-sm text-gray-400">{doc.date}</span>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                    <Download className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}