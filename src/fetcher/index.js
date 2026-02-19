import { dashboardService } from "../services/dashboardService";
import { devLog } from "../utils/logger";
import { expenseBoardService } from "../services/expenseBoardService";
import { showToast } from "../utils/toast";

const fetchDashboardData = async () => {
  const dashboard = {
    stats: {
      totalBudget: 0,
      totalExpenses: 0,
      remainingBudget: 0,
    },
    recentTransactions: [],
    hasBoard: 0,
  };
  try {
    const expenseBoards = await expenseBoardService.getExpenseBoards();
    dashboard.hasBoard = expenseBoards.length > 0;

    // Calculate total budget and expenses from boards
    const totalBudget = expenseBoards.reduce(
      (sum, board) => sum + (board.total_budget || 0),
      0
    );
    const totalExpenses = expenseBoards.reduce(
      (sum, board) => sum + (board.totalExpenses || 0),
      0
    );
    const remainingBudget = totalBudget - totalExpenses;

    dashboard.stats.totalBudget = totalBudget;
    dashboard.stats.totalExpenses = totalExpenses;
    dashboard.stats.remainingBudget = remainingBudget;

    // Fetch recent transactions (request enough for dashboard + buffer)
    const result = await dashboardService.getRecentTransactions(20);
    if (result.error) {
      devLog("Error fetching transactions:", result.error);
    }
    dashboard.recentTransactions = Array.isArray(result.data) ? result.data : [];
    return dashboard;
  } catch (error) {
    console.error("Error fetching dashboard data:", error.message);
    showToast.error("Failed to load dashboard data");
    return dashboard;
  }
};

export { fetchDashboardData };
