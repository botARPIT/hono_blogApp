# 📝 Blogify – Full Stack Blog Application

A performant, full-stack blogging platform powered by **Cloudflare Workers (Hono)** and **React + TypeScript**. Built with a modular architecture and modern tooling for scalability, developer efficiency, and fast performance.

---

## 🚀 Features

### ✅ Backend (Cloudflare Workers)
- 🔐 **JWT Authentication** (Access + Refresh tokens)
- 🧾 **DTO Validation with Zod**
- ✍️ **Blog CRUD** (Create, Read, Update, Delete)
- 👤 **User Sign Up & Sign In**
- 🧠 **Clean Architecture** (Controllers, Services, Repositories, Policies)
- ☁️ **Deployed on Cloudflare Workers**
- 🧪 Ready for **unit and integration testing**
- 📦 Fully typed with **TypeScript**

### 💅 Frontend (React + TailwindCSS)
- ⚛️ Built with **React + Vite + TypeScript**
- 🖌️ **TailwindCSS** for styling
- 🔐 JWT-based user authentication
- 🧑‍💻 Signup and login forms
- ✍️ Blog post creation, listing, and deletion
- 📱 Mobile-responsive and component-driven
- ⚙️ Custom hooks, loader, and avatar components

---

## 🧰 Tech Stack

| Layer     | Tools |
|-----------|-------|
| **Frontend** | React, TypeScript, Vite, TailwindCSS, React Router |
| **Backend**  | Hono (Cloudflare Workers), Prisma, PostgreSQL, Zod, JWT |
| **Dev Tools** | Wrangler, dotenv, custom hooks, modular foldering |

---

<pre> ### 📁 Folder Structure #### Backend ``` backend/ ├── controllers/ # Handles HTTP requests ├── services/ # Business logic ├── repositories/ # DB access (Prisma) ├── policies/ # Zod validations ├── middleware/ # JWT middleware ├── types/ # DTOs & interfaces ├── lib/ # Utilities (e.g., prisma client) ├── routes/ # Route definitions (Hono) └── index.ts # App entry ``` #### Frontend ``` frontend/ ├── components/ # Reusable UI components ├── pages/ # Route-based pages ├── hooks/ # Custom React hooks ├── App.tsx # App entry └── main.tsx # Main React DOM render ``` </pre>
---

## 🔌 Backend API Endpoints

| Method   | Route            | Description         | Auth |
|----------|------------------|---------------------|------|
| POST     | `/api/v1/signup` | User registration   | ❌   |
| POST     | `/api/v1/signin` | User login          | ❌   |
| POST     | `/addBlog`       | Create blog         | ✅   |
| GET      | `/blogs`         | Get all blogs       | ✅   |
| GET      | `/blogs/:id`     | Get blog by ID      | ✅   |
| PATCH    | `/blogs/:id`     | Update blog by ID   | ✅   |
| DELETE   | `/blogs/:id`     | Delete blog by ID   | ✅   |

---

## 🧪 Sample Payload (Blog Creation)

```json
{
  "title": "Exploring Edge Computing",
  "content": "Edge computing pushes computation closer to the user...",
  "thumbnail": "https://example.com/thumb.png",
  "authorId": "c0de1234-5678-abcd-9012-example"
}
⚙️ Getting Started
🔧 Backend Setup
bash
cd backend
npm install
npm run dev         # Run Cloudflare Worker locally
npm run deploy      # Deploy to Cloudflare
npm run cf-typegen  # Optional: generate type bindings

Update index.ts:
const app = new Hono<{ Bindings: CloudflareBindings }>();

💻 Frontend Setup
bash
cd frontend
npm install
npm run dev
Ensure the backend is deployed and accessible or use a .env file to configure API base URLs.



📜 License
This project is licensed under the MIT License.

