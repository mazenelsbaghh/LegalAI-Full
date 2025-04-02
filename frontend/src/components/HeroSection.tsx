import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-scroll';
import { ChevronDown } from 'lucide-react';

function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center relative px-4 py-20">
      {/* 3D Model Container */}
      <div className="w-64 h-64 mb-8">
        <img 
          src="https://cdn.spline.design/ai-justice-scales-animated.gif" 
          alt="3D Legal AI Icon"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
          المستقبل القانوني
          <br />
          <span className="text-indigo-400">بين يديك</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-12">
          منصة ذكاء اصطناعي متطورة تجمع بين الخبرة القانونية والتكنولوجيا المتقدمة
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-16">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-lg font-bold shadow-lg hover:shadow-indigo-500/50 transition-all"
          >
            ابدأ تجربتك المجانية
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-xl text-lg font-bold hover:bg-white/20 transition-all"
          >
            شاهد العرض التوضيحي
          </motion.button>
        </div>

        {/* Scroll Indicator */}
        <Link
          to="features"
          smooth={true}
          duration={500}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-10 h-10 text-indigo-400" />
          </motion.div>
        </Link>
      </motion.div>
    </section>
  );
}

export default HeroSection;