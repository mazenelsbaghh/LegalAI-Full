import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-scroll';
import { Scale, Menu, X } from 'lucide-react';

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-gray-900/80 backdrop-blur-lg' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Scale className="h-8 w-8 text-indigo-400" />
            <span className="mr-2 text-xl font-bold text-white">المحاماة الذكية</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="features"
              smooth={true}
              duration={500}
              className="text-gray-300 hover:text-white cursor-pointer"
            >
              المميزات
            </Link>
            <Link
              to="pricing"
              smooth={true}
              duration={500}
              className="text-gray-300 hover:text-white cursor-pointer"
            >
              الأسعار
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-bold"
            >
              ابدأ الآن
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-gray-900 py-4"
          >
            <div className="flex flex-col space-y-4 px-4">
              <Link
                to="features"
                smooth={true}
                duration={500}
                className="text-gray-300 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                المميزات
              </Link>
              <Link
                to="pricing"
                smooth={true}
                duration={500}
                className="text-gray-300 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                الأسعار
              </Link>
              <button className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-bold">
                ابدأ الآن
              </button>
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
}

export default Header;