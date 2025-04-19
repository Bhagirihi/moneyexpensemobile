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
    const { data: expenseBoard, error: boardError } = await supabase
      .from("expense_boards")
      .select("id")
      .eq("created_by", userId)
      .single();

    if (boardError) throw boardError;
    if (!expenseBoard) throw new Error("No expense board found");

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case "year":
        startDate = new Date(now.setDate(now.getDate() - 365));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 30));
    }

    // Fetch expenses grouped by date
    const { data, error } = await supabase
      .from("expenses")
      .select(
        `
        date,
        amount,
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
      .order("date", { ascending: true });

    if (error) throw error;

    // Calculate statistics
    const amounts = data.map((expense) => expense.amount);
    const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
    const highestAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
    const lowestAmount = amounts.length > 0 ? Math.min(...amounts) : 0;
    const totalCount = data.length;
    const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

    // Calculate number of days in the period
    const endDate = new Date();
    const daysInPeriod = Math.ceil(
      (endDate - startDate) / (1000 * 60 * 60 * 24)
    );
    const averageAmountPerDay =
      daysInPeriod > 0 ? totalAmount / daysInPeriod : 0;

    // Group expenses by date
    const dailyExpenses = new Map();
    data.forEach((expense) => {
      const date = new Date(expense.date).toISOString().split("T")[0];
      if (!dailyExpenses.has(date)) {
        dailyExpenses.set(date, {
          amount: 0,
          count: 0,
          categories: new Map(),
        });
      }
      const dayData = dailyExpenses.get(date);
      dayData.amount += expense.amount;
      dayData.count += 1;

      // Track category spending for each day
      const category = expense.categories;
      if (!dayData.categories.has(category.name)) {
        dayData.categories.set(category.name, {
          name: category.name,
          icon: category.icon,
          color: category.color,
          amount: 0,
        });
      }
      dayData.categories.get(category.name).amount += expense.amount;
    });

    // Convert to array format with category breakdown
    const trendData = Array.from(dailyExpenses.entries()).map(
      ([date, dayData]) => ({
        date,
        amount: dayData.amount,
        count: dayData.count,
        categories: Array.from(dayData.categories.values()),
      })
    );

    // Format the statistics object
    const statistics = {
      totalAmount: Number(totalAmount.toFixed(2)),
      highestAmount: Number(highestAmount.toFixed(2)),
      lowestAmount: Number(lowestAmount.toFixed(2)),
      totalCount,
      averageAmount: Number(averageAmount.toFixed(2)),
      averageAmountPerDay: Number(averageAmountPerDay.toFixed(2)),
      daysInPeriod,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    };

    return {
      trendData,
      statistics,
    };
  } catch (error) {
    console.error("Error in fetchExpenseTrends:", error);
    throw error;
  }
};
