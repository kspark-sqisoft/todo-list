"use server";

import { Database } from "types_db";
import { createServerSupabaseClient } from "utils/supabase/server";

export type TodoRow = Database["public"]["Tables"]["todo"]["Row"];
export type TodoRowInsert = Database["public"]["Tables"]["todo"]["Insert"];
export type TodoRowUpdate = Database["public"]["Tables"]["todo"]["Update"];

function handleError(error: { message?: string } | Error) {
  console.error(error);
  const message = error instanceof Error ? error.message : error.message || "Unknown error";
  throw new Error(message);
}

export async function getTodos({ searchInput = "" }): Promise<TodoRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("todo")
    .select("*")
    .like("title", `%${searchInput}%`)
    .order("created_at", { ascending: true });

  if (error) {
    handleError(error);
  }

  return data;
}

export async function createTodo(todo: TodoRowInsert) {
  const supabase = await createServerSupabaseClient();

  const insertData: TodoRowInsert = {
    ...todo,
    created_at: new Date().toISOString(),
  };

  // Type assertion needed due to Supabase type inference issue
  const { data, error } = await (supabase
    .from("todo") as any)
    .insert([insertData]);

  if (error) {
    handleError(error);
  }

  return data;
}

export async function updateTodo(todo: TodoRowUpdate) {
  const supabase = await createServerSupabaseClient();
  console.log(todo);

  const updateData: TodoRowUpdate = {
    ...todo,
    updated_at: new Date().toISOString(),
  };

  // Type assertion needed due to Supabase type inference issue
  const { data, error } = await (supabase
    .from("todo") as any)
    .update(updateData)
    .eq("id", todo.id);

  if (error) {
    handleError(error);
  }

  return data;
}

export async function deleteTodo(id: number) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.from("todo").delete().eq("id", id);

  if (error) {
    handleError(error);
  }

  return data;
}