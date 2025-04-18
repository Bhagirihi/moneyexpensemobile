import { supabase } from "../config/supabase";

export const realTimeSync = {
  // Set up real-time subscriptions
  subscribeToDashboard(callback) {
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

  // Subscribe to new notifications
  subscribeToNotifications: (callback) => {
    return supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        async (payload) => {
          // Fetch full notification details when new notification arrives
          const { data: notificationDetails } = await supabase
            .from("notifications")
            .select("*")
            .eq("id", payload.new.id)
            .single();
          callback(notificationDetails);
        }
      )
      .subscribe();
  },

  // Subscribe to expense board changes
  subscribeToExpenseBoard: (callback) => {
    return supabase
      .channel("expense_boards")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expense_boards" },
        (payload) => {
          console.log("Expense change received:", payload);
          callback();
        }
      )
      .subscribe();
  },

  // Subscribe to expense changes
  subscribeToExpense: (callback) => {
    return supabase
      .channel("expenses")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        (payload) => {
          console.log("Expense change received:", payload);
          callback();
        }
      )
      .subscribe();
  },

  // Subscribe to category changes
  subscribeToCategory: (callback) => {
    return supabase
      .channel("categories")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        (payload) => {
          console.log("Category change received:", payload);
          callback();
        }
      )
      .subscribe();
  },

  subscribeToProfile: (callback) => {
    const subscription = supabase
      .channel("profile_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        (payload) => {
          console.log("Profile change received:", payload);
          callback();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },

  subscribeToVerification: (callback) => {
    return supabase
      .channel("verification")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "verification" },
        callback
      )
      .subscribe();
  },
};
