import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from './ApperIcon';
import { format, addDays, isAfter, isBefore, startOfDay } from 'date-fns';

const MainFeature = ({ darkMode, searchQuery = '' }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
const [selectedLocation, setSelectedLocation] = useState('california');
  
  // Weather data for different locations
  const weatherData = {
    california: {
      location: 'California Central Valley',
      current: {
        temperature: 72,
        condition: 'Sunny',
        humidity: 45,
        windSpeed: 8,
        icon: 'Sun'
      },
      forecast: [
        { day: 'Today', high: 75, low: 55, condition: 'Sunny', icon: 'Sun' },
        { day: 'Tomorrow', high: 78, low: 58, condition: 'Partly Cloudy', icon: 'Cloud' },
        { day: format(addDays(new Date(), 2), 'EEE'), high: 76, low: 60, condition: 'Cloudy', icon: 'Cloud' },
        { day: format(addDays(new Date(), 3), 'EEE'), high: 73, low: 57, condition: 'Light Rain', icon: 'CloudRain' },
        { day: format(addDays(new Date(), 4), 'EEE'), high: 71, low: 54, condition: 'Sunny', icon: 'Sun' }
      ]
    },
    iowa: {
      location: 'Iowa Corn Belt',
      current: {
        temperature: 65,
        condition: 'Partly Cloudy',
        humidity: 60,
        windSpeed: 12,
        icon: 'Cloud'
      },
      forecast: [
        { day: 'Today', high: 68, low: 48, condition: 'Partly Cloudy', icon: 'Cloud' },
        { day: 'Tomorrow', high: 71, low: 52, condition: 'Sunny', icon: 'Sun' },
        { day: format(addDays(new Date(), 2), 'EEE'), high: 74, low: 55, condition: 'Thunderstorms', icon: 'CloudRain' },
        { day: format(addDays(new Date(), 3), 'EEE'), high: 69, low: 51, condition: 'Cloudy', icon: 'Cloud' },
        { day: format(addDays(new Date(), 4), 'EEE'), high: 72, low: 54, condition: 'Sunny', icon: 'Sun' }
      ]
    },
    kansas: {
      location: 'Kansas Wheat Belt',
      current: {
        temperature: 70,
        condition: 'Clear',
        humidity: 35,
        windSpeed: 15,
        icon: 'Sun'
      },
      forecast: [
        { day: 'Today', high: 74, low: 52, condition: 'Clear', icon: 'Sun' },
        { day: 'Tomorrow', high: 77, low: 55, condition: 'Sunny', icon: 'Sun' },
        { day: format(addDays(new Date(), 2), 'EEE'), high: 79, low: 58, condition: 'Partly Cloudy', icon: 'Cloud' },
        { day: format(addDays(new Date(), 3), 'EEE'), high: 75, low: 54, condition: 'Windy', icon: 'Cloud' },
        { day: format(addDays(new Date(), 4), 'EEE'), high: 73, low: 51, condition: 'Clear', icon: 'Sun' }
      ]
    },
    texas: {
      location: 'Texas Panhandle',
      current: {
        temperature: 78,
        condition: 'Hot',
        humidity: 40,
        windSpeed: 10,
        icon: 'Sun'
      },
      forecast: [
        { day: 'Today', high: 82, low: 62, condition: 'Hot', icon: 'Sun' },
        { day: 'Tomorrow', high: 85, low: 65, condition: 'Sunny', icon: 'Sun' },
        { day: format(addDays(new Date(), 2), 'EEE'), high: 83, low: 63, condition: 'Partly Cloudy', icon: 'Cloud' },
        { day: format(addDays(new Date(), 3), 'EEE'), high: 81, low: 61, condition: 'Thunderstorms', icon: 'CloudRain' },
        { day: format(addDays(new Date(), 4), 'EEE'), high: 79, low: 59, condition: 'Cloudy', icon: 'Cloud' }
      ]
    },
    nebraska: {
      location: 'Nebraska Plains',
      current: {
        temperature: 63,
        condition: 'Breezy',
        humidity: 55,
        windSpeed: 18,
        icon: 'Cloud'
      },
      forecast: [
        { day: 'Today', high: 67, low: 45, condition: 'Breezy', icon: 'Cloud' },
        { day: 'Tomorrow', high: 70, low: 48, condition: 'Partly Cloudy', icon: 'Cloud' },
        { day: format(addDays(new Date(), 2), 'EEE'), high: 72, low: 51, condition: 'Sunny', icon: 'Sun' },
        { day: format(addDays(new Date(), 3), 'EEE'), high: 69, low: 49, condition: 'Light Rain', icon: 'CloudRain' },
        { day: format(addDays(new Date(), 4), 'EEE'), high: 66, low: 46, condition: 'Cloudy', icon: 'Cloud' }
      ]
    }
  };

  const currentWeather = weatherData[selectedLocation];
  // Initialize with sample data
  useEffect(() => {
    const sampleFarms = [
      {
        id: '1',
        name: 'Green Valley Farm',
        location: 'California, USA',
        size: 150,
        soilType: 'Loamy',
        createdAt: new Date('2023-01-15')
      },
      {
        id: '2',
        name: 'Sunrise Acres',
        location: 'Texas, USA',
        size: 200,
        soilType: 'Clay',
        createdAt: new Date('2023-03-20')
      }
    ];

    const sampleCrops = [
      {
        id: '1',
        farmId: '1',
        name: 'Tomatoes',
        variety: 'Cherry Tomatoes',
        plantingDate: new Date('2024-01-15'),
        expectedHarvestDate: new Date('2024-04-15'),
        area: 25,
        status: 'Growing'
      },
      {
        id: '2',
        farmId: '1',
        name: 'Corn',
        variety: 'Sweet Corn',
        plantingDate: new Date('2024-02-01'),
        expectedHarvestDate: new Date('2024-06-01'),
        area: 50,
        status: 'Planted'
      }
    ];

    const sampleTasks = [
      {
        id: '1',
        farmId: '1',
        cropId: '1',
        title: 'Water Tomatoes',
        description: 'Daily watering of cherry tomato plants',
        dueDate: new Date(),
        completed: false,
        priority: 'High'
      },
      {
        id: '2',
        farmId: '1',
        cropId: '2',
        title: 'Fertilize Corn',
        description: 'Apply organic fertilizer to corn field',
        dueDate: addDays(new Date(), 2),
        completed: false,
        priority: 'Medium'
      }
    ];

    const sampleExpenses = [
      {
        id: '1',
        farmId: '1',
        cropId: '1',
        amount: 250.00,
        category: 'Seeds',
        description: 'Cherry tomato seeds',
        date: new Date('2024-01-10')
      },
      {
        id: '2',
        farmId: '1',
        cropId: null,
        amount: 1200.00,
        category: 'Equipment',
        description: 'Irrigation system upgrade',
        date: new Date('2024-01-20')
      }
    ];

    setFarms(sampleFarms);
    setCrops(sampleCrops);
    setTasks(sampleTasks);
    setExpenses(sampleExpenses);
  }, []);

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setEditingItem(null);
  };

  const handleSubmit = (formData) => {
    const id = editingItem?.id || Date.now().toString();
    const timestamp = new Date();

    switch (modalType) {
      case 'farm':
        const farmData = {
          ...formData,
          id,
          createdAt: editingItem?.createdAt || timestamp,
          size: parseFloat(formData.size)
        };
        
        if (editingItem) {
          setFarms(farms.map(f => f.id === id ? farmData : f));
          toast.success('Farm updated successfully!');
        } else {
          setFarms([...farms, farmData]);
          toast.success('Farm added successfully!');
        }
        break;

      case 'crop':
        const cropData = {
          ...formData,
          id,
          area: parseFloat(formData.area),
          plantingDate: new Date(formData.plantingDate),
          expectedHarvestDate: new Date(formData.expectedHarvestDate)
        };
        
        if (editingItem) {
          setCrops(crops.map(c => c.id === id ? cropData : c));
          toast.success('Crop updated successfully!');
        } else {
          setCrops([...crops, cropData]);
          toast.success('Crop added successfully!');
        }
        break;

      case 'task':
        const taskData = {
          ...formData,
          id,
          dueDate: new Date(formData.dueDate),
          completed: editingItem?.completed || false
        };
        
        if (editingItem) {
          setTasks(tasks.map(t => t.id === id ? taskData : t));
          toast.success('Task updated successfully!');
        } else {
          setTasks([...tasks, taskData]);
          toast.success('Task added successfully!');
        }
        break;

      case 'expense':
        const expenseData = {
          ...formData,
          id,
          amount: parseFloat(formData.amount),
          date: new Date(formData.date)
        };
        
        if (editingItem) {
          setExpenses(expenses.map(e => e.id === id ? expenseData : e));
          toast.success('Expense updated successfully!');
        } else {
          setExpenses([...expenses, expenseData]);
          toast.success('Expense added successfully!');
        }
        break;
    }
    
    closeModal();
  };

  const toggleTaskComplete = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    ));
    
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      toast.success(task.completed ? 'Task marked as incomplete' : 'Task completed!');
    }
  };

  const deleteItem = (type, id) => {
    switch (type) {
      case 'farm':
        setFarms(farms.filter(f => f.id !== id));
        toast.success('Farm deleted successfully!');
        break;
      case 'crop':
        setCrops(crops.filter(c => c.id !== id));
        toast.success('Crop deleted successfully!');
        break;
      case 'task':
        setTasks(tasks.filter(t => t.id !== id));
        toast.success('Task deleted successfully!');
        break;
      case 'expense':
        setExpenses(expenses.filter(e => e.id !== id));
        toast.success('Expense deleted successfully!');
        break;
    }
  };

  const getFarmName = (farmId) => {
    const farm = farms.find(f => f.id === farmId);
    return farm ? farm.name : 'Unknown Farm';
  };

  const getCropName = (cropId) => {
    const crop = crops.find(c => c.id === cropId);
    return crop ? crop.name : 'General';
  };

  const getUpcomingTasks = () => {
    const today = startOfDay(new Date());
    const upcoming = addDays(today, 7);
    return tasks.filter(task => 
      !task.completed && 
      isAfter(task.dueDate, today) && 
      isBefore(task.dueDate, upcoming)
    ).sort((a, b) => a.dueDate - b.dueDate);
  };

  const getOverdueTasks = () => {
    const today = startOfDay(new Date());
    return tasks.filter(task => 
      !task.completed && isBefore(task.dueDate, today)
    );
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getExpensesByCategory = () => {
    const categoryTotals = {};
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    return categoryTotals;
  };

  const renderOverview = () => {
    const upcomingTasks = getUpcomingTasks();
    const overdueTasks = getOverdueTasks();
    const totalExpenses = getTotalExpenses();
    const activeCrops = crops.filter(crop => crop.status !== 'Harvested');

    return (
      <div className="space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[
            { label: 'Total Farms', value: farms.length, icon: 'MapPin', color: 'primary' },
            { label: 'Active Crops', value: activeCrops.length, icon: 'Wheat', color: 'secondary' },
            { label: 'Pending Tasks', value: tasks.filter(t => !t.completed).length, icon: 'Calendar', color: 'accent' },
            { label: 'Total Expenses', value: `$${totalExpenses.toLocaleString()}`, icon: 'DollarSign', color: 'primary' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-surface-200/50 dark:border-surface-700/50 shadow-soft"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-2 lg:mb-3">
                <div className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-${stat.color} to-${stat.color}-dark rounded-xl flex items-center justify-center`}>
                  <ApperIcon name={stat.icon} className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
              <div className="text-xl lg:text-2xl font-bold text-surface-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-xs lg:text-sm text-surface-600 dark:text-surface-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Upcoming Tasks & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Upcoming Tasks */}
          <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-surface-200/50 dark:border-surface-700/50 shadow-soft">
            <h3 className="text-lg lg:text-xl font-semibold text-surface-900 dark:text-white mb-4 lg:mb-6 flex items-center">
              <ApperIcon name="Clock" className="w-5 h-5 lg:w-6 lg:h-6 mr-2 text-secondary" />
              Upcoming Tasks
              {overdueTasks.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {overdueTasks.length} overdue
                </span>
              )}
            </h3>
            <div className="space-y-3 lg:space-y-4">
              {upcomingTasks.slice(0, 5).map((task) => (
                <motion.div
                  key={task.id}
                  className="flex items-center justify-between p-3 lg:p-4 bg-surface-50 dark:bg-surface-700 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-surface-900 dark:text-white text-sm lg:text-base">
                      {task.title}
                    </h4>
                    <p className="text-xs lg:text-sm text-surface-600 dark:text-surface-400">
                      {getFarmName(task.farmId)} • {format(task.dueDate, 'MMM dd')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'High' ? 'bg-red-100 text-red-700' :
                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {task.priority}
                  </span>
                </motion.div>
              ))}
              {upcomingTasks.length === 0 && (
                <div className="text-center py-6 lg:py-8 text-surface-500 dark:text-surface-500">
                  <ApperIcon name="CheckCircle" className="w-8 h-8 lg:w-10 lg:h-10 mx-auto mb-2 lg:mb-3" />
                  <p className="text-sm lg:text-base">No upcoming tasks</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Expenses */}
          <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-surface-200/50 dark:border-surface-700/50 shadow-soft">
            <h3 className="text-lg lg:text-xl font-semibold text-surface-900 dark:text-white mb-4 lg:mb-6 flex items-center">
              <ApperIcon name="TrendingUp" className="w-5 h-5 lg:w-6 lg:h-6 mr-2 text-secondary" />
              Recent Expenses
            </h3>
            <div className="space-y-3 lg:space-y-4">
              {expenses.slice(-5).reverse().map((expense) => (
                <motion.div
                  key={expense.id}
                  className="flex items-center justify-between p-3 lg:p-4 bg-surface-50 dark:bg-surface-700 rounded-xl"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-surface-900 dark:text-white text-sm lg:text-base">
                      {expense.description}
                    </h4>
                    <p className="text-xs lg:text-sm text-surface-600 dark:text-surface-400">
                      {expense.category} • {format(expense.date, 'MMM dd')}
                    </p>
                  </div>
                  <span className="font-semibold text-surface-900 dark:text-white text-sm lg:text-base">
                    ${expense.amount.toLocaleString()}
                  </span>
                </motion.div>
              ))}
              {expenses.length === 0 && (
                <div className="text-center py-6 lg:py-8 text-surface-500 dark:text-surface-500">
                  <ApperIcon name="Receipt" className="w-8 h-8 lg:w-10 lg:h-10 mx-auto mb-2 lg:mb-3" />
                  <p className="text-sm lg:text-base">No expenses recorded</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

const renderFarms = () => {
    // Filter farms based on search query
    const filteredFarms = farms.filter(farm => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        farm.name.toLowerCase().includes(query) ||
        farm.location.toLowerCase().includes(query) ||
        farm.soilType.toLowerCase().includes(query)
      );
    });

    return (
      <div className="space-y-6 lg:space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <h2 className="text-xl lg:text-2xl font-bold text-surface-900 dark:text-white">
            Farm Management
          </h2>
          <motion.button
            onClick={() => openModal('farm')}
            className="flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-dark text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ApperIcon name="Plus" className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>Add Farm</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {filteredFarms.map((farm, index) => (
            <motion.div
              key={farm.id}
              className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-surface-200/50 dark:border-surface-700/50 shadow-soft hover:shadow-card transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
                  <ApperIcon name="MapPin" className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                </div>
<div className="flex space-x-2">
                  <button
                    onClick={() => openModal('farm', farm)}
                    className="p-2 text-surface-600 hover:text-primary transition-colors"
                  >
                    <ApperIcon name="Edit2" className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteItem('farm', farm.id)}
                    className="p-2 text-surface-600 hover:text-red-500 transition-colors"
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg lg:text-xl font-semibold text-surface-900 dark:text-white mb-2">
                {farm.name}
              </h3>
              <p className="text-sm lg:text-base text-surface-600 dark:text-surface-400 mb-4">
                {farm.location}
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-600 dark:text-surface-400">Size:</span>
                  <span className="text-surface-900 dark:text-white font-medium">{farm.size} acres</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-600 dark:text-surface-400">Soil Type:</span>
                  <span className="text-surface-900 dark:text-white font-medium">{farm.soilType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-600 dark:text-surface-400">Created:</span>
                  <span className="text-surface-900 dark:text-white font-medium">
                    {format(farm.createdAt, 'MMM yyyy')}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-600 dark:text-surface-400">Active Crops:</span>
                  <span className="text-primary font-medium">
                    {crops.filter(crop => crop.farmId === farm.id).length}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredFarms.length === 0 && farms.length > 0 && (
          <div className="text-center py-12 lg:py-16">
            <ApperIcon name="Search" className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-6 text-surface-400" />
            <h3 className="text-lg lg:text-xl font-semibold text-surface-900 dark:text-white mb-2">
              No farms found
            </h3>
            <p className="text-sm lg:text-base text-surface-600 dark:text-surface-400 mb-6 lg:mb-8">
              No farms match your search criteria. Try adjusting your search terms.
            </p>
          </div>
        )}

{farms.length === 0 && (
          <div className="text-center py-12 lg:py-16">
            <ApperIcon name="MapPin" className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-6 text-surface-400" />
            <h3 className="text-lg lg:text-xl font-semibold text-surface-900 dark:text-white mb-2">
              No farms yet
            </h3>
            <p className="text-sm lg:text-base text-surface-600 dark:text-surface-400 mb-6 lg:mb-8">
              Start by adding your first farm to begin tracking your agricultural operations.
            </p>
            <motion.button
              onClick={() => openModal('farm')}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-dark text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ApperIcon name="Plus" className="w-5 h-5" />
              <span>Add Your First Farm</span>
            </motion.button>
          </div>
        )}
      </div>
    );
};
  const renderCrops = () => (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <h2 className="text-xl lg:text-2xl font-bold text-surface-900 dark:text-white">
          Crop Management
        </h2>
        <motion.button
          onClick={() => openModal('crop')}
          className="flex items-center space-x-2 bg-gradient-to-r from-secondary to-secondary-dark text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ApperIcon name="Plus" className="w-4 h-4 lg:w-5 lg:h-5" />
          <span>Add Crop</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {crops.map((crop, index) => (
          <motion.div
            key={crop.id}
            className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-surface-200/50 dark:border-surface-700/50 shadow-soft hover:shadow-card transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-secondary to-secondary-dark rounded-xl flex items-center justify-center">
                <ApperIcon name="Wheat" className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => openModal('crop', crop)}
                  className="p-2 text-surface-600 hover:text-secondary transition-colors"
                >
                  <ApperIcon name="Edit2" className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteItem('crop', crop.id)}
                  className="p-2 text-surface-600 hover:text-red-500 transition-colors"
                >
                  <ApperIcon name="Trash2" className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg lg:text-xl font-semibold text-surface-900 dark:text-white mb-1">
              {crop.name}
            </h3>
            <p className="text-sm lg:text-base text-surface-600 dark:text-surface-400 mb-3">
              {crop.variety}
            </p>
            <p className="text-xs lg:text-sm text-surface-500 dark:text-surface-500 mb-4">
              {getFarmName(crop.farmId)}
            </p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-surface-600 dark:text-surface-400">Area:</span>
                <span className="text-surface-900 dark:text-white font-medium">{crop.area} acres</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-600 dark:text-surface-400">Planted:</span>
                <span className="text-surface-900 dark:text-white font-medium">
                  {format(crop.plantingDate, 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-600 dark:text-surface-400">Harvest:</span>
                <span className="text-surface-900 dark:text-white font-medium">
                  {format(crop.expectedHarvestDate, 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
            
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
              crop.status === 'Growing' ? 'bg-green-100 text-green-700' :
              crop.status === 'Planted' ? 'bg-blue-100 text-blue-700' :
              crop.status === 'Harvested' ? 'bg-gray-100 text-gray-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {crop.status}
            </span>
          </motion.div>
        ))}
      </div>

      {crops.length === 0 && (
        <div className="text-center py-12 lg:py-16">
          <ApperIcon name="Wheat" className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-6 text-surface-400" />
          <h3 className="text-lg lg:text-xl font-semibold text-surface-900 dark:text-white mb-2">
            No crops planted
          </h3>
          <p className="text-sm lg:text-base text-surface-600 dark:text-surface-400 mb-6 lg:mb-8">
            Add your first crop to start tracking your planting and harvest cycles.
          </p>
          <motion.button
            onClick={() => openModal('crop')}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-secondary to-secondary-dark text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ApperIcon name="Plus" className="w-5 h-5" />
            <span>Add Your First Crop</span>
          </motion.button>
        </div>
      )}
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <h2 className="text-xl lg:text-2xl font-bold text-surface-900 dark:text-white">
          Task Management
        </h2>
        <motion.button
          onClick={() => openModal('task')}
          className="flex items-center space-x-2 bg-gradient-to-r from-accent to-purple-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ApperIcon name="Plus" className="w-4 h-4 lg:w-5 lg:h-5" />
          <span>Add Task</span>
        </motion.button>
      </div>

      <div className="space-y-4 lg:space-y-6">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            className={`bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-surface-200/50 dark:border-surface-700/50 shadow-soft transition-all duration-300 ${
              task.completed ? 'opacity-75' : ''
            } ${
              !task.completed && isBefore(task.dueDate, startOfDay(new Date())) 
                ? 'border-l-4 border-l-red-500' 
                : ''
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-start space-x-4">
              <button
                onClick={() => toggleTaskComplete(task.id)}
                className={`mt-1 w-5 h-5 lg:w-6 lg:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  task.completed
                    ? 'bg-primary border-primary'
                    : 'border-surface-300 dark:border-surface-600 hover:border-primary'
                }`}
              >
                {task.completed && (
                  <ApperIcon name="Check" className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                )}
              </button>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 space-y-2 sm:space-y-0">
                  <h3 className={`text-lg lg:text-xl font-semibold ${
                    task.completed 
                      ? 'text-surface-500 dark:text-surface-500 line-through' 
                      : 'text-surface-900 dark:text-white'
                  }`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'High' ? 'bg-red-100 text-red-700' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {task.priority}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal('task', task)}
                        className="p-1 text-surface-600 hover:text-accent transition-colors"
                      >
                        <ApperIcon name="Edit2" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteItem('task', task.id)}
                        className="p-1 text-surface-600 hover:text-red-500 transition-colors"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm lg:text-base text-surface-600 dark:text-surface-400 mb-3">
                  {task.description}
                </p>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-sm">
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="MapPin" className="w-4 h-4 text-surface-500" />
                    <span className="text-surface-600 dark:text-surface-400">
                      {getFarmName(task.farmId)}
                    </span>
                  </div>
                  {task.cropId && (
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="Wheat" className="w-4 h-4 text-surface-500" />
                      <span className="text-surface-600 dark:text-surface-400">
                        {getCropName(task.cropId)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="Calendar" className="w-4 h-4 text-surface-500" />
                    <span className={`${
                      !task.completed && isBefore(task.dueDate, startOfDay(new Date()))
                        ? 'text-red-600 font-medium'
                        : 'text-surface-600 dark:text-surface-400'
                    }`}>
                      Due {format(task.dueDate, 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12 lg:py-16">
          <ApperIcon name="Calendar" className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-6 text-surface-400" />
          <h3 className="text-lg lg:text-xl font-semibold text-surface-900 dark:text-white mb-2">
            No tasks scheduled
          </h3>
          <p className="text-sm lg:text-base text-surface-600 dark:text-surface-400 mb-6 lg:mb-8">
            Create your first task to start organizing your farm activities.
          </p>
          <motion.button
            onClick={() => openModal('task')}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-accent to-purple-600 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ApperIcon name="Plus" className="w-5 h-5" />
            <span>Add Your First Task</span>
          </motion.button>
        </div>
      )}
    </div>
  );

  const renderExpenses = () => {
    const expensesByCategory = getExpensesByCategory();
    const totalExpenses = getTotalExpenses();

    return (
      <div className="space-y-6 lg:space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-surface-900 dark:text-white">
              Expense Tracking
            </h2>
            <p className="text-sm lg:text-base text-surface-600 dark:text-surface-400 mt-1">
              Total: ${totalExpenses.toLocaleString()}
            </p>
          </div>
          <motion.button
            onClick={() => openModal('expense')}
            className="flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-dark text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ApperIcon name="Plus" className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>Add Expense</span>
          </motion.button>
        </div>

        {/* Category Summary */}
        {Object.keys(expensesByCategory).length > 0 && (
          <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-surface-200/50 dark:border-surface-700/50 shadow-soft">
            <h3 className="text-lg lg:text-xl font-semibold text-surface-900 dark:text-white mb-4 lg:mb-6">
              Expenses by Category
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {Object.entries(expensesByCategory).map(([category, amount]) => (
                <div key={category} className="text-center">
                  <div className="text-xl lg:text-2xl font-bold text-surface-900 dark:text-white">
                    ${amount.toLocaleString()}
                  </div>
                  <div className="text-sm lg:text-base text-surface-600 dark:text-surface-400">
                    {category}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expense List */}
        <div className="space-y-4 lg:space-y-6">
          {expenses.map((expense, index) => (
            <motion.div
              key={expense.id}
              className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-surface-200/50 dark:border-surface-700/50 shadow-soft hover:shadow-card transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg lg:text-xl font-semibold text-surface-900 dark:text-white">
                      {expense.description}
                    </h3>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => openModal('expense', expense)}
                        className="p-1 text-surface-600 hover:text-primary transition-colors"
                      >
                        <ApperIcon name="Edit2" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteItem('expense', expense.id)}
                        className="p-1 text-surface-600 hover:text-red-500 transition-colors"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-sm">
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="Tag" className="w-4 h-4 text-surface-500" />
                      <span className="text-surface-600 dark:text-surface-400">
                        {expense.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="MapPin" className="w-4 h-4 text-surface-500" />
                      <span className="text-surface-600 dark:text-surface-400">
                        {getFarmName(expense.farmId)}
                      </span>
                    </div>
                    {expense.cropId && (
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="Wheat" className="w-4 h-4 text-surface-500" />
                        <span className="text-surface-600 dark:text-surface-400">
                          {getCropName(expense.cropId)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="Calendar" className="w-4 h-4 text-surface-500" />
                      <span className="text-surface-600 dark:text-surface-400">
                        {format(expense.date, 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-xl lg:text-2xl font-bold text-surface-900 dark:text-white sm:ml-4">
                  ${expense.amount.toLocaleString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {expenses.length === 0 && (
          <div className="text-center py-12 lg:py-16">
            <ApperIcon name="DollarSign" className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-6 text-surface-400" />
            <h3 className="text-lg lg:text-xl font-semibold text-surface-900 dark:text-white mb-2">
              No expenses recorded
            </h3>
            <p className="text-sm lg:text-base text-surface-600 dark:text-surface-400 mb-6 lg:mb-8">
              Start tracking your farm expenses to better manage your budget.
            </p>
            <motion.button
              onClick={() => openModal('expense')}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-dark text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ApperIcon name="Plus" className="w-5 h-5" />
              <span>Record Your First Expense</span>
            </motion.button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Tab Navigation */}
      <div className="flex space-x-1 sm:space-x-2 mb-6 lg:mb-8 overflow-x-auto scrollbar-hide">
        {[
          { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
          { id: 'farms', label: 'Farms', icon: 'MapPin' },
          { id: 'crops', label: 'Crops', icon: 'Wheat' },
          { id: 'tasks', label: 'Tasks', icon: 'Calendar' },
          { id: 'expenses', label: 'Expenses', icon: 'DollarSign' }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-3 lg:px-4 py-2 lg:py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-lg'
                : 'bg-surface-100/80 dark:bg-surface-700/80 text-surface-700 dark:text-surface-300 hover:bg-surface-200/80 dark:hover:bg-surface-600/80'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ApperIcon name={tab.icon} className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="text-sm lg:text-base">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'farms' && renderFarms()}
          {activeTab === 'crops' && renderCrops()}
          {activeTab === 'tasks' && renderTasks()}
          {activeTab === 'expenses' && renderExpenses()}
        </motion.div>
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white dark:bg-surface-800 rounded-2xl p-6 lg:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl lg:text-2xl font-bold text-surface-900 dark:text-white">
                  {editingItem ? 'Edit' : 'Add'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 text-surface-600 hover:text-surface-900 dark:hover:text-white transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>

              <ModalForm
                type={modalType}
                initialData={editingItem}
                onSubmit={handleSubmit}
                onCancel={closeModal}
                farms={farms}
                crops={crops}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Modal Form Component
const ModalForm = ({ type, initialData, onSubmit, onCancel, farms, crops }) => {
  const [formData, setFormData] = useState(initialData || {});

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderFarmForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Farm Name
        </label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Location
        </label>
        <input
          type="text"
          value={formData.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Size (acres)
        </label>
        <input
          type="number"
          value={formData.size || ''}
          onChange={(e) => handleChange('size', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Soil Type
        </label>
        <select
          value={formData.soilType || ''}
          onChange={(e) => handleChange('soilType', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
          required
        >
          <option value="">Select soil type</option>
          <option value="Clay">Clay</option>
          <option value="Sandy">Sandy</option>
          <option value="Loamy">Loamy</option>
          <option value="Silty">Silty</option>
        </select>
      </div>
      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors"
        >
          {initialData ? 'Update' : 'Add'} Farm
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-surface-200 dark:bg-surface-600 text-surface-700 dark:text-surface-300 py-3 rounded-xl font-medium hover:bg-surface-300 dark:hover:bg-surface-500 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  const renderCropForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Farm
        </label>
        <select
          value={formData.farmId || ''}
          onChange={(e) => handleChange('farmId', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300"
          required
        >
          <option value="">Select farm</option>
          {farms.map(farm => (
            <option key={farm.id} value={farm.id}>{farm.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Crop Name
        </label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Variety
        </label>
        <input
          type="text"
          value={formData.variety || ''}
          onChange={(e) => handleChange('variety', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Area (acres)
        </label>
        <input
          type="number"
          value={formData.area || ''}
          onChange={(e) => handleChange('area', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Planting Date
        </label>
        <input
          type="date"
          value={formData.plantingDate ? format(new Date(formData.plantingDate), 'yyyy-MM-dd') : ''}
          onChange={(e) => handleChange('plantingDate', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Expected Harvest Date
        </label>
        <input
          type="date"
          value={formData.expectedHarvestDate ? format(new Date(formData.expectedHarvestDate), 'yyyy-MM-dd') : ''}
          onChange={(e) => handleChange('expectedHarvestDate', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Status
        </label>
        <select
          value={formData.status || 'Planted'}
          onChange={(e) => handleChange('status', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300"
          required
        >
          <option value="Planted">Planted</option>
          <option value="Growing">Growing</option>
          <option value="Ready">Ready</option>
          <option value="Harvested">Harvested</option>
        </select>
      </div>
      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-secondary text-white py-3 rounded-xl font-medium hover:bg-secondary-dark transition-colors"
        >
          {initialData ? 'Update' : 'Add'} Crop
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-surface-200 dark:bg-surface-600 text-surface-700 dark:text-surface-300 py-3 rounded-xl font-medium hover:bg-surface-300 dark:hover:bg-surface-500 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  const renderTaskForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Farm
        </label>
        <select
          value={formData.farmId || ''}
          onChange={(e) => handleChange('farmId', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
          required
        >
          <option value="">Select farm</option>
          {farms.map(farm => (
            <option key={farm.id} value={farm.id}>{farm.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Crop (Optional)
        </label>
        <select
          value={formData.cropId || ''}
          onChange={(e) => handleChange('cropId', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
        >
          <option value="">Select crop (optional)</option>
          {crops.filter(crop => crop.farmId === formData.farmId).map(crop => (
            <option key={crop.id} value={crop.id}>{crop.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Task Title
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Due Date
        </label>
        <input
          type="date"
          value={formData.dueDate ? format(new Date(formData.dueDate), 'yyyy-MM-dd') : ''}
          onChange={(e) => handleChange('dueDate', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Priority
        </label>
        <select
          value={formData.priority || 'Medium'}
          onChange={(e) => handleChange('priority', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
          required
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-accent text-white py-3 rounded-xl font-medium hover:bg-purple-600 transition-colors"
        >
          {initialData ? 'Update' : 'Add'} Task
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-surface-200 dark:bg-surface-600 text-surface-700 dark:text-surface-300 py-3 rounded-xl font-medium hover:bg-surface-300 dark:hover:bg-surface-500 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  const renderExpenseForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Farm
        </label>
        <select
          value={formData.farmId || ''}
          onChange={(e) => handleChange('farmId', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
          required
        >
          <option value="">Select farm</option>
          {farms.map(farm => (
            <option key={farm.id} value={farm.id}>{farm.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Crop (Optional)
        </label>
        <select
          value={formData.cropId || ''}
          onChange={(e) => handleChange('cropId', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
        >
          <option value="">Select crop (optional)</option>
          {crops.filter(crop => crop.farmId === formData.farmId).map(crop => (
            <option key={crop.id} value={crop.id}>{crop.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Amount ($)
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.amount || ''}
          onChange={(e) => handleChange('amount', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Category
        </label>
        <select
          value={formData.category || ''}
          onChange={(e) => handleChange('category', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
          required
        >
          <option value="">Select category</option>
          <option value="Seeds">Seeds</option>
          <option value="Fertilizer">Fertilizer</option>
          <option value="Equipment">Equipment</option>
          <option value="Labor">Labor</option>
          <option value="Fuel">Fuel</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Description
        </label>
        <input
          type="text"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Date
        </label>
        <input
          type="date"
          value={formData.date ? format(new Date(formData.date), 'yyyy-MM-dd') : ''}
          onChange={(e) => handleChange('date', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
          required
        />
      </div>
      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors"
        >
          {initialData ? 'Update' : 'Add'} Expense
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-surface-200 dark:bg-surface-600 text-surface-700 dark:text-surface-300 py-3 rounded-xl font-medium hover:bg-surface-300 dark:hover:bg-surface-500 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  switch (type) {
    case 'farm':
      return renderFarmForm();
    case 'crop':
      return renderCropForm();
    case 'task':
      return renderTaskForm();
    case 'expense':
      return renderExpenseForm();
    default:
      return null;
  }
};

export default MainFeature;