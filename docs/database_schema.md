# Database Schema: Todo List Application

## 1. Entity-Relationship (ER) Representation

```
┌─────────────────────────────┐          ┌─────────────────────────────┐
│           Users             │          │           Todos             │
├─────────────────────────────┤          ├─────────────────────────────┤
│  id          INT (PK)       │          │  id          INT (PK)       │
│  name        VARCHAR(100)   │          │  user_id     INT (FK)       │
│  email       VARCHAR(255)   │ 1     N  │  title       VARCHAR(255)   │
│  password    VARCHAR(255)   │──────────│  status      ENUM           │
│  created_at  DATETIME       │          │  due_date    DATETIME       │
└─────────────────────────────┘          │  created_at  DATETIME       │
                                         │  updated_at  DATETIME       │
                                         └─────────────────────────────┘

Relationship: 1 User ──< N Todos
Constraint:   FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
```

## 2. Data Dictionary

### 2.1 Table: `Users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | Unique identifier for each user |
| `name` | VARCHAR(100) | NOT NULL | User's display name |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User's email address (must be unique) |
| `password` | VARCHAR(255) | NOT NULL | Hashed password (never stored in plaintext) |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp of user account creation |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE KEY (email)`

### 2.2 Table: `Todos`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | Unique identifier for each todo |
| `user_id` | INT | FOREIGN KEY → Users.id, NOT NULL | Owner of the todo (references Users) |
| `title` | VARCHAR(255) | NOT NULL | Task description/title |
| `status` | ENUM('pending', 'completed') | NOT NULL, DEFAULT 'pending' | Current completion status |
| `due_date` | DATETIME | NULL | Optional due date for the task |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp of task creation |
| `updated_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Timestamp of last modification |

**Indexes:**
- `PRIMARY KEY (id)`
- `FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE`
- `INDEX (user_id)` — for efficient queries filtering by user
- `INDEX (status)` — for efficient filtering by status

## 3. Relationship Constraints

### One-to-Many: 1 User → N Todos

- **Cardinality:** One user can own zero or many todos; each todo belongs to exactly one user.
- **Foreign Key:** `Todos.user_id` references `Users.id`.
- **Referential Action (ON DELETE CASCADE):** When a user is deleted, all of their todos are automatically deleted from the database. This ensures no orphaned records remain.
- **Referential Action (ON UPDATE):** Default `RESTRICT` behavior — a user's `id` cannot be changed while referenced by todos.

## 4. SQL DDL (Initialization Script)

```sql
-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Todos table
CREATE TABLE IF NOT EXISTS Todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    status ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
    due_date DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_todos_user FOREIGN KEY (user_id)
        REFERENCES Users(id)
        ON DELETE CASCADE,
    INDEX idx_todos_user (user_id),
    INDEX idx_todos_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 5. Seed Data

The initialization script seeds a default demo user and sample todos for immediate testing:

```sql
-- Seed default user (password: 'password123' hashed with SHA2)
INSERT INTO Users (name, email, password)
VALUES ('Demo User', 'demo@example.com', SHA2('password123', 256));

-- Seed sample todos
INSERT INTO Todos (user_id, title, status, due_date) VALUES
(1, 'Complete Lab 5 documentation', 'completed', '2026-08-05 23:59:59'),
(1, 'Set up Docker environment', 'completed', '2026-08-06 12:00:00'),
(1, 'Implement API routes', 'pending', '2026-08-07 18:00:00'),
(1, 'Build responsive UI', 'pending', '2026-08-08 09:00:00'),
(1, 'Write acceptance tests', 'pending', NULL);
```

## 6. Design Decisions

| Decision | Rationale |
|----------|-----------|
| `INT` vs `UUID` for primary keys | `INT AUTO_INCREMENT` provides compact, indexed-friendly keys ideal for lab-scale applications. UUIDs can be adopted for distributed production systems. |
| `ENUM` for status | Restricts values to `pending`/`completed` at the database level, enforcing data integrity. |
| `DATETIME` vs `TIMESTAMP` | `DATETIME` avoids timezone conversion issues and supports a wider date range. |
| `utf8mb4_unicode_ci` collation | Full Unicode support including emoji and international characters. |
| `ON DELETE CASCADE` | Automatically cleans up child records, preventing orphaned todos. |
| `updated_at` with `ON UPDATE` | Automatically tracks modification time without application-level logic. |