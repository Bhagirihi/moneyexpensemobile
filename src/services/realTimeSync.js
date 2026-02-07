// import { supabase } from "../config/supabase";

// export const realTimeSync = {
//   // Set up real-time subscriptions
//   subscribeToDashboard(callback) {
//     // Subscribe to expense changes
//     const expensesSubscription = supabase
//       .channel("expenses_changes")
//       .on(
//         "postgres_changes",
//         {
//           event: "*",
//           schema: "public",
//           table: "expenses",
//         },
//         (payload) => {
//           console.log("Expense change received:", payload);
//           callback();
//         }
//       )
//       .subscribe();

//     // Subscribe to expense board changes
//     const boardsSubscription = supabase
//       .channel("boards_changes")
//       .on(
//         "postgres_changes",
//         {
//           event: "*",
//           schema: "public",
//           table: "expense_boards",
//         },
//         (payload) => {
//           console.log("Board change received:", payload);
//           callback();
//         }
//       )
//       .subscribe();

//     // Subscribe to category changes
//     const categoriesSubscription = supabase
//       .channel("categories_changes")
//       .on(
//         "postgres_changes",
//         {
//           event: "*",
//           schema: "public",
//           table: "categories",
//         },
//         (payload) => {
//           console.log("Category change received:", payload);
//           callback();
//         }
//       )
//       .subscribe();

//     // Return cleanup function
//     return () => {
//       expensesSubscription.unsubscribe();
//       boardsSubscription.unsubscribe();
//       categoriesSubscription.unsubscribe();
//     };
//   },

//   // Subscribe to new notifications
//   subscribeToNotifications: (callback) => {
//     return supabase
//       .channel("notifications")
//       .on(
//         "postgres_changes",
//         {
//           event: "INSERT",
//           schema: "public",
//           table: "notifications",
//         },
//         async (payload) => {
//           // Fetch full notification details when new notification arrives
//           const { data: notificationDetails } = await supabase
//             .from("notifications")
//             .select("*")
//             .eq("id", payload.new.id)
//             .single();
//           callback(notificationDetails);
//         }
//       )
//       .subscribe();
//   },

//   // Subscribe to expense board changes
//   subscribeToExpenseBoard: (callback) => {
//     return supabase
//       .channel("expense_boards")
//       .on(
//         "postgres_changes",
//         { event: "*", schema: "public", table: "expense_boards" },
//         (payload) => {
//           console.log("Expense change received:", payload);
//           callback();
//         }
//       )
//       .subscribe();
//   },

//   // Subscribe to expense changes
//   subscribeToExpense: (callback) => {
//     return supabase
//       .channel("expenses")
//       .on(
//         "postgres_changes",
//         { event: "*", schema: "public", table: "expenses" },
//         (payload) => {
//           console.log("Expense change received:", payload);
//           callback();
//         }
//       )
//       .subscribe();
//   },

//   // Subscribe to category changes
//   subscribeToCategory: (callback) => {
//     return supabase
//       .channel("categories")
//       .on(
//         "postgres_changes",
//         { event: "*", schema: "public", table: "categories" },
//         (payload) => {
//           console.log("Category change received:", payload);
//           callback();
//         }
//       )
//       .subscribe();
//   },

//   subscribeToProfile: (callback) => {
//     const channel = supabase
//       .channel("profile_changes")
//       .on(
//         "postgres_changes",
//         { event: "*", schema: "public", table: "profiles" },
//         (payload) => {
//           console.log("Profile change received:", payload);
//           callback();
//         }
//       );
//     // ✅ Only one subscribe per channel instance
//     // Subscribe and confirm connection
//     channel.subscribe((status) => {
//       if (status === "SUBSCRIBED") {
//         console.log("✅ Subscribed to profile changes");
//       }
//     });

//     // 🧹 Cleanup on unmount
//     return () => {
//       supabase.removeChannel(channel);
//       console.log("🧹 Unsubscribed from profile changes");
//     };
//   },

//   subscribeToVerification: (callback) => {
//     return supabase
//       .channel("verification")
//       .on(
//         "postgres_changes",
//         { event: "*", schema: "public", table: "verification" },
//         callback
//       )
//       .subscribe();
//   },
// };

import { supabase } from "../config/supabase";
import { devLog } from "../utils/logger";
import React, { useEffect } from "react";

/**
 * @param {() => void} callback - Called when any subscribed table changes
 * @param {string} [channelName] - Unique channel name. Use different names per screen to avoid "subscribe multiple times" error when multiple screens subscribe.
 */
export function realTimeSync(callback, channelName = "realtime-dashboard") {
  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "expenses" },
      callback
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "categories" },
      callback
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "expense_boards" },
      callback
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications" },
      callback
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "profiles" },
      callback
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "shared_users" },
      callback
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        devLog("✅ Subscribed to realtime");
      } else if (status === "CHANNEL_ERROR") {
        console.error("❌ Error subscribing to dashboard realtime");
      }
    });

  return () => {
    supabase.removeChannel(channel);
    devLog("🧹 Unsubscribed from all realtime updates");
  };
}

// Backward-compatible per-table subscriptions (used by ExpenseScreen, CategoriesScreen, etc.)
realTimeSync.subscribeToExpense = (callback) => {
  const channel = supabase
    .channel("realtime-expenses")
    .on("postgres_changes", { event: "*", schema: "public", table: "expenses" }, callback)
    .subscribe();
  return () => supabase.removeChannel(channel);
};

realTimeSync.subscribeToExpenseBoard = (callback) => {
  const channel = supabase
    .channel("realtime-expense-boards")
    .on("postgres_changes", { event: "*", schema: "public", table: "expense_boards" }, callback)
    .subscribe();
  return () => supabase.removeChannel(channel);
};

realTimeSync.subscribeToCategory = (callback) => {
  const channel = supabase
    .channel("realtime-categories")
    .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, callback)
    .subscribe();
  return () => supabase.removeChannel(channel);
};

realTimeSync.subscribeToNotifications = (callback) => {
  const channel = supabase
    .channel("realtime-notifications")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications" },
      async (payload) => {
        const { data } = await supabase.from("notifications").select("*").eq("id", payload.new.id).single();
        callback(data);
      }
    )
    .subscribe();
  return { unsubscribe: () => supabase.removeChannel(channel) };
};

// No "verification" table in schema; auth state is used for email verification. Return no-op cleanup.
realTimeSync.subscribeToVerification = (callback) => {
  return () => {};
};
