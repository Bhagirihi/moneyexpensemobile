import { supabase } from "../config/supabase";

export const categoryService = {
  async getCategories() {
    try {
      console.log("Fetching categories...");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("No user found");
        return [];
      }

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .or(`user_id.eq.${user.id}`)

        .order("name", { ascending: true }); // Sort by category name (A-Z)

      if (error) {
        console.error("Error fetching categories:", error.message);
        throw error;
      }

      console.log("Fetched categories:", data);
      return data;
    } catch (error) {
      console.error("Error in getCategories:", error.message);
      throw error;
    }
  },
};
