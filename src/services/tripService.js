import { supabase } from "../config/supabase";

export const tripService = {
  // Trip operations
  async getTrips() {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching trips:", error.message);
      throw error;
    }
  },

  async getTripById(id) {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching trip:", error.message);
      throw error;
    }
  },

  async createTrip(tripData) {
    try {
      const { data, error } = await supabase
        .from("trips")
        .insert([tripData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating trip:", error.message);
      throw error;
    }
  },

  async updateTrip(id, tripData) {
    try {
      const { data, error } = await supabase
        .from("trips")
        .update(tripData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating trip:", error.message);
      throw error;
    }
  },

  async deleteTrip(id) {
    try {
      const { error } = await supabase.from("trips").delete().eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting trip:", error.message);
      throw error;
    }
  },

  // Expense operations
  async getExpenses(tripId = null) {
    try {
      let query = supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });

      if (tripId) {
        query = query.eq("trip_id", tripId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching expenses:", error.message);
      throw error;
    }
  },

  async getExpenseById(id) {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching expense:", error.message);
      throw error;
    }
  },

  async createExpense(expenseData) {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .insert([expenseData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating expense:", error.message);
      throw error;
    }
  },

  async updateExpense(id, expenseData) {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .update(expenseData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating expense:", error.message);
      throw error;
    }
  },

  async deleteExpense(id) {
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting expense:", error.message);
      throw error;
    }
  },

  // Dashboard statistics
  async getDashboardStats() {
    try {
      const { data: trips, error: tripsError } = await supabase
        .from("trips")
        .select("budget");

      if (tripsError) throw tripsError;

      const { data: expenses, error: expensesError } = await supabase
        .from("expenses")
        .select("amount");

      if (expensesError) throw expensesError;

      const totalBudget = trips.reduce(
        (sum, trip) => sum + (trip.budget || 0),
        0
      );
      const totalExpenses = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      return {
        totalBudget,
        totalExpenses,
        remainingBudget: totalBudget - totalExpenses,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error.message);
      throw error;
    }
  },
};
