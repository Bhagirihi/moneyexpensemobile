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
  async getRecentTransactions(limit = 10) {
    try {
      // Step 1: Get logged-in user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Auth error:", authError?.message || "No user found");
        return;
      }

      const userId = user.id;

      // Step 2: Fetch boards owned by the user
      const { data: ownedBoards, error: ownedError } = await supabase
        .from("expense_boards")
        .select("id")
        .eq("created_by", userId);
      if (ownedError) {
        console.error("Error fetching owned boards:", ownedError.message);
        return;
      }
      console.log("ownedBoards", ownedBoards);

      // Step 3: Fetch shared boards with the user, along with the user who shared them
      const { data: sharedBoards, error: sharedError } = await supabase
        .from("shared_users")
        .select("board_id, user_id, shared_with") // Get board_id and user_id who shared the board
        .eq("user_id", userId)
        .eq("is_accepted", true); // Only accepted shared boards
      if (sharedError) {
        console.error("Error fetching shared boards:", sharedError.message);
        return;
      }
      console.log("sharedBoards", sharedBoards);
      // Step 4: Fetch user profiles for each shared user
      const userProfilePromises = sharedBoards.map((sharedBoard) => {
        return supabase
          .from("profiles")
          .select("id, email_address")
          .eq("email_address", sharedBoard.shared_with);
      });
      const userProfileResults = await Promise.all(userProfilePromises);

      // Create a map of user IDs to profiles
      const userIdArray = userProfileResults.reduce((acc, result, index) => {
        if (result.data) {
          acc.push(result.data[0].id);
        }
        return acc;
      }, []);
      userIdArray.push(userId);

      // Combine board IDs (owned + shared)
      const boardIds = [
        ...ownedBoards.map((b) => b.id),
        ...sharedBoards.map((s) => s.board_id),
      ];
      console.log("boardIds", boardIds);
      // Step 5: Fetch expenses from these boards
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
        *,
        categories (name, color, icon),
        expense_boards (name)
        `
        )
        .in("board_id", boardIds) // Filter by boards
        .in("created_by", userIdArray) // Filter by specific users
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      console.log("data WOW", data);

      // Get unique user IDs from expenses
      const userIds = [...new Set(data.map((expense) => expense.created_by))];

      // Fetch profiles for all users who created the expenses
      const profilePromises = userIds.map((userId) =>
        this.getUserProfile(userId)
      );
      const profileResults = await Promise.all(profilePromises);

      // Create a map of user IDs to profiles
      const userProfilesMap = profileResults.reduce((acc, result) => {
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
        created_by_profile: userProfilesMap[expense.created_by] || null,
      }));

      return { data: transformedTransactions, error: null };
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return { data: [], error };
    }
  },
};
