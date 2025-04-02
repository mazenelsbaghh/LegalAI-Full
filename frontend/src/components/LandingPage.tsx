import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Brain, Shield, Users, LogIn } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-radial">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Scale className="h-8 w-8 text-gold-500" />
              <span className="mr-2 text-xl font-bold text-gold-500">المحاماة الذكية</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="flex items-center px-6 py-2 bg-gold-500 hover:bg-gold-600 rounded-lg text-dark-900 font-bold transition-colors"
              >
                <LogIn className="w-5 h-5 ml-2" />
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center relative px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-gold-600">
            المستقبل القانوني
            <br />
            <span className="text-gold-500">بين يديك</span>
          </h1>
          <p className="text-xl md:text-2xl text-gold-300 mb-12">
            منصة ذكاء اصطناعي متطورة تجمع بين الخبرة القانونية والتكنولوجيا المتقدمة
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-8 py-4 btn-gold rounded-xl text-lg font-bold shadow-lg hover:shadow-gold-500/50 transition-all"
            >
              تسجيل الدخول
            </motion.button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-dark-800/50 backdrop-blur-lg p-8 rounded-2xl border border-gold-500/20"
            >
              <Brain className="w-12 h-12 text-gold-500 mb-4" />
              <h3 className="text-xl font-bold text-gold-500 mb-2">مساعد قانوني ذكي</h3>
              <p className="text-gold-300">
                يساعدك في تحليل القضايا وتقديم الاستشارات القانونية باستخدام الذكاء الاصطناعي
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-dark-800/50 backdrop-blur-lg p-8 rounded-2xl border border-gold-500/20"
            >
              <Shield className="w-12 h-12 text-gold-500 mb-4" />
              <h3 className="text-xl font-bold text-gold-500 mb-2">حماية قانونية متكاملة</h3>
              <p className="text-gold-300">
                نظام متكامل لحماية وتنظيم المعلومات القانونية والوثائق
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-dark-800/50 backdrop-blur-lg p-8 rounded-2xl border border-gold-500/20"
            >
              <Users className="w-12 h-12 text-gold-500 mb-4" />
              <h3 className="text-xl font-bold text-gold-500 mb-2">إدارة العملاء</h3>
              <p className="text-gold-300">
                نظام متطور لإدارة العملاء وتتبع القضايا والمواعيد والمستندات
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}