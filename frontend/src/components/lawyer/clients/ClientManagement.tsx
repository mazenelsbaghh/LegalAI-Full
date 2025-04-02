import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Users,
  Phone,
  Mail,
  FileText,
  MoreVertical
} from 'lucide-react';
import { useClientStore } from '../../../store/clientStore';
import NewClientModal from './NewClientModal';
import ClientDetails from './ClientDetails';

export default function ClientManagement() {
  const { clients, loading, error, fetchClients } = useClientStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<typeof clients[0] | null>(null);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gold-500">إدارة العملاء</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsNewClientModalOpen(true)}
          className="flex items-center px-4 py-2 bg-gold-500 hover:bg-gold-600 rounded-lg text-dark-900 font-bold transition-colors"
        >
          <Plus className="w-5 h-5 ml-2" />
          عميل جديد
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gold-400" />
        <input
          type="text"
          placeholder="البحث عن عميل..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-4 pr-10 py-2 bg-dark-700/50 border border-gold-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
        />
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg text-center border border-red-500/20">
          {error}
        </div>
      )}

      {/* Clients List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeletons
          [...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-dark-700/50 backdrop-blur-lg rounded-2xl p-6 animate-pulse border border-gold-500/20"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-dark-600/50 rounded-full"></div>
                <div className="mr-3 space-y-2">
                  <div className="h-4 w-32 bg-dark-600/50 rounded"></div>
                  <div className="h-3 w-24 bg-dark-600/50 rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-dark-600/50 rounded"></div>
                <div className="h-3 w-2/3 bg-dark-600/50 rounded"></div>
              </div>
            </div>
          ))
        ) : filteredClients.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="w-12 h-12 text-gold-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gold-500 mb-2">لا يوجد عملاء</h3>
            <p className="text-gold-400 mb-4">لم يتم العثور على أي عملاء مطابقين لبحثك</p>
            <button
              onClick={() => setIsNewClientModalOpen(true)}
              className="text-gold-400 hover:text-gold-300 transition-colors"
            >
              إضافة عميل جديد
            </button>
          </div>
        ) : (
          filteredClients.map((client) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-700/50 backdrop-blur-lg rounded-2xl p-6 hover:bg-dark-600/50 transition-all cursor-pointer border border-gold-500/20"
              onClick={() => setSelectedClient(client)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-dark-900" />
                  </div>
                  <div className="mr-3">
                    <h3 className="text-lg font-bold text-gold-500">{client.name}</h3>
                    <p className="text-sm text-gold-400">
                      {client.cases?.length || 0} قضايا
                    </p>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedClient(client);
                  }}
                  className="p-1 hover:bg-dark-600/50 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gold-400" />
                </button>
              </div>

              <div className="space-y-2">
                {client.phone && (
                  <div className="flex items-center text-gold-300">
                    <Phone className="w-4 h-4 ml-2 text-gold-400" />
                    {client.phone}
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center text-gold-300">
                    <Mail className="w-4 h-4 ml-2 text-gold-400" />
                    {client.email}
                  </div>
                )}
              </div>

              {client.cases && client.cases.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gold-500/20">
                  <h4 className="text-sm font-semibold text-gold-400 mb-2">القضايا النشطة</h4>
                  <div className="space-y-2">
                    {client.cases
                      .filter(c => c.status === 'open' || c.status === 'in_progress')
                      .slice(0, 2)
                      .map((caseItem) => (
                        <div
                          key={caseItem.id}
                          className="flex items-center text-sm"
                        >
                          <FileText className="w-4 h-4 ml-2 text-gold-400" />
                          <span className="text-gold-300">{caseItem.title}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Client Details Sidebar */}
      {selectedClient && (
        <ClientDetails
          clientData={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}

      {/* New Client Modal */}
      {isNewClientModalOpen && (
        <NewClientModal
          onClose={() => setIsNewClientModalOpen(false)}
        />
      )}
    </div>
  );
}