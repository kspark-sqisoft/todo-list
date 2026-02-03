"use server";

import { QueryData } from "@supabase/supabase-js";
import { Tables, TablesInsert, TablesUpdate } from "../types_db";
import { createServerSupabaseClient } from "utils/supabase/server";

// Helper types 사용 (문서 권장 방식)
export type TodoRow = Tables<"todo">;
export type TodoRowInsert = TablesInsert<"todo">;
export type TodoRowUpdate = TablesUpdate<"todo">;

// 쿼리 결과 타입 추론
type GetTodosQuery = ReturnType<typeof getTodosQuery>;
type GetTodosResult = QueryData<GetTodosQuery>;

function getTodosQuery(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, searchInput: string) {
  return supabase
    .from("todo")
    .select("*")
    .like("title", `%${searchInput}%`)
    .order("created_at", { ascending: true });
}

function handleError(error: { message: string }): never {
  console.error(error);
  throw new Error(error.message);
}

export async function getTodos({ searchInput = "" }: { searchInput?: string }): Promise<TodoRow[]> {
  console.log("GET TODOS");
  const supabase = await createServerSupabaseClient();
  const query = getTodosQuery(supabase, searchInput);
  const { data, error } = await query;

  if (error) {
    handleError(error);
  }

  return data ?? [];
}

export async function createTodo(todo: TodoRowInsert): Promise<TodoRow[]> {
  console.log("CREATE TODO");
  const supabase = await createServerSupabaseClient();

  // created_at은 Insert 타입에 optional이므로 DB에서 자동 생성되도록 하거나,
  // 필요시에만 명시적으로 설정
  const { data, error } = await supabase
    .from("todo")
    .insert(todo)
    .select();

  if (error) {
    handleError(error);
  }

  return data ?? [];
}

export async function updateTodo(
  todo: TodoRowUpdate & { id: number }
): Promise<TodoRow[]> {
  console.log("UPDATE TODO");
  const supabase = await createServerSupabaseClient();

  const { id, ...updateData } = todo;

  const { data, error } = await supabase
    .from("todo")
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select();

  if (error) {
    handleError(error);
  }

  return data ?? [];
}

export async function deleteTodo(id: number): Promise<void> {
  console.log("DELETE TODO");
  const supabase = await createServerSupabaseClient();

  // Supabase의 모든 메서드는 { data, error } 형태를 반환합니다
  // delete()의 경우 .select()를 사용하지 않으면 data는 null입니다
  const result = await supabase.from("todo").delete().eq("id", id);
  
  // PostgrestSingleResponse<null> 타입 구조:
  // type PostgrestSingleResponse<T> = 
  //   | { error: null, data: T, count: number | null, status: number, statusText: string }  // 성공
  //   | { error: PostgrestError, data: null, count: null, status: number, statusText: string }  // 실패
  //
  // 따라서 result.error와 result.data로 접근할 수 있습니다
  // IDE에서 result.error에 마우스를 올리면 타입을 확인할 수 있습니다

  const { data, error } = result;

  if (error) {
    handleError(error);
  }

  // data는 null이지만, 명시적으로 확인하는 것이 타입 안전합니다
  // 성공적으로 삭제되었는지 확인하려면 error가 null인지 확인하면 됩니다
}

