import { supabase } from "../config/supabase";

export const dashboardService = {
  // Fetch user profile
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching profile:", error.message);
      return { data: null, error };
    }
  },

  // Fetch recent transactions
  async getRecentTransactions(limit = 4) {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          *,
          categories (
            name,
            color,
            icon
          ),
          expense_boards (
            name
          )`
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      console.log("DATA", data);

      // Get unique user IDs from expenses
      const userIds = [...new Set(data.map((expense) => expense.created_by))];

      // Fetch profiles for all users
      const profilePromises = userIds.map((userId) =>
        this.getUserProfile(userId)
      );
      const profileResults = await Promise.all(profilePromises);

      // Create a map of user IDs to profiles
      const userMap = profileResults.reduce((acc, result) => {
        if (result.data) {
          acc[result.data.id] = result.data;
        }
        return acc;
      }, {});

      // Transform the data to match the expected format
      const transformedTransactions = data.map((expense) => ({
        id: expense.id,
        category: expense.categories?.name || "Uncategorized",
        amount: expense.amount,
        date: expense.created_at,
        description: expense.description,
        icon: expense.categories?.icon || "dots-horizontal",
        color: expense.categories?.color || "#45B7D1",
        board: expense.expense_boards?.name || "Default Board",
        payment_method: expense.payment_method || "Unknown",
        created_by_profile: userMap[expense.created_by] || null,
      }));

      return { data: transformedTransactions, error: null };
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return { data: [], error };
    }
  },

  // Set up real-time subscriptions
  subscribeToChanges(callback) {
    // Subscribe to expense changes
    const expensesSubscription = supabase
      .channel("expenses_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
        },
        (payload) => {
          console.log("Expense change received:", payload);
          callback();
        }
      )
      .subscribe();

    // Subscribe to expense board changes
    const boardsSubscription = supabase
      .channel("boards_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expense_boards",
        },
        (payload) => {
          console.log("Board change received:", payload);
          callback();
        }
      )
      .subscribe();

    // Subscribe to category changes
    const categoriesSubscription = supabase
      .channel("categories_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categories",
        },
        (payload) => {
          console.log("Category change received:", payload);
          callback();
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      expensesSubscription.unsubscribe();
      boardsSubscription.unsubscribe();
      categoriesSubscription.unsubscribe();
    };
  },
};
