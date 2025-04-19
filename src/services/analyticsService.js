import { supabase } from "../config/supabase";
import { formatCurrency } from "../utils/formatters";

/**
 * Fetches analytics data for a given time period
 * @param {string} userId - The ID of the current user
 * @param {string} period - The time period ('week', 'month', 'year', 'all')
 * @returns {Promise<Object>} Analytics data including total expenses, categories, and insights
 */
export const fetchAnalytics = async (userId, period) => {
  try {
    // Get the current user's expense board
    const { data: expenseBoard, error: boardError } = await supabase
      .from("expense_boards")
      .select("id")
      .eq("created_by", userId)
      .single();

    if (boardError) throw boardError;
    if (!expenseBoard) throw new Error("No expense board found");

    // Calculate date range based on selected period
    const now = new Date();
    let startDate;
    switch (period) {
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case "all":
        startDate = new Date(0); // Unix epoch
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Fetch expenses with categories
    const { data: expenses, error: expensesError } = await supabase
      .from("expenses")
      .select(
        `
        id,
        amount,
        date,
        category_id,
        categories (
          name,
          icon,
          color
        )
      `
      )
      .eq("board_id", expenseBoard.id)
      .gte("date", startDate.toISOString())
      .order("date", { ascending: false });

    if (expensesError) throw expensesError;

    // Calculate analytics
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const averageExpense =
      expenses.length > 0 ? totalExpenses / expenses.length : 0;

    // Calculate category breakdown
    const categoryMap = new Map();
    expenses.forEach((expense) => {
      const category = expense.categories;
      if (!categoryMap.has(category.name)) {
        categoryMap.set(category.name, {
          name: category.name,
          icon: category.icon,
          color: category.color,
          amount: 0,
          count: 0,
        });
      }
      const catData = categoryMap.get(category.name);
      catData.amount += expense.amount;
      catData.count += 1;
    });

    // Convert to array and calculate percentages
    const topCategories = Array.from(categoryMap.values())
      .map((cat) => ({
        ...cat,
        percentage:
          totalExpenses > 0
            ? Math.round((cat.amount / totalExpenses) * 100)
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Calculate stats
    const amounts = expenses.map((e) => e.amount);
    const stats = {
      highestSpending: amounts.length > 0 ? Math.max(...amounts) : 0,
      lowestSpending: amounts.length > 0 ? Math.min(...amounts) : 0,
      totalTransactions: expenses.length,
    };

    // Generate insights
    const insights = [];
    if (topCategories.length > 0) {
      insights.push({
        title: "Top Category",
        description: `${topCategories[0].name} is your highest spending category`,
        icon: topCategories[0].icon,
        color: topCategories[0].color,
      });
    }

    if (stats.highestSpending > 0) {
      insights.push({
        title: "Highest Expense",
        description: `Your highest expense was ${formatCurrency(
          stats.highestSpending
        )}`,
        icon: "arrow-up",
        color: "#FF6B6B",
      });
    }

    if (averageExpense > 0) {
      insights.push({
        title: "Average Expense",
        description: `You spend an average of ${formatCurrency(
          averageExpense
        )} per transaction`,
        icon: "chart-line",
        color: "#4ECDC4",
      });
    }

    return {
      totalExpenses,
      averageExpense,
      topCategories,
      insights,
      stats,
    };
  } catch (error) {
    console.error("Error in fetchAnalytics:", error);
    throw error;
  }
};

/**
 * Fetches expense trends over time with additional statistics
 * @param {string} userId - The ID of the current user
 * @param {string} period - The time period ('week', 'month', 'year')
 * @returns {Promise<Object>} Object containing trend data and statistics
 */
export const fetchExpenseTrends = async (userId, period) => {
  try {
    // Get the current user's expense board
    const { data: expenseBoard, error: boardError } = await supabase
      .from("expense_boards")
      .select("id")
      .eq("created_by", userId)
      .single();

    if (boardError) throw boardError;
    if (!expenseBoard) throw new Error("No expense board found");

    // Calculate date ranges for current and previous period
    const now = new Date();
    let startDate, endDate, previousStartDate, previousEndDate;

    switch (period) {
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - 7);
        previousEndDate = new Date(startDate);
        break;
      case "month":
        startDate = new Date(now.setDate(now.getDate() - 30));
        previousStartDate = new Date(startDate);
        previousStartDate.setMonth(previousStartDate.getMonth() - 1);
        previousEndDate = new Date(startDate);
        break;
      case "year":
        startDate = new Date(now.setDate(now.getDate() - 365));
        previousStartDate = new Date(startDate);
        previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
        previousEndDate = new Date(startDate);
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 30));
        previousStartDate = new Date(startDate);
        previousStartDate.setMonth(previousStartDate.getMonth() - 1);
        previousEndDate = new Date(startDate);
    }

    endDate = new Date();

    // Fetch current period expenses with categories
    const { data: currentData, error: currentError } = await supabase
      .from("expenses")
      .select(
        `
        amount,
        date,
        category_id,
        categories (
          name,
          icon,
          color
        )
      `
      )
      .eq("board_id", expenseBoard.id)
      .gte("date", startDate.toISOString())
      .lte("date", endDate.toISOString())
      .order("date", { ascending: true });

    if (currentError) throw currentError;

    // Fetch previous period expenses
    const { data: previousData, error: previousError } = await supabase
      .from("expenses")
      .select("amount")
      .eq("board_id", expenseBoard.id)
      .gte("date", previousStartDate.toISOString())
      .lt("date", previousEndDate.toISOString());

    if (previousError) throw previousError;

    // Calculate current period statistics
    const currentAmounts = currentData.map((expense) => expense.amount);
    const totalAmount = currentAmounts.reduce((sum, amount) => sum + amount, 0);
    const highestAmount =
      currentAmounts.length > 0 ? Math.max(...currentAmounts) : 0;
    const lowestAmount =
      currentAmounts.length > 0 ? Math.min(...currentAmounts) : 0;
    const totalCount = currentData.length;
    const daysInPeriod = Math.ceil(
      (endDate - startDate) / (1000 * 60 * 60 * 24)
    );
    const averageAmountPerDay =
      daysInPeriod > 0 ? totalAmount / daysInPeriod : 0;

    // Calculate previous period total
    const previousTotal = previousData.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // Calculate percentage change
    const percentageChange =
      previousTotal > 0
        ? ((totalAmount - previousTotal) / previousTotal) * 100
        : 0;

    // Calculate category breakdown
    const categoryMap = new Map();
    currentData.forEach((expense) => {
      const category = expense.categories;
      if (!categoryMap.has(category.name)) {
        categoryMap.set(category.name, {
          name: category.name,
          icon: category.icon,
          color: category.color,
          amount: 0,
          count: 0,
        });
      }
      const catData = categoryMap.get(category.name);
      catData.amount += expense.amount;
      catData.count += 1;
    });

    // Convert to array and calculate percentages
    const categoryBreakdown = Array.from(categoryMap.values())
      .map((cat) => ({
        ...cat,
        percentage:
          totalAmount > 0 ? Math.round((cat.amount / totalAmount) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Generate insights based on the data
    const insights = [];

    // Add trend insight
    if (percentageChange !== 0) {
      insights.push({
        title:
          percentageChange > 0 ? "Spending Increased" : "Spending Decreased",
        description: `Your spending ${
          percentageChange > 0 ? "increased" : "decreased"
        } by ${Math.abs(percentageChange).toFixed(
          1
        )}% compared to last ${period}`,
        icon: percentageChange > 0 ? "trending-up" : "trending-down",
        color: percentageChange > 0 ? "#FF6B6B" : "#4ECDC4",
      });
    }

    // Add top category insight
    if (categoryBreakdown.length > 0) {
      const topCategory = categoryBreakdown[0];
      insights.push({
        title: "Top Category",
        description: `${topCategory.name} is your highest spending category at ${topCategory.percentage}%`,
        icon: topCategory.icon,
        color: topCategory.color,
      });
    }

    // Add savings opportunity insight
    if (categoryBreakdown.length > 1) {
      const secondCategory = categoryBreakdown[1];
      insights.push({
        title: "Savings Opportunity",
        description: `Consider reducing ${secondCategory.name} expenses (${secondCategory.percentage}% of total)`,
        icon: "piggy-bank",
        color: "#45B7D1",
      });
    }

    // Format the statistics object
    const statistics = {
      totalAmount: Number(totalAmount.toFixed(2)),
      highestAmount: Number(highestAmount.toFixed(2)),
      lowestAmount: Number(lowestAmount.toFixed(2)),
      totalCount,
      averageAmountPerDay: Number(averageAmountPerDay.toFixed(2)),
      daysInPeriod,
      categoryBreakdown,
      previousPeriod: {
        totalAmount: Number(previousTotal.toFixed(2)),
        percentageChange: Number(percentageChange.toFixed(1)),
      },
    };

    return {
      trendData: [], // You can add trend data here if needed
      statistics,
      insights,
    };
  } catch (error) {
    console.error("Error in fetchExpenseTrends:", error);
    throw error;
  }
};
