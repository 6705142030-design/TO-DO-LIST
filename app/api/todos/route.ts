import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import pool from "@/lib/db";

// Default demo user ID (seeded in docker/init.sql)
const DEFAULT_USER_ID = 1;

/**
 * GET /api/todos
 * Retrieve all todos for the default user.
 * Optional query param: ?status=pending|completed|all
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = "SELECT * FROM Todos WHERE user_id = ?";
    const params: (string | number)[] = [DEFAULT_USER_ID];

    if (status && status !== "all") {
      if (status !== "pending" && status !== "completed") {
        return NextResponse.json(
          { error: "Invalid status filter. Use 'pending', 'completed', or 'all'." },
          { status: 400 }
        );
      }
      query += " AND status = ?";
      params.push(status);
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await pool.query(query, params);

    return NextResponse.json({ todos: rows }, { status: 200 });
  } catch (error) {
    console.error("GET /api/todos error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve todos" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/todos
 * Create a new todo task.
 * Body: { title: string (required), due_date?: string (ISO datetime) }
 */
export async function POST(request: NextRequest) {
  try {
    let body: { title?: string; due_date?: string };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body. Expected JSON." },
        { status: 400 }
      );
    }

    // Validate title
    const title = body.title?.trim();
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

    // Validate due_date (optional)
    let dueDate: string | null = null;
    if (body.due_date) {
      const parsed = new Date(body.due_date);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json(
          { error: "Invalid due_date format. Use ISO datetime (e.g., 2026-08-10T23:59:59)." },
          { status: 400 }
        );
      }
      dueDate = parsed.toISOString().slice(0, 19).replace("T", " ");
    }

    // Insert into database
    const [result] = await pool.query(
      "INSERT INTO Todos (user_id, title, status, due_date) VALUES (?, ?, 'pending', ?)",
      [DEFAULT_USER_ID, title, dueDate]
    );

    const insertId = (result as ResultSetHeader).insertId;

    // Fetch the created todo
    const [rows] = await pool.query("SELECT * FROM Todos WHERE id = ?", [insertId]);
    const createdTodo = (rows as any[])[0];

    return NextResponse.json({ todo: createdTodo }, { status: 201 });
  } catch (error) {
    console.error("POST /api/todos error:", error);
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}