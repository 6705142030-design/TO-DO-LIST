export type TodoStatus = "pending" | "completed";

export interface Todo {
  id: number;
  user_id: number;
  title: string;
  status: TodoStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export type FilterStatus = "all" | TodoStatus;