import { supabase } from "../config/supabase";

export const expenseBoardService = {
  async getExpenseBoards() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // First, get all expense boards for the user
      const { data: boards, error: boardsError } = await supabase
        .from("expense_boards")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (boardsError) throw boardsError;

      // If no boards found, return empty array
      if (!boards || boards.length === 0) {
        return [];
      }

      // Get all board IDs
      const boardIds = boards.map((board) => board.id);

      // Fetch all expenses for these boards
      const { data: expenses, error: expensesError } = await supabase
        .from("expenses")
        .select("*")
        .in("board_id", boardIds);

      if (expensesError) throw expensesError;

      // Create a map of board_id to expenses
      const expensesMap = expenses.reduce((acc, expense) => {
        if (!acc[expense.board_id]) {
          acc[expense.board_id] = [];
        }
        acc[expense.board_id].push(expense);
        return acc;
      }, {});

      // Combine boards with their expenses
      const boardsWithExpenses = boards.map((board) => ({
        ...board,
        expenses: expensesMap[board.id] || [],
        totalExpenses:
          expensesMap[board.id]?.reduce(
            (sum, expense) => sum + expense.amount,
            0
          ) || 0,
        totalTransactions: expensesMap[board.id]?.length || 0,
      }));

      console.log("Boards with expenses:", boardsWithExpenses);
      return boardsWithExpenses;
    } catch (error) {
      console.error("Error fetching expense boards:", error);
      throw error;
    }
  },

  async createExpenseBoard(boardData) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("expense_boards")
        .insert([
          {
            name: boardData.name,
            description: boardData.description,
            board_color: boardData.color,
            board_icon: boardData.icon,
            created_by: user.id,
            created_at: new Date().toISOString(),
            total_budget: boardData.total_budget,
            share_code: boardData.share_code,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating expense board:", error);
      throw error;
    }
  },

  async updateExpenseBoard(id, boardData) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("expense_boards")
        .update({
          name: boardData.name,
          description: boardData.description,
          board_color: boardData.color,
          board_icon: boardData.icon,
          total_budget: boardData.total_budget,
          share_code: boardData.share_code,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("created_by", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating expense board:", error);
      throw error;
    }
  },

  async deleteExpenseBoard(id) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { error } = await supabase
        .from("expense_boards")
        .delete()
        .eq("id", id)
        .eq("created_by", user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting expense board:", error);
      throw error;
    }
  },
};
