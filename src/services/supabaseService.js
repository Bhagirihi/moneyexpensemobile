import { supabase } from "../config/supabase";

// User related operations
export const userService = {
  getCurrentUser: async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      console.error("Error getting current user:", error.message);
      return { user: null, error };
    }
  },

  getProfile: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return { profile: data, error: null };
    } catch (error) {
      console.error("Error fetching profile:", error.message);
      return { profile: null, error };
    }
  },

  updateProfile: async (updates) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      return { profile: data, error: null };
    } catch (error) {
      console.error("Error updating profile:", error.message);
      return { profile: null, error };
    }
  },
};

// Categories related operations
export const categoryService = {
  getCategories: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return { categories: data, error: null };
    } catch (error) {
      console.error("Error fetching categories:", error.message);
      return { categories: null, error };
    }
  },

  createCategory: async (categoryData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("categories")
        .insert([{ ...categoryData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return { category: data, error: null };
    } catch (error) {
      console.error("Error creating category:", error.message);
      return { category: null, error };
    }
  },

  updateCategory: async (categoryId, updates) => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", categoryId)
        .select()
        .single();

      if (error) throw error;
      return { category: data, error: null };
    } catch (error) {
      console.error("Error updating category:", error.message);
      return { category: null, error };
    }
  },

  deleteCategory: async (categoryId) => {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Error deleting category:", error.message);
      return { error };
    }
  },
};

// Expense boards related operations
export const expenseBoardService = {
  getBoards: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("expense_boards")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { boards: data, error: null };
    } catch (error) {
      console.error("Error fetching boards:", error.message);
      return { boards: null, error };
    }
  },

  createBoard: async (boardData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("expense_boards")
        .insert([{ ...boardData, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;
      return { board: data, error: null };
    } catch (error) {
      console.error("Error creating board:", error.message);
      return { board: null, error };
    }
  },
};

// Expenses related operations
export const expenseService = {
  getExpenses: async (boardId) => {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          *,
          category:categories(name, icon, color),
          created_by:profiles(full_name)
        `
        )
        .eq("board_id", boardId)
        .order("date", { ascending: false });

      if (error) throw error;
      return { expenses: data, error: null };
    } catch (error) {
      console.error("Error fetching expenses:", error.message);
      return { expenses: null, error };
    }
  },

  createExpense: async (expenseData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("expenses")
        .insert([{ ...expenseData, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;
      return { expense: data, error: null };
    } catch (error) {
      console.error("Error creating expense:", error.message);
      return { expense: null, error };
    }
  },
};
