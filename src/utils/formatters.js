import { useAppSettings } from "../context/AppSettingsContext";

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: null)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = null) => {
  const { currency: selectedCurrency } = useAppSettings();
  const currencyToUse = currency || selectedCurrency;

  const currencyConfig = {
    USD: { locale: "en-US", currency: "USD" },
    EUR: { locale: "en-EU", currency: "EUR" },
    GBP: { locale: "en-GB", currency: "GBP" },
    INR: { locale: "en-IN", currency: "INR" },
  };

  const config = currencyConfig[currencyToUse] || currencyConfig.USD;

  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a number as compact currency (e.g., $1.2K, $1.2M)
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: null)
 * @returns {string} Formatted compact currency string
 */
export const formatCompactCurrency = (amount, currency = null) => {
  const { currency: selectedCurrency } = useAppSettings();
  const currencyToUse = currency || selectedCurrency;

  const currencyConfig = {
    USD: { locale: "en-US", currency: "USD" },
    EUR: { locale: "en-EU", currency: "EUR" },
    GBP: { locale: "en-GB", currency: "GBP" },
    INR: { locale: "en-IN", currency: "INR" },
  };

  const config = currencyConfig[currencyToUse] || currencyConfig.USD;

  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
};

/**
 * Parse a currency string back to a number
 * @param {string} currencyString - The formatted currency string
 * @param {string} currency - The currency code (default: null)
 * @returns {number} The parsed number
 */
export const parseCurrency = (currencyString, currency = null) => {
  const { currency: selectedCurrency } = useAppSettings();
  const currencyToUse = currency || selectedCurrency;

  const currencyConfig = {
    USD: { locale: "en-US", currency: "USD" },
    EUR: { locale: "en-EU", currency: "EUR" },
    GBP: { locale: "en-GB", currency: "GBP" },
    INR: { locale: "en-IN", currency: "INR" },
  };

  const config = currencyConfig[currencyToUse] || currencyConfig.USD;

  // Remove currency symbol and any non-numeric characters except decimal point
  const cleanString = currencyString.replace(/[^0-9.-]/g, "");
  return parseFloat(cleanString);
};

/**
 * Format a date to a readable string
 * @param {Date|string} date - The date to format
 * @param {string} format - The format to use (default: 'medium')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = "medium") => {
  const { language } = useAppSettings();
  const locale = language === "en" ? "en-US" : "en-IN";

  const options = {
    short: {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
    medium: {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
    long: {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  };

  return new Intl.DateTimeFormat(locale, options[format]).format(
    new Date(date)
  );
};

/**
 * Format a percentage
 * @param {number} value - The value to format as percentage
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value) => {
  const { language } = useAppSettings();
  const locale = language === "en" ? "en-US" : "en-IN";

  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

/**
 * Format a number with thousands separators
 * @param {number} number - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
  const { language } = useAppSettings();
  const locale = language === "en" ? "en-US" : "en-IN";

  return new Intl.NumberFormat(locale).format(number);
};

export const formatDateTime = (date, locale = "en-IN") => {
  try {
    if (!date) return "";

    const dateObj = typeof date === "string" ? new Date(date) : date;

    return dateObj.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error("Error formatting date and time:", error);
    return "";
  }
};

export const formatTime = (date, locale = "en-IN") => {
  try {
    if (!date) return "";

    const dateObj = typeof date === "string" ? new Date(date) : date;

    return dateObj.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return "";
  }
};

export const formatDateRange = (startDate, endDate, locale = "en-IN") => {
  try {
    if (!startDate || !endDate) return "";

    const start =
      typeof startDate === "string" ? new Date(startDate) : startDate;
    const end = typeof endDate === "string" ? new Date(endDate) : endDate;

    const startFormatted = start.toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
    });

    const endFormatted = end.toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return `${startFormatted} - ${endFormatted}`;
  } catch (error) {
    console.error("Error formatting date range:", error);
    return "";
  }
};

export const formatRelativeTime = (date) => {
  try {
    if (!date) return "";

    const dateObj = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks}w ago`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months}mo ago`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years}y ago`;
    }
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return "";
  }
};
