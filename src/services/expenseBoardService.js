import { supabase } from "../config/supabase";

export const expenseBoardService = {
  async getExpenseBoards() {
    try {
      // 0. Get the authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user)
        throw new Error(authError?.message || "No authenticated user");
      const userId = user.id;

      // 1. Fetch boards CREATED BY the user
      const { data: ownedBoards, error: ownedBoardsError } = await supabase
        .from("expense_boards")
        .select(
          `
          *,
          profiles:created_by ( id, full_name, email_address )
        `
        )
        .eq("created_by", userId)
        .order("created_at", { ascending: false });

      if (ownedBoardsError) throw ownedBoardsError;

      // 2. Fetch boards SHARED WITH the user
      const { data: sharedBoardLinks, error: sharedError } = await supabase
        .from("shared_users")
        .select("*")
        .eq("user_id", userId)
        .eq("is_accepted", true);

      if (sharedError) throw sharedError;
      console.log("Shared Board Links:", sharedBoardLinks);

      const sharedBoardIds = sharedBoardLinks.map((link) => link.board_id);
      const sharedUserIds = sharedBoardLinks.map((link) => link.shared_by);
      console.log("sharedBoardIds", sharedBoardIds);
      console.log("sharedUserIds", sharedUserIds);

      const { data: sharedUsers, error: sharedUsersError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", sharedUserIds);

      console.log("sharedUsers", sharedUsers);

      // Fetch board details for shared boards
      const { data: sharedBoards, error: sharedBoardsError } = await supabase
        .from("expense_boards")
        .select(
          `
          *,
          profiles:created_by ( id, full_name, email_address )
        `
        )
        .eq("id", sharedBoardIds)
        .order("created_at", { ascending: false });

      if (sharedBoardsError) throw sharedBoardsError;

      console.log("sharedBoards 000", sharedBoards);

      // 3. Combine all board data (only owned and sharedBoards)
      const allBoards = [...ownedBoards, ...sharedBoards];

      if (allBoards.length === 0) return [];

      const allBoardIds = allBoards.map((board) => board.id);

      // 4. Fetch all expenses for these board IDs
      const { data: expenses, error: expensesError } = await supabase
        .from("expenses")
        .select("*")
        .in("board_id", allBoardIds);

      if (expensesError) throw expensesError;

      // 5. Map board_id → expenses
      const expensesMap = expenses.reduce((acc, expense) => {
        if (!acc[expense.board_id]) acc[expense.board_id] = [];
        acc[expense.board_id].push(expense);
        return acc;
      }, {});

      // 6. Merge board and expenses info
      const boardsWithExpenses = allBoards.map((board) => ({
        ...board,
        created_by:
          board.profiles?.full_name === user.user_metadata?.full_name
            ? "You"
            : board.profiles?.full_name || "Unknown",
        expenses: expensesMap[board.id] || [],
        totalExpenses:
          expensesMap[board.id]?.reduce((sum, exp) => sum + exp.amount, 0) || 0,
        totalTransactions: expensesMap[board.id]?.length || 0,
        isShared: board.created_by !== userId,
      }));

      return boardsWithExpenses;
    } catch (error) {
      console.error("Error fetching boards and expenses:", error.message);
      throw error;
    }
  },

  async getExpenseBoardsByID(id) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // First, get all expense boards for the user
      const { data: expenses, error: expensesBoardError } = await supabase
        .from("expenses")
        .select("*")
        .eq("board_id", id);

      const { data: expensesBoard, error: boardError } = await supabase
        .from("expense_boards")
        .select("*")
        .eq("id", id);

      const { data: sharedUsers, error: sharedUsersError } = await supabase
        .from("shared_users")
        .select("id, shared_with, shared_by")
        .eq("board_id", id)
        .eq("shared_by", user.id);

      if (expensesBoardError) throw expensesBoardError;

      // If no boards found, return empty array
      if (!expenses || expenses.length === 0) {
        return [];
      }
      let expenseBoard;

      expenseBoard = {
        // ...expensesBoard,
        //  ...board,
        participants: [],
        totalBudget: expensesBoard[0].total_budget,
        perPersonBudget: "100000" || expensesBoard[0].per_person_budget,
        totalExpenses: expenses.reduce(
          (sum, expense) => sum + expense.amount,
          0
        ),
      };
      return expenseBoard;
    } catch (error) {
      console.error("Error fetching boards:", error);
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

  async getSharedMembers() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");
      console.log("User:", user.id);

      const { data, error } = await supabase
        .from("shared_users")
        .select("*")
        .eq("shared_by", user.id);

      if (error) throw error;
      console.log("Shared members:", data);
      return data;
    } catch (error) {
      console.error("Error fetching shared members:", error);
      throw error;
    }
  },
};
