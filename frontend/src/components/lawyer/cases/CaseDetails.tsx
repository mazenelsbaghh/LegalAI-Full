import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileText, 
  Calendar, 
  Upload,
  Download,
  Clock,
  Building2,
  User,
  Brain,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash,
  MessageSquare
} from 'lucide-react';
import { useCaseStore } from '../../../store/caseStore';

interface CaseDetailsProps {
  caseData: {
    id: string;
    title: string;
    number: string;
    court: string;
    type: string;
    status: string;
    client?: {
      id: string;
      name: string;
    };
    documents?: Array<{
      id: string;
      name: string;
      type: string;
      date: string;
    }>;
    timeline?: Array<{
      id: string;
      date: string;
      event: string;
      type: string;
    }>;
  };
  onClose: () => void;
}

export default function CaseDetails({ caseData, onClose }: CaseDetailsProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'timeline' | 'analysis'>('details');
  const { updateCase } = useCaseStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500/10 text-green-400';
      case 'in_progress':
        return 'bg-yellow-500/10 text-yellow-400';
      case 'closed':
        return 'bg-gray-500/10 text-gray-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'مفتوحة';
      case 'in_progress':
        return 'قيد النظر';
      case 'closed':
        return 'مغلقة';
      default:
        return status;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateCase(caseData.id, { status: newStatus });
    } catch (error) {
      console.error('Error updating case status:', error);
    }
  };

  const mockAIAnalysis = {
    riskLevel: 'متوسط',
    successProbability: '65%',
    recommendations: [
      'تقديم مذكرة دفاع تفصيلية',
      'جمع مزيد من الأدلة الداعمة',
      'طلب شهادة خبير في المجال'
    ],
    keyPoints: [
      'نقاط قوة في الدفاع',
      'ثغرات قانونية محتملة',
      'سوابق قضائية مشابهة'
    ],
    similarCases: [
      { number: 'C-2023-123', result: 'ربح', similarity: '85%' },
      { number: 'C-2023-456', result: 'تسوية', similarity: '75%' }
    ]
  };

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
            <div>
              <h2 className="text-xl font-bold text-white">{caseData.title}</h2>
              <div className="flex items-center text-sm text-gray-400 mt-1">
                <FileText className="w-4 h-4 ml-2" />
                {caseData.number}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between mt-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
              getStatusColor(caseData.status)
            }`}>
              {getStatusText(caseData.status)}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusChange('open')}
                className={`p-1 rounded-lg transition-colors ${
                  caseData.status === 'open' ? 'bg-green-500/20' : 'hover:bg-white/10'
                }`}
              >
                <CheckCircle className="w-4 h-4 text-green-400" />
              </button>
              <button
                onClick={() => handleStatusChange('in_progress')}
                className={`p-1 rounded-lg transition-colors ${
                  caseData.status === 'in_progress' ? 'bg-yellow-500/20' : 'hover:bg-white/10'
                }`}
              >
                <Clock className="w-4 h-4 text-yellow-400" />
              </button>
              <button
                onClick={() => handleStatusChange('closed')}
                className={`p-1 rounded-lg transition-colors ${
                  caseData.status === 'closed' ? 'bg-gray-500/20' : 'hover:bg-white/10'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'details'
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            التفاصيل
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'documents'
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            المستندات
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'timeline'
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            التسلسل الزمني
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'analysis'
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            التحليل
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">معلومات القضية</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">المحكمة:</span>
                    <span className="text-white">{caseData.court}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">النوع:</span>
                    <span className="text-white">{caseData.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">العميل:</span>
                    <span className="text-white">{caseData.client?.name || 'غير محدد'}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                  <Edit className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-2 bg-red-500/5 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">المستندات</h3>
                <button className="flex items-center text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                  <Upload className="w-4 h-4 ml-1" />
                  رفع مستند
                </button>
              </div>
              <div className="space-y-2">
                {caseData.documents?.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
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
                {(!caseData.documents || caseData.documents.length === 0) && (
                  <div className="text-center text-gray-400 py-4">
                    لا توجد مستندات
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">التسلسل الزمني</h3>
              <div className="space-y-4">
                {caseData.timeline?.map((event) => (
                  <div
                    key={event.id}
                    className="relative flex items-start gap-4 pb-4"
                  >
                    <div className="absolute top-2 right-2 w-px h-full bg-white/10" />
                    <div className="relative z-10 mt-1">
                      <div className="w-4 h-4 rounded-full bg-indigo-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center text-sm text-gray-400 mb-1">
                        <Clock className="w-4 h-4 ml-1" />
                        {event.date}
                      </div>
                      <p className="text-white">{event.event}</p>
                    </div>
                  </div>
                ))}
                {(!caseData.timeline || caseData.timeline.length === 0) && (
                  <div className="text-center text-gray-400 py-4">
                    لا توجد أحداث
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* Risk Analysis */}
              <div className="bg-white/5 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">تحليل المخاطر</h3>
                  <Brain className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">مستوى المخاطر</p>
                    <p className="text-yellow-400 font-bold">{mockAIAnalysis.riskLevel}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">احتمالية النجاح</p>
                    <p className="text-green-400 font-bold">{mockAIAnalysis.successProbability}</p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">التوصيات</h3>
                <ul className="space-y-2">
                  {mockAIAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-indigo-400 mt-1" />
                      <span className="text-gray-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Points */}
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">النقاط الرئيسية</h3>
                <ul className="space-y-2">
                  {mockAIAnalysis.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 mt-1" />
                      <span className="text-gray-300">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Similar Cases */}
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">قضايا مشابهة</h3>
                <div className="space-y-3">
                  {mockAIAnalysis.similarCases.map((case_, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                      <div>
                        <p className="text-white">{case_.number}</p>
                        <p className="text-sm text-gray-400">{case_.result}</p>
                      </div>
                      <span className="text-indigo-400">{case_.similarity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Chat */}
              <div className="mt-4">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  استشارة المساعد الذكي
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}