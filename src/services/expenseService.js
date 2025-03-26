import { supabase } from "../config/supabase";

export const expenseService = {
  async getExpenses(category = null, page = 1, limit = 10) {
    try {
      console.log("Fetching expenses from Supabase...", { page, limit });
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("No user found");
        return { data: [], total: 0, hasMore: false };
      }

      // Calculate offset
      const offset = (page - 1) * limit;

      let query = supabase
        .from("expenses")
        .select(
          `
          *,
          category:categories (
            name,
            icon,
            color
          )
        `,
          { count: "exact" }
        )
        .eq("created_by", user.id)
        .order("date", { ascending: false })
        .range(offset, offset + limit - 1);

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching expenses:", error.message);
        throw error;
      }

      // Get user profiles for all expenses
      const userIds = [...new Set(data.map((expense) => expense.created_by))];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name ")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError.message);
        throw profilesError;
      }

      // Create a map of user IDs to profiles
      const userMap = profiles.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {});

      const hasMore = offset + limit < count;
      console.log("Fetched expenses:", {
        count,
        currentPage: page,
        hasMore,
        totalItems: count,
      });

      return {
        data: data.map((expense) => ({
          ...expense,
          icon: expense.category?.icon || "receipt",
          color: expense.category?.color || "#6C5CE7",
          created_by_profile: userMap[expense.created_by] || null,
        })),
        total: count,
        hasMore,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      console.error("Error in getExpenses:", error.message);
      throw error;
    }
  },

  async getExpenseById(expenseId) {
    try {
      console.log("Fetching expense by ID:", expenseId);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("No user found");
        return null;
      }

      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          *,
          category:categories (
            name,
            icon,
            color
          )
        `
        )
        .eq("id", expenseId)
        .eq("created_by", user.id)
        .single();

      if (error) {
        console.error("Error fetching expense:", error.message);
        throw error;
      }

      // Get the creator's profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name ")
        .eq("id", data.created_by)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
        throw profileError;
      }

      console.log("Fetched expense:", data);
      return {
        ...data,
        created_by_profile: profile,
      };
    } catch (error) {
      console.error("Error in getExpenseById:", error.message);
      throw error;
    }
  },

  async createExpense(expenseData) {
    try {
      console.log("Creating expense...");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("No user found");
        throw new Error("No user found");
      }

      const { data, error } = await supabase
        .from("expenses")
        .insert([
          {
            ...expenseData,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating expense:", error.message);
        throw error;
      }

      // Get the creator's profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
        throw profileError;
      }

      console.log("Created expense:", data);
      return {
        ...data,
        created_by_profile: profile,
      };
    } catch (error) {
      console.error("Error in createExpense:", error.message);
      throw error;
    }
  },

  async updateExpense(expenseId, updates) {
    try {
      console.log("Updating expense:", expenseId);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("No user found");
        throw new Error("No user found");
      }

      const { data, error } = await supabase
        .from("expenses")
        .update(updates)
        .eq("id", expenseId)
        .eq("created_by", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating expense:", error.message);
        throw error;
      }

      // Get the creator's profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", data.created_by)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
        throw profileError;
      }

      console.log("Updated expense:", data);
      return {
        ...data,
        created_by_profile: profile,
      };
    } catch (error) {
      console.error("Error in updateExpense:", error.message);
      throw error;
    }
  },

  async deleteExpense(expenseId) {
    try {
      console.log("Deleting expense:", expenseId);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("No user found");
        throw new Error("No user found");
      }

      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId)
        .eq("created_by", user.id);

      if (error) {
        console.error("Error deleting expense:", error.message);
        throw error;
      }

      console.log("Deleted expense:", expenseId);
      return true;
    } catch (error) {
      console.error("Error in deleteExpense:", error.message);
      throw error;
    }
  },

  async getMonthlyStats() {
    try {
      console.log("Fetching monthly stats...");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("No user found");
        return {
          totalExpenses: 0,
          totalBudget: 2000,
          remainingBalance: 2000,
        };
      }

      const { data, error } = await supabase
        .from("expenses")
        .select("amount")
        .eq("created_by", user.id)
        .gte(
          "date",
          new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
          ).toISOString()
        );

      if (error) {
        console.error("Error fetching monthly stats:", error.message);
        throw error;
      }

      const totalExpenses = data.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );
      const totalBudget = 2000; // This should come from user settings
      const remainingBalance = totalBudget - totalExpenses;

      console.log("Monthly stats:", {
        totalExpenses,
        totalBudget,
        remainingBalance,
      });
      return { totalExpenses, totalBudget, remainingBalance };
    } catch (error) {
      console.error("Error in getMonthlyStats:", error.message);
      throw error;
    }
  },
};
