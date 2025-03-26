/**
 * Formats a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = "USD") => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return `$${amount.toFixed(2)}`;
  }
};

/**
 * Formats a number as compact currency (e.g., $1.2K, $1.2M)
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: 'USD')
 * @returns {string} Formatted compact currency string
 */
export const formatCompactCurrency = (amount, currency = "USD") => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  } catch (error) {
    console.error("Error formatting compact currency:", error);
    return `$${amount.toFixed(2)}`;
  }
};

/**
 * Parses a currency string back to a number
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
