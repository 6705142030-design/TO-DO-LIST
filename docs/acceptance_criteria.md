# Acceptance Criteria: Todo List Application

This document defines strict, testable **Given-When-Then** BDD scenarios for the core functionality of the Todo List Application.

---

## 1. Task Creation

### Scenario 1.1: Create a task with valid input

**Given** the user is on the Todo List page
**And** the database is running and accessible
**When** the user enters a valid task title "Buy groceries" in the task input field
**And** optionally selects a due date
**And** clicks the "Add Task" button
**Then** the system shall create a new task with status `pending`
**And** the system shall return HTTP status `201 Created`
**And** the new task shall appear in the task list immediately
**And** the task input field shall be cleared for the next entry

### Scenario 1.2: Attempt to create a task with an empty title

**Given** the user is on the Todo List page
**When** the user submits the form with an empty or whitespace-only title
**Then** the system shall reject the request
**And** the system shall return HTTP status `400 Bad Request`
**And** the response shall contain an error message: "Title is required and must not be blank."
**And** no new task shall be created in the database

### Scenario 1.3: Attempt to create a task with a title exceeding 255 characters

**Given** the user is on the Todo List page
**When** the user submits a task with a title longer than 255 characters
**Then** the system shall reject the request
**And** the system shall return HTTP status `400 Bad Request`
**And** the response shall contain an error message: "Title must not exceed 255 characters."
**And** no new task shall be created in the database

### Scenario 1.4: Attempt to create a task with an invalid due date

**Given** the user is on the Todo List page
**When** the user submits a task with a due date that is not a valid datetime (e.g., "not-a-date")
**Then** the system shall reject the request
**And** the system shall return HTTP status `400 Bad Request`
**And** the response shall contain an error message indicating an invalid due date format
**And** no new task shall be created in the database

### Scenario 1.5: Attempt to create a task with malformed JSON body

**Given** the user is on the Todo List page
**When** the user submits a request with a malformed JSON body
**Then** the system shall reject the request
**And** the system shall return HTTP status `400 Bad Request`
**And** the response shall contain an error message: "Invalid request body. Expected JSON."

---

## 2. Task Deletion

### Scenario 2.1: Delete an existing task

**Given** a task with title "Buy groceries" exists in the task list
**When** the user clicks the delete button on that task
**Then** the system shall delete the task from the database
**And** the system shall return HTTP status `200 OK`
**And** the response shall contain a message: "Todo deleted successfully"
**And** the task shall be removed from the task list immediately

### Scenario 2.2: Attempt to delete a non-existent task

**Given** no task with ID `9999` exists in the database
**When** the user (or API client) sends a `DELETE` request to `/api/todos/9999`
**Then** the system shall return HTTP status `404 Not Found`
**And** the response shall contain an error message: "Todo not found."
**And** no changes shall be made to the database

### Scenario 2.3: Attempt to delete a task with an invalid ID

**Given** the user (or API client) sends a `DELETE` request to `/api/todos/abc`
**When** the request is processed
**Then** the system shall return HTTP status `400 Bad Request`
**And** the response shall contain an error message: "Invalid todo ID. Must be a positive integer."

### Scenario 2.4: Verify state update after deletion

**Given** the task list contains 3 tasks
**When** the user deletes 1 task
**Then** the task list shall contain exactly 2 tasks
**And** the pending/completed counts in the UI shall update accordingly
**And** the deleted task shall no longer appear in any filter view (all, pending, completed)

---

## 3. Task Status Toggle

### Scenario 3.1: Toggle a pending task to completed

**Given** a task with title "Write report" exists with status `pending`
**When** the user clicks the toggle button on that task
**Then** the system shall update the task's status to `completed`
**And** the system shall return HTTP status `200 OK`
**And** the task shall display with strikethrough text and a green completion indicator
**And** the task's `updated_at` timestamp shall be refreshed

### Scenario 3.2: Toggle a completed task back to pending

**Given** a task with title "Write report" exists with status `completed`
**When** the user clicks the toggle button on that task
**Then** the system shall update the task's status to `pending`
**And** the system shall return HTTP status `200 OK`
**And** the task shall display normally without strikethrough
**And** the task's `updated_at` timestamp shall be refreshed

### Scenario 3.3: Attempt to set an invalid status

**Given** a task with ID `1` exists in the database
**When** the user (or API client) sends a `PATCH` request to `/api/todos/1` with body `{ "status": "in-progress" }`
**Then** the system shall reject the request
**And** the system shall return HTTP status `400 Bad Request`
**And** the response shall contain an error message: "Invalid status. Must be 'pending' or 'completed'."
**And** the task's status shall remain unchanged

### Scenario 3.4: Toggle a non-existent task

**Given** no task with ID `9999` exists in the database
**When** the user (or API client) sends a `PATCH` request to `/api/todos/9999` with body `{ "status": "completed" }`
**Then** the system shall return HTTP status `404 Not Found`
**And** the response shall contain an error message: "Todo not found."

### Scenario 3.5: Verify filter behavior after toggle

**Given** the task list contains tasks with mixed statuses
**When** the user toggles a task from `pending` to `completed` while the "Pending" filter is active
**Then** the toggled task shall disappear from the "Pending" view
**And** the toggled task shall appear in the "Completed" view
**And** the pending/completed counts in the UI shall update accordingly

---

## 4. Task Retrieval & Filtering

### Scenario 4.1: Retrieve all tasks

**Given** the database contains tasks for the default user
**When** the user (or API client) sends a `GET` request to `/api/todos`
**Then** the system shall return HTTP status `200 OK`
**And** the response shall contain a `todos` array with all tasks for the default user
**And** tasks shall be ordered by `created_at` descending (newest first)

### Scenario 4.2: Filter tasks by status

**Given** the database contains both pending and completed tasks
**When** the user (or API client) sends a `GET` request to `/api/todos?status=pending`
**Then** the system shall return HTTP status `200 OK`
**And** the response shall contain only tasks with status `pending`

**When** the user (or API client) sends a `GET` request to `/api/todos?status=completed`
**Then** the system shall return HTTP status `200 OK`
**And** the response shall contain only tasks with status `completed`

### Scenario 4.3: Attempt to filter with an invalid status

**Given** the user (or API client) sends a `GET` request to `/api/todos?status=archived`
**When** the request is processed
**Then** the system shall return HTTP status `400 Bad Request`
**And** the response shall contain an error message: "Invalid status filter. Use 'pending', 'completed', or 'all'."

### Scenario 4.4: Retrieve a single task

**Given** a task with ID `1` exists in the database
**When** the user (or API client) sends a `GET` request to `/api/todos/1`
**Then** the system shall return HTTP status `200 OK`
**And** the response shall contain the task object with all its fields

### Scenario 4.5: Retrieve a non-existent task

**Given** no task with ID `9999` exists in the database
**When** the user (or API client) sends a `GET` request to `/api/todos/9999`
**Then** the system shall return HTTP status `404 Not Found`
**And** the response shall contain an error message: "Todo not found."

---

## 5. Task Update (Title / Due Date)

### Scenario 5.1: Update a task's title

**Given** a task with ID `1` and title "Old title" exists
**When** the user (or API client) sends a `PATCH` request to `/api/todos/1` with body `{ "title": "New title" }`
**Then** the system shall update the task's title to "New title"
**And** the system shall return HTTP status `200 OK`
**And** the response shall contain the updated task object

### Scenario 5.2: Update a task's due date

**Given** a task with ID `1` exists with no due date
**When** the user (or API client) sends a `PATCH` request to `/api/todos/1` with body `{ "due_date": "2026-08-10T23:59:59" }`
**Then** the system shall set the task's due date to the provided datetime
**And** the system shall return HTTP status `200 OK`

### Scenario 5.3: Clear a task's due date

**Given** a task with ID `1` exists with a due date
**When** the user (or API client) sends a `PATCH` request to `/api/todos/1` with body `{ "due_date": null }`
**Then** the system shall clear the task's due date
**And** the system shall return HTTP status `200 OK`

### Scenario 5.4: Attempt to update with no valid fields

**Given** a task with ID `1` exists
**When** the user (or API client) sends a `PATCH` request to `/api/todos/1` with an empty body `{}`
**Then** the system shall return HTTP status `400 Bad Request`
**And** the response shall contain an error message: "No valid fields to update. Provide title, due_date, or status."