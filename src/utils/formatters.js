/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: 'INR')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = "INR") => {
  try {
    // Handle null, undefined, or invalid amounts
    if (!amount && amount !== 0) return "₹0.00";

    // Convert to number if string
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;

    // Format using Intl.NumberFormat
    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formatter.format(numericAmount);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return "₹0.00";
  }
};

/**
 * Format a date to a readable string
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  try {
    if (!date) return "";

    const dateObj = typeof date === "string" ? new Date(date) : date;

    return dateObj.toLocaleDateString("en-IN", {
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
 * @returns {string} Formatted number string
 */
export const formatNumber = (value) => {
  try {
    if (!value && value !== 0) return "0";

    const formatter = new Intl.NumberFormat("en-IN");
    return formatter.format(value);
  } catch (error) {
    console.error("Error formatting number:", error);
    return "0";
  }
};
