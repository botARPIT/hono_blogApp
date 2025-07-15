# 📝 Blog App Backend

A high-performance, minimalistic blog backend built using **Hono** (Cloudflare Workers), **TypeScript**, **PostgreSQL** (via Prisma), and **JWT authentication**. It follows a clean architecture approach, making the codebase highly modular, testable, and scalable.

---

## 🚀 Features

- 🔐 JWT-based authentication (access + refresh tokens)
- 🧾 DTOs with schema validation using Zod
- ✍️ CRUD functionality for blog posts
- 👤 User sign-up and sign-in
- 🧠 Clean architecture: Controllers, Policies, Services, Repositories
- ☁️ Deployed on Cloudflare Workers
- 🧪 Prepared for unit & integration testing
- 📦 Type-safe throughout with TypeScript

---

## 🧰 Tech Stack

| Tech              | Purpose                              |
|------------------ |--------------------------------------|
| **Hono**          | Fast web framework for Cloudflare Workers |
| **Prisma**        | Type-safe ORM for PostgreSQL          |
| **PostgreSQL**    | Primary relational database           |
| **TypeScript**    | Strong typing for safer code          |
| **Zod**           | Schema validation                     |
| **JWT**           | Authentication                        |
| **Wrangler**      | Cloudflare Workers tooling            |

---

## 📁 Folder Structure

```bash
.
├── controllers/      # Handles HTTP input/output
├── services/         # Business logic layer
├── repositories/     # Database access layer using Prisma
├── policies/         # Input validation (Zod-based)
├── types/            # DTOs, custom types, interfaces
├── lib/              # Utilities (e.g., Prisma factory)
├── middleware/       # JWT authentication middleware
├── routes/           # Hono-based route definitions
└── index.ts          # App entry point

```
## 🧪 API Endpoints
| Method | Route            | Description           | Protected  |
| ------ | ---------------- | --------------------- | ---------- |
| POST   | `/api/v1/signup` | Register new user     | ❌         |
| POST   | `/api/v1/signin` | Authenticate + tokens | ❌         |
| POST   | `/addBlog`       | Create a blog         | ✅         |
| GET    | `/blogs`         | List all blogs        | ✅         |
| GET    | `/blogs/:id`     | Get a blog by ID      | ✅         |
| PUT    | `/blogs/:id`     | Update blog by ID     | ✅         |
| DELETE | `/blogs/:id`     | Delete blog by ID     | ✅         |


## 📦 Installation & Dev Setup

# 1. Install dependencies
npm install

# 2. Start dev server (Cloudflare local)
npm run dev

# 3. Deploy to Cloudflare
npm run deploy

# 4. Generate Cloudflare bindings type support
npm run cf-typegen
When using cf-typegen, remember to update your app entry point:
const app = new Hono<{ Bindings: CloudflareBindings }>()

## 🧾 Sample Payload (Create Blog)
json
{
  "title": "The Future of TypeScript in Backend Development",
  "content": "TypeScript is becoming increasingly popular for backend development due to its static typing, strong tooling support, and growing ecosystem...",
  "thumbnail": "https://example.com/image.png",
  "authorId": "28738226-a01b-4b3c-977e-d7b3feb37e7c"
}

## 📄 License
MIT — Feel free to fork, modify, or contribute.