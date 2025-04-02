import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Shield, Clock, Users } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: "مساعد قانوني ذكي",
    description: "ذكاء اصطناعي مخصص يتعلم من أسلوب عملك ويقدم رؤى قانونية ذكية",
    modelUrl: "https://cdn.spline.design/ai-brain-animated.gif"
  },
  {
    icon: Shield,
    title: "حماية قانونية متكاملة",
    description: "أمان من الدرجة المؤسسية لجميع مستنداتك القانونية ومعلومات عملائك",
    modelUrl: "https://cdn.spline.design/shield-animated.gif"
  },
  {
    icon: Clock,
    title: "إدارة ذكية للوقت",
    description: "تبسيط المهام الروتينية وزيادة كفاءة ممارستك القانونية",
    modelUrl: "https://cdn.spline.design/clock-animated.gif"
  },
  {
    icon: Users,
    title: "تجربة عملاء متميزة",
    description: "ملفات شخصية شاملة للعملاء مع سجل القضايا وتتبع التواصل",
    modelUrl: "https://cdn.spline.design/users-animated.gif"
  }
];

function FeatureSection() {
  return (
    <section id="features" className="min-h-screen py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
            مميزات تتخطى التوقعات
          </h2>
          <p className="text-xl text-gray-300">
            تقنيات متطورة تجعل عملك القانوني أكثر كفاءة وفعالية
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="group relative p-8 bg-white/5 backdrop-blur-lg rounded-2xl hover:bg-white/10 transition-all"
            >
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-xl overflow-hidden">
                  <img
                    src={feature.modelUrl}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-indigo-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureSection;