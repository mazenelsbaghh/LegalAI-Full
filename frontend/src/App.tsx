import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Toaster } from 'react-hot-toast';
import LandingPage from './components/LandingPage';
import LawyerDashboard from './components/lawyer/LawyerDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import ChatInterface from './components/chat/ChatInterface';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

function App() {
  const { user, loading, checkUser } = useAuthStore(
    </>
  );

  useEffect(() => {
    checkUser(
    </>
  );
  }, [checkUser]
    </>
  );

  if (loading) {
    
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-indigo-900 to-gray-900">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    
    </>
  );
  }

  
    <Router>
      <Toaster position="top-center" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/login" 
          element={
            user ? (
              <Navigate to={user.role === 'admin' ? '/admin' : '/lawyer'} replace />
            ) : (
              <Login />
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            user ? (
              <Navigate to={user.role === 'admin' ? '/admin' : '/lawyer'} replace />
            ) : (
              <Register />
            )
          } 
        />
        
        {/* Protected Lawyer Routes */}
        <Route 
          path="/lawyer/*" 
          element={
            user?.role === 'lawyer' ? (
              <LawyerDashboard />
            ) : user?.role === 'admin' ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Protected Admin Routes */}
        <Route 
          path="/admin/*" 
          element={
            user?.role === 'admin' ? (
              <AdminDashboard />
            ) : user?.role === 'lawyer' ? (
              <Navigate to="/lawyer" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Protected Chat Interface */}
        <Route 
          path="/chat" 
          element={user ? <ChatInterface /> : <Navigate to="/login" replace />} 
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  
    </>
  );
}

export default App;