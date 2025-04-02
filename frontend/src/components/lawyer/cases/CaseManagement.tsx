import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  FileText,
  Filter,
  Calendar,
  Building2,
  User,
  Brain,
  MoreVertical,
  SortDesc,
  Download,
  Edit,
  Trash
} from 'lucide-react';
import { useCaseStore } from '../../../store/caseStore';
import NewCaseModal from './NewCaseModal';
import CaseDetails from './CaseDetails';

type FilterType = 'all' | 'open' | 'in_progress' | 'closed';
type SortType = 'newest' | 'oldest' | 'updated';

export default function CaseManagement() {
  const { cases, loading, error, fetchCases } = useCaseStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('newest');
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  
  const [lawyersMap, setLawyersMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = localStorage.getItem('lawyers');
    if (stored) {
      const lawyerList = JSON.parse(stored);
      const map = lawyerList.reduce((acc: any, curr: any) => {
        acc[curr.id] = curr.name;
        return acc;
      }, {});
      setLawyersMap(map);
    }
  }, []);

  const [selectedCase, setSelectedCase] = useState<typeof cases[0] | null>(null);
  const [caseTypeFilter, setCaseTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const caseTypes = Array.from(new Set(cases.map(c => c.type)));

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = 
      caseItem.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.court.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterType === 'all' ? true : caseItem.status === filterType;
    const matchesType = caseTypeFilter === 'all' ? true : caseItem.type === caseTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  }).sort((a, b) => {
    switch (sortType) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'updated':
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      default:
        return 0;
    }
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'open':
        return 'status-badge-success';
      case 'in_progress':
        return 'status-badge-warning';
      case 'closed':
        return 'status-badge-error';
      default:
        return 'status-badge-info';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="dashboard-title">إدارة القضايا</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsNewCaseModalOpen(true)}
          className="dashboard-button-primary"
        >
          <Plus className="w-5 h-5 ml-2" />
          قضية جديدة
        </motion.button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gold-400" />
          <input
            type="text"
            placeholder="البحث في القضايا..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dashboard-input pr-10"
          />
        </div>

        <select
          value={caseTypeFilter}
          onChange={(e) => setCaseTypeFilter(e.target.value)}
          className="dashboard-select"
        >
          <option value="all">جميع الأنواع</option>
          {caseTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value as SortType)}
          className="dashboard-select"
        >
          <option value="newest">الأحدث</option>
          <option value="oldest">الأقدم</option>
          <option value="updated">آخر تحديث</option>
        </select>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2">
        {(['all', 'open', 'in_progress', 'closed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterType(status)}
            className={`dashboard-button ${
              filterType === status
                ? 'dashboard-button-primary'
                : 'dashboard-button-secondary'
            }`}
          >
            {status === 'all' ? 'الكل' :
             status === 'open' ? 'مفتوحة' :
             status === 'in_progress' ? 'قيد النظر' :
             'مغلقة'}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Cases List */}
      <div className="dashboard-section">
        <div className="overflow-x-auto">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>رقم القضية</th>
                <th>العنوان</th>
                <th>المحكمة</th>
                <th>النوع</th>
                <th>العميل</th>
                <th>آخر تحديث</th>
                <th>الحالة</th>
                <th className="text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center text-gray-400">
                    جاري التحميل...
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-gray-400">
                    لا توجد نتائج للبحث
                  </td>
                </tr>
              ) : (
                filteredCases.map((caseItem) => (
                  <tr 
                    key={caseItem.id}
                    onClick={() => setSelectedCase(caseItem)}
                    className="cursor-pointer"
                  >
                    <td>
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-gold-400 ml-2" />
                        <span>{caseItem.number}</span>
                      </div>
                    </td>
                    <td>{caseItem.title}</td>
                    <td>{caseItem.court}</td>
                    <td>{caseItem.type}</td>
                    <td>
                      {caseItem.client?.name || 'غير محدد'}
                    </td>
                    <td>
                      {new Date(caseItem.updated_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(caseItem.status)}>
                        {getStatusText(caseItem.status)}
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle download
                          }}
                          className="p-1 hover:bg-dark-600/50 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4 text-gold-400" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCase(caseItem);
                          }}
                          className="p-1 hover:bg-dark-600/50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gold-400" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle delete
                          }}
                          className="p-1 hover:bg-dark-600/50 rounded-lg transition-colors"
                        >
                          <Trash className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCase && (
        <CaseDetails
          caseData={selectedCase}
          onClose={() => setSelectedCase(null)}
        />
      )}

      {isNewCaseModalOpen && (
        <NewCaseModal
          onClose={() => setIsNewCaseModalOpen(false)}
        />
      )}
    </div>
  );
}