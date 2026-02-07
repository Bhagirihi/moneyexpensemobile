import { getSession, supabase } from "../config/supabase";
import { devLog } from "../utils/logger";

export const dashboardService = {
  // Fetch user profile
  async getUserProfile(userId) {
    try {
      getSession().then(async ({ session }) => {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;
        return { data, error: null };
      });
    } catch (error) {
      console.error("Error fetching profile:", error.message);
      return { data: null, error };
    }
  },

  // Fetch recent transactions
  async getRecentTransactions(limit = 10) {
    try {
      // Step 1: Get logged-in user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Auth error:", authError?.message || "No user found");
        return { data: [], error: authError };
      }

      const userId = user.id;

      // Step 2 & 3: Fetch owned and accepted shared board IDs in parallel
      const [ownedBoardsRes, sharedBoardsRes] = await Promise.all([
        supabase.from("expense_boards").select("id").eq("created_by", userId),
        supabase
          .from("shared_users")
          .select(" board_id, shared_by,user_id ")
          .eq("user_id", userId)
          .eq("is_accepted", true),
      ]);

      devLog("ownedBoardsRes", ownedBoardsRes);
      devLog("sharedBoardsRes", sharedBoardsRes);

      if (ownedBoardsRes.error || sharedBoardsRes.error) {
        console.error(
          "Error fetching boards:",
          ownedBoardsRes.error?.message || sharedBoardsRes.error?.message
        );
        return {
          data: [],
          error: ownedBoardsRes.error || sharedBoardsRes.error,
        };
      }

      const boardIds = [
        ...ownedBoardsRes.data.map((b) => b.id),
        ...sharedBoardsRes.data.map((s) => s.board_id),
      ];
      const userIds = [
        ...sharedBoardsRes.data.map((s) => s.shared_by),
        ...sharedBoardsRes.data.map((s) => s.user_id),
      ];
      devLog("userId", userIds);

      if (boardIds.length === 0) return { data: [], error: null };

      // Step 4: Fetch recent expenses only from the user's boards
      const { data: expenses, error: expensesError } = await supabase
        .from("expenses")
        .select(
          `
        *,
        categories (name, color, icon),
        expense_boards (name)
      `
        )
        .in("board_id", boardIds)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (expensesError) {
        console.error("Error fetching expenses:", expensesError.message);
        return { data: [], error: expensesError };
      }

      // Step 5: Fetch unique user profiles for expense creators
      const uniqueUserIds = [...new Set(expenses.map((e) => e.created_by))];
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email_address, avatar_url")
        .in("id", uniqueUserIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError.message);
        return { data: [], error: profilesError };
      }

      const profilesMap = profilesData.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {});

      // Step 6: Transform result
      const transformed = expenses.map((expense) => ({
        id: expense.id,
        category: expense.categories?.name || "Uncategorized",
        amount: expense.amount,
        date: expense.created_at,
        description: expense.description,
        icon: expense.categories?.icon || "dots-horizontal",
        color: expense.categories?.color || "#45B7D1",
        board: expense.expense_boards?.name || "Default Board",
        payment_method: expense.payment_method || "Unknown",
        created_by_profile: profilesMap[expense.created_by] || null,
      }));

      return { data: transformed, error: null };
    } catch (error) {
      console.error("Unexpected error:", error);
      return { data: [], error };
    }
  },
};
