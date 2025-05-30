import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ApperIcon from '../components/ApperIcon';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 lg:p-8 border border-green-200/50 dark:border-surface-700/50"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mx-auto mb-6 lg:mb-8"
          >
            <ApperIcon name="Wheat" className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
          </motion.div>
          
          <h1 className="text-6xl lg:text-7xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-xl lg:text-2xl font-semibold text-surface-900 dark:text-white mb-2">
            Field Not Found
          </h2>
          <p className="text-sm lg:text-base text-surface-600 dark:text-surface-400 mb-6 lg:mb-8">
            Looks like this crop field doesn't exist in our system. Let's get you back to your farm dashboard.
          </p>
          
          <Link to="/">
            <motion.button
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-dark text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ApperIcon name="Home" className="w-5 h-5" />
              <span>Return to Dashboard</span>
            </motion.button>
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 lg:mt-8 flex items-center justify-center space-x-2 text-xs lg:text-sm text-surface-500 dark:text-surface-500"
        >
          <ApperIcon name="Info" className="w-4 h-4" />
          <span>Need help? Check your URL or contact support</span>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;