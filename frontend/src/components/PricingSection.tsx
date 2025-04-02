import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
  {
    name: "الأساسية",
    price: "49$",
    features: [
      "نظام إدارة القضايا",
      "تخزين المستندات",
      "مساعدة ذكاء اصطناعي أساسية",
      "دعم بالبريد الإلكتروني"
    ]
  },
  {
    name: "الاحترافية",
    price: "99$",
    features: [
      "جميع مميزات الباقة الأساسية",
      "ميزات الذكاء الاصطناعي المتقدمة",
      "تحليل المستندات",
      "دعم ذو أولوية",
      "بوابة العملاء"
    ],
    highlighted: true
  },
  {
    name: "المؤسسات",
    price: "199$",
    features: [
      "جميع مميزات الباقة الاحترافية",
      "تدريب ذكاء اصطناعي مخصص",
      "تحليلات متقدمة",
      "دعم مخصص",
      "تكاملات مخصصة",
      "تخزين غير محدود"
    ]
  }
];

function PricingSection() {
  return (
    <section id="pricing" className="min-h-screen py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
            خطط أسعار مرنة
          </h2>
          <p className="text-xl text-gray-300">
            اختر الخطة المناسبة لاحتياجات مكتبك القانوني
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className={`relative p-8 rounded-2xl backdrop-blur-lg ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-indigo-600/40 to-purple-600/40 border border-indigo-500/50'
                  : 'bg-white/5 hover:bg-white/10'
              } transition-all`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 right-4 bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-1 rounded-full text-sm font-bold">
                  الأكثر شعبية
                </div>
              )}
              
              <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
              <div className="mb-8">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-400">/شهرياً</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-indigo-400" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-4 rounded-xl font-bold ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                } transition-all`}
              >
                ابدأ الآن
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PricingSection;