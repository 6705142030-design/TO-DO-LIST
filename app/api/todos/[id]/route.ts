import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import pool from "@/lib/db";

// Default demo user ID (seeded in docker/init.sql)
const DEFAULT_USER_ID = 1;

/**
 * Validate and parse the todo ID from the URL params.
 * Returns the numeric ID or null if invalid.
 */
function parseTodoId(id: string): number | null {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }
  return numericId;
}

/**
 * GET /api/todos/[id]
 * Retrieve a single todo by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const todoId = parseTodoId(params.id);
    if (todoId === null) {
      return NextResponse.json(
        { error: "Invalid todo ID. Must be a positive integer." },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
      "SELECT * FROM Todos WHERE id = ? AND user_id = ?",
      [todoId, DEFAULT_USER_ID]
    );

    const todo = (rows as any[])[0];
    if (!todo) {
      return NextResponse.json(
        { error: "Todo not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ todo }, { status: 200 });
  } catch (error) {
    console.error("GET /api/todos/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve todo" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/todos/[id]
 * Update a todo's title, due_date, and/or status.
 * Body: { title?: string, due_date?: string|null, status?: 'pending'|'completed' }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const todoId = parseTodoId(params.id);
    if (todoId === null) {
      return NextResponse.json(
        { error: "Invalid todo ID. Must be a positive integer." },
        { status: 400 }
      );
    }

    let body: { title?: string; due_date?: string | null; status?: string };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body. Expected JSON." },
        { status: 400 }
      );
    }

    // Verify the todo exists
    const [existingRows] = await pool.query(
      "SELECT * FROM Todos WHERE id = ? AND user_id = ?",
      [todoId, DEFAULT_USER_ID]
    );
    const existing = (existingRows as any[])[0];
    if (!existing) {
      return NextResponse.json(
        { error: "Todo not found." },
        { status: 404 }
      );
    }

    // Build dynamic update
    const updates: string[] = [];
    const updateParams: (string | number | null)[] = [];

    // Validate & update title
    if (body.title !== undefined) {
      const title = body.title.trim();
      if (!title) {
        return NextResponse.json(
          { error: "Title is required and must not be blank." },
          { status: 400 }
        );
      }
      if (title.length > 255) {
        return NextResponse.json(
          { error: "Title must not exceed 255 characters." },
          { status: 400 }
        );
      }
      updates.push("title = ?");
      updateParams.push(title);
    }

    // Validate & update due_date
    if (body.due_date !== undefined) {
      if (body.due_date === null) {
        updates.push("due_date = ?");
        updateParams.push(null);
      } else {
        const parsed = new Date(body.due_date);
        if (isNaN(parsed.getTime())) {
          return NextResponse.json(
            { error: "Invalid due_date format. Use ISO datetime (e.g., 2026-08-10T23:59:59)." },
            { status: 400 }
          );
        }
        const formatted = parsed.toISOString().slice(0, 19).replace("T", " ");
        updates.push("due_date = ?");
        updateParams.push(formatted);
      }
    }

    // Validate & update status
    if (body.status !== undefined) {
      if (body.status !== "pending" && body.status !== "completed") {
        return NextResponse.json(
          { error: "Invalid status. Must be 'pending' or 'completed'." },
          { status: 400 }
        );
      }
      updates.push("status = ?");
      updateParams.push(body.status);
    }

    // If no valid fields to update
    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update. Provide title, due_date, or status." },
        { status: 400 }
      );
    }

    // Execute update
    updateParams.push(todoId, DEFAULT_USER_ID);
    const [result] = await pool.query(
      `UPDATE Todos SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`,
      updateParams
    );

    const affectedRows = (result as ResultSetHeader).affectedRows;
    if (affectedRows === 0) {
      return NextResponse.json(
        { error: "Todo not found." },
        { status: 404 }
      );
    }

    // Fetch updated todo
    const [rows] = await pool.query(
      "SELECT * FROM Todos WHERE id = ? AND user_id = ?",
      [todoId, DEFAULT_USER_ID]
    );
    const updatedTodo = (rows as any[])[0];

    return NextResponse.json({ todo: updatedTodo }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/todos/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update todo" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/todos/[id]
 * Delete a todo by ID.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const todoId = parseTodoId(params.id);
    if (todoId === null) {
      return NextResponse.json(
        { error: "Invalid todo ID. Must be a positive integer." },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      "DELETE FROM Todos WHERE id = ? AND user_id = ?",
      [todoId, DEFAULT_USER_ID]
    );

    const affectedRows = (result as ResultSetHeader).affectedRows;
    if (affectedRows === 0) {
      return NextResponse.json(
        { error: "Todo not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Todo deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/todos/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}