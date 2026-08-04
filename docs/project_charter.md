# Project Charter: Todo List Application

## Title
**Production-Grade Todo List Application**

## Executive Summary
This project delivers a full-stack Todo List Application built with Next.js (App Router, TypeScript, Tailwind CSS), MySQL, and Docker Compose. The application provides complete CRUD (Create, Read, Update, Delete) functionality for task management, including completion toggling and due-date tracking. The system is designed to be lab-compliant, serverless-ready, and containerized for local development, with a clear path to production deployment.

## Project Scope
### In Scope
- Task creation with title and optional due date
- Task listing with status filtering (all, pending, completed)
- Task status toggling (pending ↔ completed)
- Task deletion
- User management basics (single default user for lab scope)
- Local containerized MySQL database
- RESTful API with input validation
- Responsive, modern UI with Tailwind CSS

### Out of Scope
- Multi-user authentication and authorization
- Task editing (title/due date modification via UI)
- Task prioritization or categorization
- Notifications and reminders
- Mobile native applications

## Objectives
1. Implement a fully functional Todo List Application satisfying Labs 5, 6, and 7 requirements.
2. Provide comprehensive documentation for professional review.
3. Establish a structured, normalized database schema with proper relationships.
4. Build a serverless-ready database connection layer.
5. Deliver full CRUD functionality with strict server-side validation.
6. Containerize the database for reproducible local development.

## Stakeholders
| Stakeholder | Role | Interest |
|-------------|------|----------|
| Lab Instructor | Reviewer | Compliance with lab requirements, code quality |
| Development Team | Implementers | Maintainable, testable codebase |
| End Users | Consumers | Intuitive task management experience |
| DevOps | Operations | Containerization, deployment readiness |

## High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                     │
│              Next.js App Router + Tailwind              │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP (REST)
┌──────────────────────────▼──────────────────────────────┐
│                  Next.js API Routes                     │
│         /api/todos  &  /api/todos/[id]                  │
│         (GET, POST, PATCH, DELETE)                      │
└──────────────────────────┬──────────────────────────────┘
                           │ mysql2/promise (Connection Pool)
┌──────────────────────────▼──────────────────────────────┐
│                     MySQL 8.0                           │
│              Docker Container (mysql:8.0)               │
│              Persistent Volume (mysql_data)             │
└─────────────────────────────────────────────────────────┘
```

## Core Deliverables
1. **Documentation Suite** — Project charter, requirements, acceptance criteria, database schema.
2. **Docker Infrastructure** — `docker-compose.yml`, `.env` configuration, initialization SQL.
3. **Database Layer** — Serverless-ready connection pool (`lib/db.ts`).
4. **RESTful API** — Full CRUD endpoints with validation and error handling.
5. **User Interface** — Responsive Todo List UI with add, filter, toggle, and delete capabilities.

## Success Criteria
- All acceptance criteria scenarios pass (see `acceptance_criteria.md`).
- Application runs locally via `docker compose up --build`.
- Database schema matches the documented ER design.
- API endpoints return correct status codes and structured responses.
- UI provides immediate state updates on all CRUD operations.