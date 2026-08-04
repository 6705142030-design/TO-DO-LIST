"use client";

import type { Todo } from "@/lib/types";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number, status: "pending" | "completed") => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return "No due date";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const isCompleted = todo.status === "completed";

  return (
    <li
      className={`group flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm transition-all ${
        isCompleted ? "border-green-200 bg-green-50/50" : "border-gray-200"
      }`}
    >
      {/* Toggle status */}
      <button
        onClick={() => onToggle(todo.id, isCompleted ? "pending" : "completed")}
        aria-label={isCompleted ? "Mark as pending" : "Mark as completed"}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          isCompleted
            ? "border-green-500 bg-green-500 text-white"
            : "border-gray-300 hover:border-primary-500"
        }`}
      >
        {isCompleted && (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Task content */}
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium ${
            isCompleted ? "text-gray-400 line-through" : "text-gray-900"
          }`}
        >
          {todo.title}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          Due: {formatDueDate(todo.due_date)}
        </p>
      </div>

      {/* Status badge */}
      <span
        className={`hidden shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline-block ${
          isCompleted
            ? "bg-green-100 text-green-700"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {isCompleted ? "Completed" : "Pending"}
      </span>

      {/* Delete button */}
      <button
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete task: ${todo.title}`}
        className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/30"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </li>
  );
}