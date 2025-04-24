import { supabase } from "../config/supabase";

export const expenseBoardService = {
  async getExpenseBoards() {
    try {
      // Step 0: Get authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user)
        throw new Error(authError?.message || "No authenticated user");

      const userId = user.id;

      // Step 1 & 2: Fetch owned boards and shared board links in parallel
      const [ownedBoardsRes, sharedLinksRes] = await Promise.all([
        supabase
          .from("expense_boards")
          .select("*, profiles:created_by ( id, full_name, email_address )")
          .eq("created_by", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("shared_users")
          .select("*")
          .eq("user_id", userId)
          .eq("is_accepted", true),
      ]);

      if (ownedBoardsRes.error) throw ownedBoardsRes.error;
      if (sharedLinksRes.error) throw sharedLinksRes.error;

      const ownedBoards = ownedBoardsRes.data;
      const sharedBoardLinks = sharedLinksRes.data;
      const sharedBoardIds = sharedBoardLinks.map((link) => link.board_id);
      const sharedUserIds = sharedBoardLinks.map((link) => link.shared_by);

      // Step 3: Fetch shared board owners and shared board details
      const [sharedUsersRes, sharedBoardsRes] = await Promise.all([
        supabase.from("profiles").select("*").in("id", sharedUserIds),
        supabase
          .from("expense_boards")
          .select("*, profiles:created_by ( id, full_name, email_address )")
          .in("id", sharedBoardIds)
          .order("created_at", { ascending: false }),
      ]);

      if (sharedUsersRes.error) throw sharedUsersRes.error;
      if (sharedBoardsRes.error) throw sharedBoardsRes.error;

      const sharedBoards = sharedBoardsRes.data;
      const allBoards = [...ownedBoards, ...sharedBoards];

      if (allBoards.length === 0) return [];

      // Step 4: Fetch all expenses for owned + shared boards
      const boardIds = allBoards.map((b) => b.id);
      const { data: expenses, error: expensesError } = await supabase
        .from("expenses")
        .select("*")
        .in("board_id", boardIds);

      if (expensesError) throw expensesError;

      // Step 5: Group expenses by board
      const expensesMap = expenses.reduce((map, exp) => {
        if (!map[exp.board_id]) map[exp.board_id] = [];
        map[exp.board_id].push(exp);
        return map;
      }, {});

      // Step 6: Format final result
      const boardsWithExpenses = allBoards.map((board) => ({
        ...board,
        created_by:
          board.profiles?.full_name === user.user_metadata?.full_name
            ? "You"
            : board.profiles?.full_name || "Unknown",
        expenses: expensesMap[board.id] || [],
        totalExpenses:
          expensesMap[board.id]?.reduce((sum, e) => sum + e.amount, 0) || 0,
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

      // Fetch board info and expenses in parallel
      const [expensesRes, boardRes, sharedUsersRes] = await Promise.all([
        supabase.from("expenses").select("*").eq("board_id", id),
        supabase.from("expense_boards").select("*").eq("id", id),
        supabase
          .from("shared_users")
          .select("id, shared_with, shared_by")
          .eq("board_id", id)
          .eq("shared_by", user.id),
      ]);

      if (expensesRes.error || boardRes.error || sharedUsersRes.error) {
        throw expensesRes.error || boardRes.error || sharedUsersRes.error;
      }

      const expenses = expensesRes.data;
      const board = boardRes.data[0];

      if (!board) return [];

      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

      return {
        totalBudget: board.total_budget,
        perPersonBudget: board.per_person_budget || "100000", // fallback
        totalExpenses,
        participants: sharedUsersRes.data || [],
      };
    } catch (error) {
      console.error("Error fetching board by ID:", error.message);
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
