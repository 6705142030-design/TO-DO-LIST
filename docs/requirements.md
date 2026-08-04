# Requirements Specification: Todo List Application

## 1. Functional Requirements

### 1.1 Task CRUD Operations

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | The system shall allow users to create a new task by providing a title (required) and an optional due date. | Must |
| FR-02 | The system shall validate that the task title is non-empty and does not exceed 255 characters. | Must |
| FR-03 | The system shall validate that the due date, if provided, is a valid ISO datetime format. | Must |
| FR-04 | The system shall allow users to retrieve a list of all tasks. | Must |
| FR-05 | The system shall allow users to filter tasks by status: `all`, `pending`, or `completed`. | Must |
| FR-06 | The system shall allow users to retrieve a single task by its unique ID. | Must |
| FR-07 | The system shall allow users to update a task's title, due date, and/or status. | Must |
| FR-08 | The system shall allow users to delete a task by its unique ID. | Must |
| FR-09 | The system shall return a `404 Not Found` response when attempting to retrieve, update, or delete a non-existent task. | Must |
| FR-10 | The system shall return a `400 Bad Request` response for invalid input data. | Must |

### 1.2 Completion Toggling

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-11 | The system shall allow users to toggle a task's status between `pending` and `completed`. | Must |
| FR-12 | The system shall visually distinguish completed tasks (strikethrough, color change) from pending tasks. | Must |
| FR-13 | The system shall update the task's `updated_at` timestamp whenever its status changes. | Must |

### 1.3 User Management Basics

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-14 | The system shall maintain a `Users` table with `id`, `name`, `email` (unique), `password` (hashed), and `created_at`. | Must |
| FR-15 | The system shall associate each task with a user via a foreign key (`user_id`). | Must |
| FR-16 | The system shall enforce a one-to-many relationship: one user can have many tasks. | Must |
| FR-17 | The system shall cascade-delete a user's tasks when the user is deleted (`ON DELETE CASCADE`). | Must |
| FR-18 | For the lab scope, the system shall use a single seeded default user for all operations. | Should |

## 2. Non-Functional Requirements

### 2.1 Performance

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-01 | API responses shall be returned within 500ms under normal load. | Should |
| NFR-02 | The database connection layer shall use connection pooling to minimize connection overhead. | Must |
| NFR-03 | The UI shall provide immediate feedback (loading states, optimistic updates) during CRUD operations. | Should |

### 2.2 Local Containerization

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-04 | The MySQL database shall run in a Docker container using the `mysql:8.0` image. | Must |
| NFR-05 | Database data shall persist across container restarts via a named Docker volume. | Must |
| NFR-06 | The database container shall include a health check using `mysqladmin ping`. | Must |
| NFR-07 | The database shall be exposed on port `3306` for local development. | Must |
| NFR-08 | The database schema shall be initialized automatically on first container startup via an init SQL script. | Must |

### 2.3 Code Maintainability

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-09 | The codebase shall use TypeScript with strict type checking. | Must |
| NFR-10 | The codebase shall follow the Next.js App Router conventions. | Must |
| NFR-11 | API route handlers shall be separated by resource and HTTP method. | Must |
| NFR-12 | Shared types shall be defined in a central `lib/types.ts` module. | Should |
| NFR-13 | The codebase shall include comprehensive documentation in the `docs/` directory. | Must |

### 2.4 Security

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-14 | All database queries shall use parameterized statements to prevent SQL injection. | Must |
| NFR-15 | User passwords shall be stored as hashed values, never in plaintext. | Must |
| NFR-16 | Sensitive configuration (database credentials) shall be stored in environment variables, not committed to source control. | Must |
| NFR-17 | API endpoints shall validate all user-supplied input server-side. | Must |
| NFR-18 | Error responses shall not leak internal implementation details. | Must |

## 3. Environment Configuration Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| ENV-01 | The project shall provide a `.env.example` file documenting all required environment variables. | Must |
| ENV-02 | The project shall support a unified `DATABASE_URL` connection string. | Must |
| ENV-03 | The project shall support individual `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, and `MYSQL_PORT` variables as fallback. | Must |
| ENV-04 | The connection layer shall be capable of switching between local Docker MySQL and remote cloud MySQL via environment configuration. | Must |