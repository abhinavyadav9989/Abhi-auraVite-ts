// Centralized formatting utilities to ensure consistency across the app

export const formatCurrency = (amount, options = {}) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  
  const { 
    showDecimals = false, 
    shortForm = true, 
    currency = '₹' 
  } = options;
  
  const numAmount = Number(amount);
  
  if (shortForm) {
    if (numAmount >= 10000000) { // 1 Crore
      return `${currency}${(numAmount / 10000000).toFixed(showDecimals ? 2 : 1)}Cr`;
    } else if (numAmount >= 100000) { // 1 Lakh
      return `${currency}${(numAmount / 100000).toFixed(showDecimals ? 2 : 1)}L`;
    } else if (numAmount >= 1000) { // 1 Thousand
      return `${currency}${(numAmount / 1000).toFixed(showDecimals ? 1 : 0)}K`;
    }
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0
  }).format(numAmount);
};

export const formatDate = (date, format = 'short') => {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  const formats = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    long: { day: '2-digit', month: 'long', year: 'numeric' },
    datetime: { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  };
  
  return new Intl.DateTimeFormat('en-IN', formats[format] || formats.short)
    .format(dateObj);
};

export const formatKilometers = (kms, options = {}) => {
  if (kms === null || kms === undefined || isNaN(kms)) return '0 km';
  
  const { showUnit = true, shortForm = false } = options;
  const numKms = Number(kms);
  
  let formatted;
  if (numKms >= 100000) {
    formatted = `${(numKms / 100000).toFixed(1)}L`;
  } else if (numKms >= 1000) {
    formatted = `${(numKms / 1000).toFixed(0)}K`;
  } else {
    formatted = new Intl.NumberFormat('en-IN').format(numKms);
  }
  
  return showUnit ? `${formatted}${shortForm ? '' : ' km'}` : formatted;
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
};

export const formatRegistrationNumber = (regNo) => {
  if (!regNo) return '';
  
  // Format Indian registration numbers (e.g., KA01AB1234 -> KA 01 AB 1234)
  const cleaned = regNo.replace(/\s/g, '').toUpperCase();
  const match = cleaned.match(/^([A-Z]{2})(\d{2})([A-Z]{1,2})(\d{4})$/);
  
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
  }
  
  return regNo.toUpperCase();
};

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return '0 min';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim();
  }
  
  return `${mins}m`;
};

// Helper function to safely handle array conversion
export const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
};

// Helper function for safe property access
export const safeGet = (obj, path, defaultValue = null) => {
  if (!path) return defaultValue;
  return path.split('.').reduce((current, key) => {
    return (current && current[key] !== undefined && current[key] !== null) ? current[key] : defaultValue;
  }, obj);
};