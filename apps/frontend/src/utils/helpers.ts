/**
 * @description Formats a number as a US dollar currency string.
 * @param {number} amount The number to format.
 * @returns {string} The formatted currency string (e.g., $1,234.56).
 */
export const formatCurrency = (amount: number): string => {
  if (typeof amount !== "number") {
    return "$0.00"; // Return default for invalid input
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Add other helper functions here as needed
