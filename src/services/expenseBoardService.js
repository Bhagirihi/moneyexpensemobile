import { supabase } from "../config/supabase";

export const expenseBoardService = {
  async getExpenseBoards() {
    try {
      console.log("Fetching expense boards from Supabase...");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("No user found");
        return [];
      }

      const { data, error } = await supabase
        .from("expense_boards")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching expense boards:", error.message);
        throw error;
      }

      console.log("Fetched expense boards:", data);
      return data;
    } catch (error) {
      console.error("Error in getExpenseBoards:", error.message);
      throw error;
    }
  },

  async createExpenseBoard(boardData) {
    try {
      console.log("Creating expense board...");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("No user found");
        throw new Error("No user found");
      }

      const { data, error } = await supabase
        .from("expense_boards")
        .insert([
          {
            ...boardData,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating expense board:", error.message);
        throw error;
      }

      console.log("Created expense board:", data);
      return data;
    } catch (error) {
      console.error("Error in createExpenseBoard:", error.message);
      throw error;
    }
  },

  async updateExpenseBoard(boardId, updates) {
    try {
      console.log("Updating expense board:", boardId);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("No user found");
        throw new Error("No user found");
      }

      const { data, error } = await supabase
        .from("expense_boards")
        .update(updates)
        .eq("id", boardId)
        .eq("created_by", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating expense board:", error.message);
        throw error;
      }

      console.log("Updated expense board:", data);
      return data;
    } catch (error) {
      console.error("Error in updateExpenseBoard:", error.message);
      throw error;
    }
  },

  async deleteExpenseBoard(boardId) {
    try {
      console.log("Deleting expense board:", boardId);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("No user found");
        throw new Error("No user found");
      }

      const { error } = await supabase
        .from("expense_boards")
        .delete()
        .eq("id", boardId)
        .eq("created_by", user.id);

      if (error) {
        console.error("Error deleting expense board:", error.message);
        throw error;
      }

      console.log("Deleted expense board:", boardId);
      return true;
    } catch (error) {
      console.error("Error in deleteExpenseBoard:", error.message);
      throw error;
    }
  },
};
