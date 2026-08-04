# 📝 Todo List Application

A production-grade, lab-compliant Todo List Application built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **MySQL 8**, and **Docker Compose**.

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18.17+ (v20 recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (with Docker Compose)
- [Git](https://git-scm.com/) (optional)

### 1. Clone & Install Dependencies

```bash
git clone <your-repo-url> todo-list
cd todo-list
npm install
```

### 2. Configure Environment

Copy the example environment file and adjust values if needed:

```bash
cp .env.example .env
```

The default `.env` is pre-configured for local Docker development:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=todo_user
MYSQL_PASSWORD=todo_password
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=todo_db
DATABASE_URL=mysql://todo_user:todo_password@localhost:3306/todo_db
```

> **⚠️ Security Note:** Change all passwords before deploying to any shared or production environment.

### 3. Start MySQL with Docker Compose

```bash
docker compose up --build -d
```

This will:
- Pull `mysql:8.0` image
- Create a persistent volume (`mysql_data`) so data survives container restarts
- Run `docker/init.sql` automatically to create the `Users` and `Todos` tables and seed sample data
- Expose MySQL on `localhost:3306`

Verify the container is healthy:

```bash
docker ps --filter name=todo-mysql
```

You should see `STATUS: Up ... (healthy)`.

### 4. Start the Next.js Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing the API

The app exposes a RESTful API at `/api/todos`. You can test it with `curl`:

### List all todos

```bash
curl http://localhost:3000/api/todos
```

### Filter by status

```bash
curl "http://localhost:3000/api/todos?status=pending"
curl "http://localhost:3000/api/todos?status=completed"
```

### Create a todo

```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","due_date":"2026-08-10T10:00:00.000Z"}'
```

### Update a todo (toggle status / edit title)

```bash
curl -X PATCH http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
```

### Delete a todo

```bash
curl -X DELETE http://localhost:3000/api/todos/1
```

---

## 🗄️ Database Schema

Two primary entities with a **One-to-Many** relationship:

```
Users (1) ────< (N) Todos
```

| Table | Columns |
|-------|---------|
| `Users` | `id` (PK, INT AUTO_INCREMENT), `name`, `email` (UNIQUE), `password` (hashed), `created_at` |
| `Todos` | `id` (PK, INT AUTO_INCREMENT), `user_id` (FK → Users.id, ON DELETE CASCADE), `title`, `status` (ENUM: `pending`/`completed`), `due_date` (DATETIME), `created_at`, `updated_at` |

Full schema documentation: [`docs/database_schema.md`](docs/database_schema.md)

---

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   └── todos/
│   │       ├── route.ts          # GET (list/filter), POST (create)
│   │       └── [id]/route.ts     # PATCH (update), DELETE
│   ├── globals.css               # Tailwind CSS entry
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main UI page
├── components/
│   ├── TodoForm.tsx              # Add-task form (title + due date)
│   └── TodoItem.tsx              # Individual todo row (toggle/delete)
├── docker/
│   └── init.sql                  # Schema + seed data (auto-run on first boot)
├── docs/
│   ├── project_charter.md        # Project charter
│   ├── requirements.md           # Functional & non-functional requirements
│   ├── acceptance_criteria.md    # BDD Given-When-Then scenarios
│   └── database_schema.md        # ER diagram & data dictionary
├── lib/
│   ├── db.ts                     # MySQL connection pool (mysql2/promise)
│   └── types.ts                  # Shared TypeScript types
├── .env.example                  # Environment template
├── docker-compose.yml            # MySQL service definition
├── package.json
└── README.md
```

---

## 🛠️ Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server (port 3000) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `docker compose up -d` | Start MySQL container |
| `docker compose down` | Stop MySQL container (data persists) |
| `docker compose down -v` | Stop MySQL **and delete** the volume (⚠️ wipes data) |
| `docker logs todo-mysql` | View MySQL container logs |
| `docker exec -it todo-mysql mysql -u todo_user -ptodo_password todo_db` | Open MySQL shell |

---

## 🌐 Connecting to a Remote/Cloud MySQL

The app is **serverless-ready** — it reads `DATABASE_URL` from the environment. To point at a remote database (e.g., AWS RDS, PlanetScale, Railway), update `.env`:

```env
DATABASE_URL=mysql://username:password@your-cloud-host:3306/your_database
```

No code changes required. The connection pool in `lib/db.ts` handles both local and remote hosts automatically.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [`docs/project_charter.md`](docs/project_charter.md) | Executive summary, scope, objectives, stakeholders, architecture |
| [`docs/requirements.md`](docs/requirements.md) | Functional & non-functional requirements |
| [`docs/acceptance_criteria.md`](docs/acceptance_criteria.md) | BDD testable scenarios (Given-When-Then) |
| [`docs/database_schema.md`](docs/database_schema.md) | ER representation & data dictionary |

---

## 🧑‍💻 Tech Stack

- **Framework:** Next.js 14 (App Router, Server Components)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** MySQL 8.0
- **DB Driver:** `mysql2/promise` (connection pooling)
- **Containerization:** Docker Compose
- **Validation:** Server-side input validation in API routes

---

## 📄 License

MIT — free to use for educational and production purposes.