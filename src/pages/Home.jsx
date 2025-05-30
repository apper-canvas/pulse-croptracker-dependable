import { useState } from 'react';
import MainFeature from '../components/MainFeature';
import ApperIcon from '../components/ApperIcon';
import { motion } from 'framer-motion';

const Home = ({ darkMode, setDarkMode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900 transition-all duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-surface-900/80 border-b border-green-200/50 dark:border-surface-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg">
                <ApperIcon name="Wheat" className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-surface-900 dark:text-white">
                  CropTracker
                </h1>
                <p className="text-xs lg:text-sm text-surface-600 dark:text-surface-400 hidden sm:block">
                  Farm Management Platform
                </p>
              </div>
            </motion.div>
            
            <motion.button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 lg:p-3 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all duration-300 neu-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ApperIcon 
                name={darkMode ? "Sun" : "Moon"} 
                className="w-5 h-5 lg:w-6 lg:h-6 text-surface-700 dark:text-surface-300" 
              />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white/60 dark:bg-surface-800/60 backdrop-blur-sm border-b border-green-200/30 dark:border-surface-700/30 sticky top-16 lg:top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 sm:space-x-2 lg:space-x-4 py-2 lg:py-3 overflow-x-auto scrollbar-hide">
            {[
              { icon: 'LayoutDashboard', label: 'Dashboard', active: true },
              { icon: 'MapPin', label: 'Farms' },
              { icon: 'Wheat', label: 'Crops' },
              { icon: 'Calendar', label: 'Tasks' },
              { icon: 'DollarSign', label: 'Expenses' },
            ].map((tab, index) => (
              <motion.button
                key={tab.label}
                className={`flex items-center space-x-2 px-3 lg:px-4 py-2 lg:py-3 rounded-xl whitespace-nowrap transition-all duration-300 ${
                  tab.active
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-surface-100/80 dark:bg-surface-700/80 text-surface-700 dark:text-surface-300 hover:bg-surface-200/80 dark:hover:bg-surface-600/80'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ApperIcon name={tab.icon} className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="text-sm lg:text-base font-medium">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <MainFeature darkMode={darkMode} />
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm border-t border-green-200/50 dark:border-surface-700/50 mt-8 lg:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <ApperIcon name="Wheat" className="w-5 h-5 text-primary" />
              <span className="text-sm lg:text-base text-surface-600 dark:text-surface-400">
                © 2024 CropTracker. All rights reserved.
              </span>
            </div>
            <div className="flex items-center space-x-4 lg:space-x-6">
              <span className="text-xs lg:text-sm text-surface-500 dark:text-surface-500">
                Built for farmers, by farmers
              </span>
              <div className="flex items-center space-x-1">
                <ApperIcon name="Heart" className="w-4 h-4 text-red-500" />
                <span className="text-xs lg:text-sm text-surface-500 dark:text-surface-500">
                  Agriculture
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;