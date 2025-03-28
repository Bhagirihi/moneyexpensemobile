/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: 'INR')
 * @param {string} locale - The locale to use (default: 'en-IN')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = "INR", locale = "en-IN") => {
  try {
    // Handle null, undefined, or invalid amounts
    if (!amount && amount !== 0) return currency === "USD" ? "$0.00" : "₹0.00";

    // Convert to number if string
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;

    // Format using Intl.NumberFormat
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formatter.format(numericAmount);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return currency === "USD" ? "$0.00" : "₹0.00";
  }
};

/**
 * Format a number as compact currency (e.g., $1.2K, $1.2M)
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: 'INR')
 * @param {string} locale - The locale to use (default: 'en-IN')
 * @returns {string} Formatted compact currency string
 */
export const formatCompactCurrency = (
  amount,
  currency = "INR",
  locale = "en-IN"
) => {
  try {
    if (!amount && amount !== 0) return currency === "USD" ? "$0" : "₹0";

    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;

    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      notation: "compact",
      maximumFractionDigits: 1,
    });

    return formatter.format(numericAmount);
  } catch (error) {
    console.error("Error formatting compact currency:", error);
    return currency === "USD" ? "$0" : "₹0";
  }
};

/**
 * Parse a currency string back to a number
 * @param {string} currencyString - The formatted currency string
 * @returns {number} The parsed number
 */
export const parseCurrency = (currencyString) => {
  try {
    return parseFloat(currencyString.replace(/[^0-9.-]+/g, ""));
  } catch (error) {
    console.error("Error parsing currency:", error);
    return 0;
  }
};

/**
 * Format a date to a readable string
 * @param {Date|string} date - The date to format
 * @param {string} locale - The locale to use (default: 'en-IN')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, locale = "en-IN") => {
  try {
    if (!date) return "";

    const dateObj = typeof date === "string" ? new Date(date) : date;

    return dateObj.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

/**
 * Format a percentage
 * @param {number} value - The value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  try {
    if (!value && value !== 0) return "0%";

    const numericValue = typeof value === "string" ? parseFloat(value) : value;
    return `${numericValue.toFixed(decimals)}%`;
  } catch (error) {
    console.error("Error formatting percentage:", error);
    return "0%";
  }
};

/**
 * Format a number with thousands separators
 * @param {number} value - The number to format
 * @param {string} locale - The locale to use (default: 'en-IN')
 * @returns {string} Formatted number string
 */
export const formatNumber = (value, locale = "en-IN") => {
  try {
    if (!value && value !== 0) return "0";

    const formatter = new Intl.NumberFormat(locale);
    return formatter.format(value);
  } catch (error) {
    console.error("Error formatting number:", error);
    return "0";
  }
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
