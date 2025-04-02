import React from 'react';
import { motion } from 'framer-motion';

function Footer() {
  return (
    <footer className="py-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl font-bold mb-4 text-white">منصة المحاماة الذكية</h3>
            <p className="text-gray-400">تمكين المحامين بالتكنولوجيا الذكية</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-lg font-bold mb-4 text-white">المميزات</h4>
            <ul className="space-y-2 text-gray-400">
              <li>المساعد الذكي</li>
              <li>تحليل المستندات</li>
              <li>إدارة القضايا</li>
              <li>البحث القانوني</li>
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h4 className="text-lg font-bold mb-4 text-white">الشركة</h4>
            <ul className="space-y-2 text-gray-400">
              <li>من نحن</li>
              <li>اتصل بنا</li>
              <li>سياسة الخصوصية</li>
              <li>شروط الخدمة</li>
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h4 className="text-lg font-bold mb-4 text-white">تواصل معنا</h4>
            <div className="space-y-2 text-gray-400">
              <p>البريد الإلكتروني: support@legalai.com</p>
              <p>الهاتف: +1 (555) 123-4567</p>
            </div>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400"
        >
          <p>جميع الحقوق محفوظة © 2024 منصة المحاماة الذكية</p>
        </motion.div>
      </div>
    </footer>
  );
}

export default Footer;