import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from './ApperIcon';
import { format, addDays, isAfter, isBefore, startOfDay } from 'date-fns';
import Chart from 'react-apexcharts';
import axios from 'axios';

// ImageUpload Component
const ImageUpload = ({ images = [], onChange, label = "Upload Images" }) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    let hasError = false;

    fileArray.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files (JPEG, PNG, GIF, WebP)');
        hasError = true;
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        hasError = true;
        return;
      }

      // Create URL for preview
      const fileWithPreview = {
        file,
        id: Date.now() + Math.random(),
        url: URL.createObjectURL(file),
        name: file.name
      };
      
      validFiles.push(fileWithPreview);
    });

    if (!hasError) {
      setError('');
      onChange([...images, ...validFiles]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    // Clean up URL objects
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove && imageToRemove.url) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    onChange(updatedImages);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
        {label}
      </label>
      
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer ${
          dragOver 
            ? 'drag-over' 
            : 'border-surface-300 dark:border-surface-600 hover:border-primary dark:hover:border-primary hover:bg-surface-50 dark:hover:bg-surface-700/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('image-upload').click()}
      >
        <ApperIcon name="Upload" className="w-8 h-8 mx-auto mb-2 text-surface-400" />
        <p className="text-sm text-surface-600 dark:text-surface-400 mb-1">
          Drag and drop images here, or click to browse
        </p>
        <p className="text-xs text-surface-500 dark:text-surface-500">
          Supports JPEG, PNG, GIF, WebP (max 5MB each)
        </p>
        
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Selected Images ({images.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-20 object-cover rounded-lg border border-surface-200 dark:border-surface-600"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(image.id);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                >
                  <ApperIcon name="X" className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg truncate">
                  {image.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
// Weather Service Component
const WeatherService = {
  API_KEY: import.meta.env.VITE_WEATHER_API_KEY || 'demo_key',
  BASE_URL: 'https://api.openweathermap.org/data/2.5',

  // Location mapping for farm regions
  LOCATION_COORDS: {
    california: { lat: 36.7783, lon: -119.4179, name: 'California Central Valley' },
    iowa: { lat: 42.0046, lon: -93.214, name: 'Iowa Corn Belt' },
    kansas: { lat: 38.2904, lon: -98.4842, name: 'Kansas Wheat Belt' },
    texas: { lat: 35.2, lon: -101.8313, name: 'Texas Panhandle' },
    nebraska: { lat: 41.5868, lon: -99.9014, name: 'Nebraska Plains' }
  },

  async fetchCurrentWeather(location) {
    try {
      const coords = this.LOCATION_COORDS[location];
      if (!coords) throw new Error('Invalid location');

      const response = await axios.get(`${this.BASE_URL}/weather`, {
        params: {
          lat: coords.lat,
          lon: coords.lon,
          appid: this.API_KEY,
          units: 'imperial'
        }
      });

      return {
        temperature: Math.round(response.data.main.temp),
        condition: response.data.weather[0].main,
        description: response.data.weather[0].description,
        humidity: response.data.main.humidity,
        windSpeed: Math.round(response.data.wind.speed),
        icon: this.mapWeatherIcon(response.data.weather[0].main)
      };
    } catch (error) {
      console.warn('Weather API error:', error.message);
      return this.getFallbackWeather(location);
    }
  },

  async fetchWeatherForecast(location) {
    try {
      const coords = this.LOCATION_COORDS[location];
      if (!coords) throw new Error('Invalid location');

      const response = await axios.get(`${this.BASE_URL}/forecast`, {
        params: {
          lat: coords.lat,
          lon: coords.lon,
          appid: this.API_KEY,
          units: 'imperial'
        }
      });

      // Process 5-day forecast (take one reading per day at noon)
      const dailyForecasts = [];
      const processedDates = new Set();

      response.data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        if (!processedDates.has(dateStr) && dailyForecasts.length < 5) {
          processedDates.add(dateStr);
          dailyForecasts.push({
            day: dailyForecasts.length === 0 ? 'Today' : 
                 dailyForecasts.length === 1 ? 'Tomorrow' : 
                 format(date, 'EEE'),
            high: Math.round(item.main.temp_max),
            low: Math.round(item.main.temp_min),
            condition: item.weather[0].main,
            icon: this.mapWeatherIcon(item.weather[0].main)
          });
        }
      });

      return dailyForecasts;
    } catch (error) {
      console.warn('Weather forecast API error:', error.message);
      return this.getFallbackForecast(location);
    }
  },

  mapWeatherIcon(condition) {
    const iconMap = {
      'Clear': 'Sun',
      'Clouds': 'Cloud',
      'Rain': 'CloudRain',
      'Drizzle': 'CloudRain',
      'Thunderstorm': 'CloudRain',
      'Snow': 'Cloud',
      'Mist': 'Cloud',
      'Fog': 'Cloud',
      'Haze': 'Cloud',
      'Sunny': 'Sun',
      'Partly Cloudy': 'Cloud',
      'Cloudy': 'Cloud'
    };
    return iconMap[condition] || 'Cloud';
  },

  getFallbackWeather(location) {
    // Fallback static data when API is unavailable
    const fallbackData = {
      california: { temperature: 72, condition: 'Sunny', humidity: 45, windSpeed: 8, icon: 'Sun' },
      iowa: { temperature: 65, condition: 'Partly Cloudy', humidity: 60, windSpeed: 12, icon: 'Cloud' },
      kansas: { temperature: 70, condition: 'Clear', humidity: 35, windSpeed: 15, icon: 'Sun' },
      texas: { temperature: 78, condition: 'Hot', humidity: 40, windSpeed: 10, icon: 'Sun' },
      nebraska: { temperature: 63, condition: 'Breezy', humidity: 55, windSpeed: 18, icon: 'Cloud' }
    };
    return fallbackData[location] || fallbackData.california;
  },

  getFallbackForecast(location) {
    // Fallback static forecast when API is unavailable
    const baseForecast = [
      { day: 'Today', high: 75, low: 55, condition: 'Sunny', icon: 'Sun' },
      { day: 'Tomorrow', high: 78, low: 58, condition: 'Partly Cloudy', icon: 'Cloud' },
      { day: format(addDays(new Date(), 2), 'EEE'), high: 76, low: 60, condition: 'Cloudy', icon: 'Cloud' },
      { day: format(addDays(new Date(), 3), 'EEE'), high: 73, low: 57, condition: 'Light Rain', icon: 'CloudRain' },
      { day: format(addDays(new Date(), 4), 'EEE'), high: 71, low: 54, condition: 'Sunny', icon: 'Sun' }
    ];
    return baseForecast;
  }
};

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
  
  // Weather state management
  const [weatherData, setWeatherData] = useState({});
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [lastWeatherUpdate, setLastWeatherUpdate] = useState(null);

  // Location data for weather service
  const locationOptions = {
    california: 'California Central Valley',
    iowa: 'Iowa Corn Belt', 
    kansas: 'Kansas Wheat Belt',
    texas: 'Texas Panhandle',
    nebraska: 'Nebraska Plains'
  };

  // Fetch weather data
  const fetchWeatherData = async (location) => {
    try {
      setWeatherLoading(true);
      setWeatherError(null);

      const [currentWeather, forecast] = await Promise.all([
        WeatherService.fetchCurrentWeather(location),
        WeatherService.fetchWeatherForecast(location)
      ]);

      setWeatherData(prev => ({
        ...prev,
        [location]: {
          location: locationOptions[location],
          current: currentWeather,
          forecast: forecast
        }
      }));

      setLastWeatherUpdate(new Date());
      toast.success('Weather data updated successfully!');
    } catch (error) {
      console.error('Weather fetch error:', error);
      setWeatherError('Failed to fetch weather data');
      toast.error('Failed to update weather data. Using cached information.');
    } finally {
      setWeatherLoading(false);
    }
  };

  // Initialize weather data and set up auto-refresh
  useEffect(() => {
    // Fetch initial weather data for all locations
    const initializeWeather = async () => {
      const locations = Object.keys(locationOptions);
      for (const location of locations) {
        await fetchWeatherData(location);
      }
    };

    initializeWeather();

    // Set up auto-refresh every 30 minutes
    const weatherInterval = setInterval(() => {
      if (!weatherLoading) {
        fetchWeatherData(selectedLocation);
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(weatherInterval);
  }, []);

  // Refresh weather when location changes
  useEffect(() => {
    if (selectedLocation && (!weatherData[selectedLocation] || 
        (lastWeatherUpdate && Date.now() - lastWeatherUpdate.getTime() > 30 * 60 * 1000))) {
      fetchWeatherData(selectedLocation);
    }
  }, [selectedLocation]);

  const currentWeather = weatherData[selectedLocation] || {
    location: locationOptions[selectedLocation],
    current: { temperature: '--', condition: 'Loading...', humidity: '--', windSpeed: '--', icon: 'Cloud' },
    forecast: []
  };
// Sample revenue data for charts
  const sampleRevenue = [
    { farmId: '1', amount: 3500.00, source: 'Crop Sales', date: new Date('2024-01-25') },
    { farmId: '1', amount: 2800.00, source: 'Crop Sales', date: new Date('2024-02-15') },
    { farmId: '2', amount: 4200.00, source: 'Crop Sales', date: new Date('2024-02-20') },
    { farmId: '1', amount: 3100.00, source: 'Crop Sales', date: new Date('2024-03-10') },
    { farmId: '2', amount: 3800.00, source: 'Crop Sales', date: new Date('2024-03-15') },
    { farmId: '1', amount: 4500.00, source: 'Crop Sales', date: new Date('2024-04-05') },
  ];

  // Initialize sample data
  useEffect(() => {
    const sampleFarms = [
      {
        id: '1',
        name: 'Green Valley Farm',
        location: 'California Central Valley',
        size: 150,
        soilType: 'Loamy',
        createdAt: new Date('2024-01-01')
      },
      {
        id: '2',
        name: 'Sunset Acres',
        location: 'Iowa Corn Belt',
        size: 280,
        soilType: 'Clay',
        createdAt: new Date('2024-02-15')
      }
    ];

    const sampleCrops = [
      {
        id: '1',
        farmId: '1',
        name: 'Tomatoes',
        variety: 'Cherry',
        area: 25,
        plantingDate: new Date('2024-03-15'),
        expectedHarvestDate: new Date('2024-07-01'),
        status: 'Growing'
      },
      {
        id: '2',
        farmId: '2',
        name: 'Corn',
        variety: 'Sweet',
        area: 120,
        plantingDate: new Date('2024-04-01'),
        expectedHarvestDate: new Date('2024-09-15'),
        status: 'Growing'
      }
    ];

    const sampleTasks = [
      {
        id: '1',
        farmId: '1',
        cropId: '1',
        title: 'Water irrigation system check',
        description: 'Inspect and test all irrigation components',
        dueDate: new Date('2024-04-15'),
        priority: 'High',
priority: 'High',
        completed: false,
        status: 'Not Started'
      },
      {
        id: '2',
        farmId: '2',
        cropId: null,
        title: 'Soil pH testing',
        description: 'Test soil pH levels across all fields',
        dueDate: new Date('2024-04-20'),
        priority: 'Medium',
        completed: false,
        status: 'In Progress'
      }
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

  // Chart data processing functions
  const getMonthlyExpensesData = () => {
    const monthlyData = {};
    expenses.forEach(expense => {
      const month = format(expense.date, 'MMM yyyy');
      if (!monthlyData[month]) {
        monthlyData[month] = {};
      }
      monthlyData[month][expense.category] = (monthlyData[month][expense.category] || 0) + expense.amount;
    });
    
    const categories = [...new Set(expenses.map(e => e.category))];
    const months = Object.keys(monthlyData).sort();
    
    return {
      categories: months,
      series: categories.map(category => ({
        name: category,
        data: months.map(month => monthlyData[month][category] || 0)
      }))
    };
  };

  const getRevenueVsExpensesData = () => {
    const monthlyRevenue = {};
    const monthlyExpenses = {};
    
    sampleRevenue.forEach(revenue => {
      const month = format(revenue.date, 'MMM yyyy');
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + revenue.amount;
    });
    
    expenses.forEach(expense => {
      const month = format(expense.date, 'MMM yyyy');
      monthlyExpenses[month] = (monthlyExpenses[month] || 0) + expense.amount;
    });
    
    const allMonths = [...new Set([...Object.keys(monthlyRevenue), ...Object.keys(monthlyExpenses)])].sort();
    
    return {
      categories: allMonths,
      series: [
        {
          name: 'Revenue',
          data: allMonths.map(month => monthlyRevenue[month] || 0)
        },
        {
          name: 'Expenses',
          data: allMonths.map(month => monthlyExpenses[month] || 0)
        }
      ]
    };
  };

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
          size: parseFloat(formData.size),
          images: formData.images || []
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
          expectedHarvestDate: new Date(formData.expectedHarvestDate),
          images: formData.images || []
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
completed: editingItem?.completed || false,
          status: formData.status || 'Not Started'
        
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
// Chart rendering functions
  const renderExpenseChart = () => {
    const expenseData = getMonthlyExpensesData();
    
    const chartOptions = {
      chart: {
        type: 'bar',
        height: 300,
        toolbar: { show: false },
        background: 'transparent'
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          borderRadius: 8
        }
      },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      xaxis: {
        categories: expenseData.categories,
        labels: { style: { colors: darkMode ? '#9CA3AF' : '#6B7280' } }
      },
      yaxis: {
        title: { text: 'Amount ($)', style: { color: darkMode ? '#9CA3AF' : '#6B7280' } },
        labels: { 
          style: { colors: darkMode ? '#9CA3AF' : '#6B7280' },
          formatter: (value) => `$${value.toLocaleString()}`
        }
      },
      fill: { opacity: 1 },
      tooltip: {
        theme: darkMode ? 'dark' : 'light',
        y: { formatter: (val) => `$${val.toLocaleString()}` }
      },
      legend: {
        labels: { colors: darkMode ? '#9CA3AF' : '#6B7280' }
      },
      colors: ['#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'],
      grid: {
        borderColor: darkMode ? '#374151' : '#e5e7eb',
        strokeDashArray: 5
      }
    };

    return (
      <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-surface-200/50 dark:border-surface-700/50 shadow-soft">
        <h3 className="text-lg lg:text-xl font-semibold text-surface-900 dark:text-white mb-4 flex items-center">
          <ApperIcon name="BarChart3" className="w-5 h-5 lg:w-6 lg:h-6 mr-2 text-primary" />
          Monthly Expenses by Category
        </h3>
        <Chart options={chartOptions} series={expenseData.series} type="bar" height={300} />
      </div>
    );
  };

  const renderRevenueChart = () => {
    const revenueData = getRevenueVsExpensesData();
    
    const chartOptions = {
      chart: {
        type: 'line',
        height: 300,
        toolbar: { show: false },
        background: 'transparent'
      },
      stroke: { curve: 'smooth', width: 3 },
      xaxis: {
        categories: revenueData.categories,
        labels: { style: { colors: darkMode ? '#9CA3AF' : '#6B7280' } }
      },
      yaxis: {
        title: { text: 'Amount ($)', style: { color: darkMode ? '#9CA3AF' : '#6B7280' } },
        labels: { 
          style: { colors: darkMode ? '#9CA3AF' : '#6B7280' },
          formatter: (value) => `$${value.toLocaleString()}`
        }
      },
      tooltip: {
        theme: darkMode ? 'dark' : 'light',
        y: { formatter: (val) => `$${val.toLocaleString()}` }
      },
      legend: {
        labels: { colors: darkMode ? '#9CA3AF' : '#6B7280' }
      },
      colors: ['#22c55e', '#ef4444'],
      grid: {
        borderColor: darkMode ? '#374151' : '#e5e7eb',
        strokeDashArray: 5
      },
      markers: { size: 6 }
    };

    return (
      <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-surface-200/50 dark:border-surface-700/50 shadow-soft">
        <h3 className="text-lg lg:text-xl font-semibold text-surface-900 dark:text-white mb-4 flex items-center">
          <ApperIcon name="TrendingUp" className="w-5 h-5 lg:w-6 lg:h-6 mr-2 text-primary" />
          Revenue vs Expenses Trend
        </h3>
        <Chart options={chartOptions} series={revenueData.series} type="line" height={300} />
      </div>
    );
  };

  const renderFarmPerformanceChart = () => {
    const farmRevenue = {};
    const farmExpenses = {};
    
    sampleRevenue.forEach(revenue => {
      farmRevenue[revenue.farmId] = (farmRevenue[revenue.farmId] || 0) + revenue.amount;
    });
    
    expenses.forEach(expense => {
      farmExpenses[expense.farmId] = (farmExpenses[expense.farmId] || 0) + expense.amount;
    });
    
    const farmNames = farms.map(farm => farm.name);
    const revenueData = farms.map(farm => farmRevenue[farm.id] || 0);
    const expenseData = farms.map(farm => farmExpenses[farm.id] || 0);
    
    const chartOptions = {
      chart: {
        type: 'bar',
        height: 300,
        toolbar: { show: false },
        background: 'transparent'
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          borderRadius: 8
        }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: farmNames,
        labels: { style: { colors: darkMode ? '#9CA3AF' : '#6B7280' } }
      },
      yaxis: {
        title: { text: 'Amount ($)', style: { color: darkMode ? '#9CA3AF' : '#6B7280' } },
        labels: { 
          style: { colors: darkMode ? '#9CA3AF' : '#6B7280' },
          formatter: (value) => `$${value.toLocaleString()}`
        }
      },
      tooltip: {
        theme: darkMode ? 'dark' : 'light',
        y: { formatter: (val) => `$${val.toLocaleString()}` }
      },
      legend: {
        labels: { colors: darkMode ? '#9CA3AF' : '#6B7280' }
      },
      colors: ['#22c55e', '#ef4444'],
      grid: {
        borderColor: darkMode ? '#374151' : '#e5e7eb',
        strokeDashArray: 5
      }
    };

    const series = [
      { name: 'Revenue', data: revenueData },
      { name: 'Expenses', data: expenseData }
    ];

    return (
      <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-surface-200/50 dark:border-surface-700/50 shadow-soft">
        <h3 className="text-lg lg:text-xl font-semibold text-surface-900 dark:text-white mb-4 flex items-center">
          <ApperIcon name="BarChart2" className="w-5 h-5 lg:w-6 lg:h-6 mr-2 text-primary" />
          Farm Performance Comparison
        </h3>
        <Chart options={chartOptions} series={series} type="bar" height={300} />
      </div>
    );
  };

  const renderCategoryDonutChart = () => {
    const categoryData = getExpensesByCategory();
    const categories = Object.keys(categoryData);
    const amounts = Object.values(categoryData);
    
    const chartOptions = {
      chart: {
        type: 'donut',
        height: 300,
        background: 'transparent'
      },
      labels: categories,
      responsive: [{
        breakpoint: 480,
        options: {
          chart: { width: 200 },
          legend: { position: 'bottom' }
        }
      }],
      tooltip: {
        theme: darkMode ? 'dark' : 'light',
        y: { formatter: (val) => `$${val.toLocaleString()}` }
      },
      legend: {
        labels: { colors: darkMode ? '#9CA3AF' : '#6B7280' },
        position: 'bottom'
      },
      colors: ['#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'],
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total',
                color: darkMode ? '#9CA3AF' : '#6B7280',
                formatter: () => `$${getTotalExpenses().toLocaleString()}`
              }
            }
          }
        }
      }
    };

    return (
      <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-surface-200/50 dark:border-surface-700/50 shadow-soft">
        <h3 className="text-lg lg:text-xl font-semibold text-surface-900 dark:text-white mb-4 flex items-center">
          <ApperIcon name="PieChart" className="w-5 h-5 lg:w-6 lg:h-6 mr-2 text-primary" />
          Expense Breakdown
        </h3>
        <Chart options={chartOptions} series={amounts} type="donut" height={300} />
      </div>
    );
  };
const renderReports = () => {
    return (
      <div className="space-y-6 lg:space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-bold text-surface-900 dark:text-white">
            Reports
          </h2>
          <p className="text-sm lg:text-base text-surface-600 dark:text-surface-400">
            Expense tracking and financial reports
          </p>
        </div>

        {/* Expense Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {renderExpenseChart()}
          {renderCategoryDonutChart()}
        </div>

        {/* Summary Stats */}
        <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-surface-200/50 dark:border-surface-700/50 shadow-soft">
          <h3 className="text-lg lg:text-xl font-semibold text-surface-900 dark:text-white mb-4 lg:mb-6">
            Financial Summary
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-surface-900 dark:text-white">
                ${getTotalExpenses().toLocaleString()}
              </div>
              <div className="text-sm lg:text-base text-surface-600 dark:text-surface-400">
                Total Expenses
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-surface-900 dark:text-white">
                {Object.keys(getExpensesByCategory()).length}
              </div>
              <div className="text-sm lg:text-base text-surface-600 dark:text-surface-400">
                Expense Categories
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-surface-900 dark:text-white">
                {expenses.length}
              </div>
              <div className="text-sm lg:text-base text-surface-600 dark:text-surface-400">
                Total Transactions
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-surface-900 dark:text-white">
                ${expenses.length > 0 ? (getTotalExpenses() / expenses.length).toFixed(0) : '0'}
              </div>
              <div className="text-sm lg:text-base text-surface-600 dark:text-surface-400">
                Avg. Transaction
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    return (
      <div className="space-y-6 lg:space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-bold text-surface-900 dark:text-white">
            Analytics
          </h2>
          <p className="text-sm lg:text-base text-surface-600 dark:text-surface-400">
            Performance insights and trend analysis
          </p>
        </div>

        {/* Performance Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {renderRevenueChart()}
          {renderFarmPerformanceChart()}
        </div>

        {/* Key Metrics */}
        <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-surface-200/50 dark:border-surface-700/50 shadow-soft">
          <h3 className="text-lg lg:text-xl font-semibold text-surface-900 dark:text-white mb-4 lg:mb-6">
            Key Performance Indicators
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-green-600">
                ${sampleRevenue.reduce((total, rev) => total + rev.amount, 0).toLocaleString()}
              </div>
              <div className="text-sm lg:text-base text-surface-600 dark:text-surface-400">
                Total Revenue
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-blue-600">
                {((sampleRevenue.reduce((total, rev) => total + rev.amount, 0) - getTotalExpenses()) / sampleRevenue.reduce((total, rev) => total + rev.amount, 0) * 100).toFixed(1)}%
              </div>
              <div className="text-sm lg:text-base text-surface-600 dark:text-surface-400">
                Profit Margin
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-purple-600">
                {farms.length > 0 ? (sampleRevenue.reduce((total, rev) => total + rev.amount, 0) / farms.length).toFixed(0) : '0'}
              </div>
              <div className="text-sm lg:text-base text-surface-600 dark:text-surface-400">
                Revenue per Farm
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-orange-600">
                {crops.reduce((total, crop) => total + crop.area, 0)}
              </div>
              <div className="text-sm lg:text-base text-surface-600 dark:text-surface-400">
                Total Acres Cultivated
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
<div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'High' ? 'bg-red-100 text-red-700' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      task.status === 'On Hold' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status}
                    </span>
                  </div>
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
{/* Real-time Weather Widget */}
        <div className={`rounded-2xl p-4 lg:p-6 border shadow-soft transition-all duration-300 ${
          weatherLoading 
            ? 'weather-loading' 
            : currentWeather.current.condition === 'Sunny' || currentWeather.current.condition === 'Clear'
              ? 'weather-sunny'
              : currentWeather.current.condition?.includes('Rain') || currentWeather.current.condition?.includes('Storm')
                ? 'weather-rainy'
                : currentWeather.current.condition?.includes('Cloud')
                  ? 'weather-cloudy'
                  : 'weather-card'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-6 space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg lg:text-xl font-semibold text-surface-900 dark:text-white flex items-center">
                <ApperIcon 
                  name={currentWeather.current.icon} 
                  className={`w-5 h-5 lg:w-6 lg:h-6 mr-2 text-secondary ${!weatherLoading ? 'weather-icon-bounce' : ''}`} 
                />
                Weather Forecast
              </h3>
              {weatherLoading && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-secondary rounded-full animate-pulse"></div>
                  <span className="text-xs text-surface-500">Updating...</span>
                </div>
              )}
              {lastWeatherUpdate && !weatherLoading && (
                <span className="text-xs text-surface-500 dark:text-surface-400">
                  Updated {format(lastWeatherUpdate, 'HH:mm')}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-3 py-1 lg:px-4 lg:py-2 text-sm lg:text-base bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-lg text-surface-900 dark:text-white focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300"
              >
                {Object.entries(locationOptions).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <motion.button
                onClick={() => fetchWeatherData(selectedLocation)}
                disabled={weatherLoading}
                className="p-2 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary transition-all duration-300 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ApperIcon 
                  name="RefreshCw" 
                  className={`w-4 h-4 ${weatherLoading ? 'animate-spin' : ''}`} 
                />
              </motion.button>
            </div>
          </div>

          {weatherError && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">
                {weatherError} - Showing cached data
              </p>
            </div>
          )}

          {/* Current Weather */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-secondary to-secondary-dark rounded-xl flex items-center justify-center">
                <ApperIcon name={currentWeather.current.icon} className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div>
                <div className="text-xl lg:text-2xl font-bold text-surface-900 dark:text-white">
                  {currentWeather.current.temperature}°F
                </div>
                <div className="text-xs lg:text-sm text-surface-600 dark:text-surface-400">
                  {currentWeather.current.condition}
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className={`text-lg lg:text-xl font-semibold ${weatherLoading ? 'animate-pulse' : ''} text-surface-900 dark:text-white`}>
                {typeof currentWeather.current.humidity === 'number' ? `${currentWeather.current.humidity}%` : currentWeather.current.humidity}
              </div>
              <div className="text-xs lg:text-sm text-surface-600 dark:text-surface-400">
                Humidity
              </div>
            </div>
            <div className="text-center">
              <div className={`text-lg lg:text-xl font-semibold ${weatherLoading ? 'animate-pulse' : ''} text-surface-900 dark:text-white`}>
                {typeof currentWeather.current.windSpeed === 'number' ? `${currentWeather.current.windSpeed} mph` : currentWeather.current.windSpeed}
              </div>
              <div className="text-xs lg:text-sm text-surface-600 dark:text-surface-400">
                Wind Speed
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg lg:text-xl font-semibold text-surface-900 dark:text-white">
                {currentWeather.location ? currentWeather.location.split(' ').slice(-2).join(' ') : 'Unknown'}
              </div>
              <div className="text-xs lg:text-sm text-surface-600 dark:text-surface-400">
                Region
              </div>
            </div>
          </div>

          {/* Weather Alerts/Recommendations */}
          {!weatherLoading && currentWeather.current.temperature && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {currentWeather.current.temperature > 85 && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    High Heat - Increase Irrigation
                  </span>
                )}
                {currentWeather.current.condition?.includes('Rain') && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    Rain Expected - Postpone Spraying
                  </span>
                )}
                {currentWeather.current.windSpeed > 15 && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    High Winds - Avoid Chemical Applications
                  </span>
                )}
                {currentWeather.current.humidity < 30 && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                    Low Humidity - Monitor Soil Moisture
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 5-Day Forecast */}
          <div className="grid grid-cols-5 gap-2 lg:gap-4">
            {(currentWeather.forecast && currentWeather.forecast.length > 0 ? currentWeather.forecast : Array(5).fill(null)).map((day, index) => (
              <motion.div
                key={index}
                className={`rounded-xl p-3 lg:p-4 text-center transition-all duration-300 ${
                  weatherLoading || !day 
                    ? 'bg-surface-100 dark:bg-surface-700 animate-pulse' 
                    : 'bg-surface-50 dark:bg-surface-700 hover:bg-surface-100 dark:hover:bg-surface-600'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={!weatherLoading && day ? { scale: 1.02 } : {}}
              >
                <div className="text-xs lg:text-sm font-medium text-surface-600 dark:text-surface-400 mb-2">
                  {day?.day || (index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : `Day ${index + 1}`)}
                </div>
                <div className="w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-2">
                  <ApperIcon 
                    name={day?.icon || 'Cloud'} 
                    className={`w-full h-full text-secondary ${!weatherLoading && day ? 'weather-icon-bounce' : ''}`} 
                  />
                </div>
                <div className="text-sm lg:text-base font-semibold text-surface-900 dark:text-white mb-1">
                  {day?.high ? `${day.high}°` : '--°'}
                </div>
                <div className="text-xs lg:text-sm text-surface-500 dark:text-surface-500 mb-2">
                  {day?.low ? `${day.low}°` : '--°'}
                </div>
                <div className="text-xs text-surface-600 dark:text-surface-400">
                  {day?.condition || 'Loading...'}
                </div>
              </motion.div>
            ))}
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
const renderCrops = () => {
    // Filter crops based on search query
    const filteredCrops = crops.filter(crop => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        crop.name.toLowerCase().includes(query) ||
        crop.variety.toLowerCase().includes(query) ||
        getFarmName(crop.farmId).toLowerCase().includes(query)
      );
    });

    return (
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
          {filteredCrops.map((crop, index) => (
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

        {filteredCrops.length === 0 && crops.length > 0 && (
          <div className="text-center py-12 lg:py-16">
            <ApperIcon name="Search" className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-6 text-surface-400" />
            <h3 className="text-lg lg:text-xl font-semibold text-surface-900 dark:text-white mb-2">
              No crops found
            </h3>
            <p className="text-sm lg:text-base text-surface-600 dark:text-surface-400 mb-6 lg:mb-8">
              No crops match your search criteria. Try adjusting your search terms.
            </p>
          </div>
        )}

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
  };

const renderTasks = () => {
    // Filter tasks based on search query
    const filteredTasks = tasks.filter(task => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        getFarmName(task.farmId).toLowerCase().includes(query)
      );
    });

    return (
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
          {filteredTasks.map((task, index) => (
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
<div className="flex flex-col space-y-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.priority === 'High' ? 'bg-red-100 text-red-700' :
                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        task.status === 'On Hold' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {task.status}
                      </span>
                    </div>
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

        {filteredTasks.length === 0 && tasks.length > 0 && (
          <div className="text-center py-12 lg:py-16">
            <ApperIcon name="Search" className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-6 text-surface-400" />
            <h3 className="text-lg lg:text-xl font-semibold text-surface-900 dark:text-white mb-2">
              No tasks found
            </h3>
            <p className="text-sm lg:text-base text-surface-600 dark:text-surface-400 mb-6 lg:mb-8">
              No tasks match your search criteria. Try adjusting your search terms.
            </p>
          </div>
        )}

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
  };

const renderExpenses = () => {
    const expensesByCategory = getExpensesByCategory();
    const totalExpenses = getTotalExpenses();

    // Filter expenses based on search query
    const filteredExpenses = expenses.filter(expense => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        expense.description.toLowerCase().includes(query) ||
        expense.category.toLowerCase().includes(query) ||
        getFarmName(expense.farmId).toLowerCase().includes(query)
      );
    });

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
          {filteredExpenses.map((expense, index) => (
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

        {filteredExpenses.length === 0 && expenses.length > 0 && (
          <div className="text-center py-12 lg:py-16">
            <ApperIcon name="Search" className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-6 text-surface-400" />
            <h3 className="text-lg lg:text-xl font-semibold text-surface-900 dark:text-white mb-2">
              No expenses found
            </h3>
            <p className="text-sm lg:text-base text-surface-600 dark:text-surface-400 mb-6 lg:mb-8">
              No expenses match your search criteria. Try adjusting your search terms.
            </p>
          </div>
        )}

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
<div className="flex flex-wrap gap-2 lg:gap-3 mb-6 lg:mb-8 p-2 lg:p-3 bg-surface-50/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl border border-surface-200/50 dark:border-surface-700/50 shadow-soft">
        {[
          { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
          { id: 'farms', label: 'Farms', icon: 'MapPin' },
          { id: 'crops', label: 'Crops', icon: 'Wheat' },
          { id: 'tasks', label: 'Tasks', icon: 'Calendar' },
          { id: 'expenses', label: 'Expenses', icon: 'DollarSign' },
          { id: 'reports', label: 'Reports', icon: 'FileText' },
          { id: 'analytics', label: 'Analytics', icon: 'TrendingUp' }
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
{activeTab === 'reports' && renderReports()}
          {activeTab === 'analytics' && renderAnalytics()}
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
<ImageUpload
        images={formData.images || []}
        onChange={(images) => handleChange('images', images)}
        label="Farm Images (Equipment, Activities, etc.)"
      />
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
<ImageUpload
        images={formData.images || []}
        onChange={(images) => handleChange('images', images)}
        label="Crop Images (Growth Progress, etc.)"
      />
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
<div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Status
        </label>
        <select
          value={formData.status || 'Not Started'}
          onChange={(e) => handleChange('status', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
          required
        >
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
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