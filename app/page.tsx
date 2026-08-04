"use client";

import { useCallback, useEffect, useState } from "react";
import TodoForm from "@/components/TodoForm";
import TodoItem from "@/components/TodoItem";
import type { FilterStatus, Todo } from "@/lib/types";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch todos from the API
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/todos?status=${filter}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load todos.");
      }
      const data = await res.json();
      setTodos(data.todos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load todos.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Load todos on mount and when filter changes
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Add a new todo
  async function handleAdd(title: string, dueDate: string | null) {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, due_date: dueDate }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to add task.");
    }

    await fetchTodos();
  }

  // Toggle todo status
  async function handleToggle(id: number, status: "pending" | "completed") {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update task.");
      return;
    }

    await fetchTodos();
  }

  // Delete a todo
  async function handleDelete(id: number) {
    const res = await fetch(`/api/todos/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to delete task.");
      return;
    }

    await fetchTodos();
  }

  const pendingCount = todos.filter((t) => t.status === "pending").length;
  const completedCount = todos.length - pendingCount;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Todo List
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage your tasks efficiently with a production-grade stack.
        </p>
      </header>

      {/* Add task form */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Add New Task
        </h2>
        <TodoForm onAdd={handleAdd} />
      </section>

      {/* Filter & stats */}
      <section className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(["all", "pending", "completed"] as FilterStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500">
          {pendingCount} pending · {completedCount} completed
        </p>
      </section>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Todo list */}
      <section>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : todos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-sm text-gray-500">
              {filter === "all"
                ? "No tasks yet. Add your first task above!"
                : `No ${filter} tasks.`}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}