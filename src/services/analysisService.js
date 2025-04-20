import { supabase } from "../config/supabase";

export async function fetchBoardsDetails() {
  const { data, error } = await supabase.from("expense_boards").select("*");
  return data;
}

export async function fetchAnalysisData(boardId) {
  const { data, error } = await supabase
    .from("expense_boards")
    .select("*")
    .eq("id", boardId);
}
