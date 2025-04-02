import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout,
  Users,
  FileText,
  Calendar as CalendarIcon,
  MessageSquare,
  FileInput,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import ChatInterface from '../chat/ChatInterface';
import Overview from './Overview';
import CaseManagement from './cases/CaseManagement';
import ClientManagement from './clients/ClientManagement';
import CalendarView from './calendar/CalendarView';
import DocumentGenerator from './documents/DocumentGenerator';
import InvoiceManagement from './invoices/InvoiceManagement';
import LawyerSettings from './settings/LawyerSettings';

const menuItems = [
  { path: '', icon: Layout, label: 'لوحة التحكم' },
  { path: 'cases', icon: FileText, label: 'إدارة القضايا' },
  { path: 'clients', icon: Users, label: 'إدارة العملاء' },
  { path: 'calendar', icon: CalendarIcon, label: 'التقويم والمواعيد' },
  { path: 'chat', icon: MessageSquare, label: 'المساعد الذكي' },
  { path: 'documents', icon: FileInput, label: 'إنشاء المستندات' },
  { path: 'invoices', icon: CreditCard, label: 'الفواتير والمدفوعات' },
  { path: 'settings', icon: Settings, label: 'الإعدادات' },
];

export default function LawyerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, checkUser } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    checkUser().then(() => {
      const user = useAuthStore.getState().user;
      if (!user) {
        navigate('/login');
      } else if (user.role !== 'lawyer') {
        navigate('/admin');
      }
    });
  }, [navigate, checkUser]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="my-6">
      <DocumentGenerator />
    </div>
    <div className="min-h-screen bg-gradient-radial">
      <div className="flex">
        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-4 right-4 z-50">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg bg-dark-800/50 backdrop-blur-lg border border-gold-500/20"
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6 text-gold-500" />
            ) : (
              <Menu className="h-6 w-6 text-gold-500" />
            )}
          </button>
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {(isSidebarOpen || window.innerWidth >= 768) && (
            <motion.div
              initial={{ x: -250 }}
              animate={{ x: 0 }}
              exit={{ x: -250 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`w-64 min-h-screen bg-dark-800/50 backdrop-blur-lg p-4 fixed border-l border-gold-500/20 z-40
                ${isSidebarOpen ? 'block' : 'hidden md:block'}`}
            >
              <div className="flex items-center mb-8">
                <Layout className="h-8 w-8 text-gold-500" />
                <span className="mr-2 text-xl font-bold text-gold-500">لوحة المحامي</span>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = location.pathname === `/lawyer/${item.path}`;
                  const Icon = item.icon;
                  
                  return (
    <div className="my-6">
      <DocumentGenerator />
    </div>
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeSidebar}
                      className={`flex items-center space-x-2 p-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-gold-500 text-dark-900'
                          : 'text-gold-400 hover:bg-dark-700/50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="mr-2">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="absolute bottom-4 w-full left-0 px-4">
                <button 
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 text-gold-400 hover:text-gold-300 transition-colors w-full p-3 rounded-lg hover:bg-dark-700/50"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="mr-2">تسجيل الخروج</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 md:mr-64 p-4 md:p-8 pt-16 md:pt-8">
          <Routes>
            <Route path="" element={<Overview />} />
            <Route path="cases" element={<CaseManagement />} />
            <Route path="clients" element={<ClientManagement />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="chat" element={<ChatInterface />} />
            <Route path="documents" element={<DocumentGenerator />} />
            <Route path="invoices" element={<InvoiceManagement />} />
            <Route path="settings" element={<LawyerSettings />} />
          </Routes>
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </div>
    </div>
  );
}