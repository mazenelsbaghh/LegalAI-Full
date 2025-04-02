import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, ArrowRight } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate(); 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gold-500 mb-4">التسجيل غير متاح</h2>
        <p className="text-gray-400 mb-4">يرجى التواصل مع مشرف النظام للحصول على حساب</p>
        <button
          onClick={() => navigate('/login')}
          className="text-gold-400 hover:text-gold-300 transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          <span>العودة لتسجيل الدخول</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}