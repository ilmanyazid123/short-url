# ShortURL

A modern, fast URL shortener built with Next.js 16, TypeScript, Tailwind CSS, Prisma (PostgreSQL), and shadcn/ui. Inspired by [tinyurl.com](https://tinyurl.com/).

![Stack](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8) ![Prisma](https://img.shields.io/badge/Prisma-6-2d3748) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)

## ✨ Features

### Public (everyone)
- **One-click URL shortening** — paste any long URL, get a short one instantly
- **Custom aliases** — choose your own short code (e.g. `/r/my-link`)
- **Optional title** — label each link for easy identification
- **5-second ad page** — every short link shows a 5-second interstitial ad before redirecting (with skip option)

### Admin Backend (login required)
- **Dashboard** with stats: total links, total visits, avg visits per link
- **Create new short URLs** from the backend
- **Searchable table** of all short links (by URL, code, or title)
- **Per-row actions**: copy, open, delete
- **Refresh button** to reload data
- **Logout button** to sign out

### Technical
- **PostgreSQL database** via Prisma ORM (Prisma Postgres compatible)
- **Cookie-based auth** with HMAC-signed session tokens (7-day expiry)
- **Middleware-protected** `/admin` routes (auto-redirect to `/login` if unauthenticated)
- **Visit counter** auto-incremented on every redirect
- **Responsive design** — mobile, tablet, desktop
- **White & blue theme** — clean, modern, professional look
- **Animations** — Framer Motion for transitions

## 🔐 Admin Login

- **URL**: `/login`
- **Username**: `admin`
- **Password**: `password123`

> Demo credentials are pre-filled on the login page. In production, override via env vars.

## 🎨 Design

- **Background**: White (`#FFFFFF`)
- **Primary accent**: Blue (`#2563EB` / `blue-600`)
- **Typography**: Geist Sans (body) + Geist Mono (codes)
- **UI Library**: shadcn/ui (New York style)
- **Animations**: Framer Motion (hover, focus, page transitions)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or [Bun](https://bun.sh/) (recommended)
- A PostgreSQL database (we use Prisma Postgres, but any Postgres works)

### Installation

```bash
# Clone the repo
git clone https://github.com/ilmanyazid123/short-url.git
cd short-url

# Install dependencies
bun install
# or
npm install

# Set up environment variables
cp .env.example .env
# Edit .env: set APP_DATABASE_URL, AUTH_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD

# Push database schema
bun run db:push
# or
npm run db:push

# Start dev server
bun run dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public shortener.
Open [http://localhost:3000/login](http://localhost:3000/login) for the admin backend.

### Environment Variables

Create a `.env` file in the root with:

```env
# PostgreSQL connection string
APP_DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"

# Auth secret (use: openssl rand -hex 32)
AUTH_SECRET="your-long-random-secret-here"

# Admin credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="password123"
```

> **Note**: We use `APP_DATABASE_URL` instead of the conventional `DATABASE_URL` to avoid conflicts with sandbox environments that pre-set `DATABASE_URL`. The Prisma schema and `src/lib/db.ts` both read from `APP_DATABASE_URL`.

## 📂 Project Structure

```
.
├── prisma/
│   └── schema.prisma              # ShortUrl model
├── src/
│   ├── app/
│   │   ├── page.tsx                # Public: shortener form + features
│   │   ├── layout.tsx              # Root layout
│   │   ├── globals.css             # Tailwind theme
│   │   ├── login/page.tsx          # Admin login page
│   │   ├── admin/page.tsx          # Protected admin dashboard (server)
│   │   ├── r/[code]/
│   │   │   ├── page.tsx            # Server fetch + 5s ad redirect page
│   │   │   └── redirect-client.tsx
│   │   └── api/
│   │       ├── shorten/route.ts            # POST /api/shorten
│   │       ├── urls/route.ts               # GET  /api/urls
│   │       ├── url/[code]/route.ts         # GET/DELETE/PATCH /api/url/[code]
│   │       └── auth/
│   │           ├── login/route.ts          # POST /api/auth/login
│   │           └── logout/route.ts         # POST /api/auth/logout
│   ├── components/
│   │   ├── admin-dashboard.tsx     # Admin dashboard client component
│   │   └── ui/                       # shadcn/ui components
│   ├── lib/
│   │   ├── db.ts                    # Prisma client singleton
│   │   ├── auth.ts                  # Session token sign/verify
│   │   └── utils.ts                 # cn() helper
│   └── hooks/
├── middleware.ts                    # Protects /admin routes
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

## 🔌 API Reference

### Public

#### `POST /api/shorten`
Create a new short URL.
```json
{
  "url": "https://example.com/very/long/path",
  "title": "Optional title",
  "customCode": "my-link"
}
```

#### `GET /api/urls`
List all short URLs with aggregated stats.

#### `GET /api/url/[code]`
Get details for a specific short URL.

#### `PATCH /api/url/[code]`
Body: `{ "incrementVisit": true }` — increments the visit counter by 1.

#### `DELETE /api/url/[code]`
Delete a short URL by its code.

### Auth

#### `POST /api/auth/login`
```json
{ "username": "admin", "password": "password123" }
```
Sets an `admin_session` httpOnly cookie (7-day expiry). Returns `{ success, redirect: "/admin" }`.

#### `POST /api/auth/logout`
Clears the session cookie.

## 🛣️ How the redirect works

When a user opens `https://yourdomain.com/r/{code}`:

1. The server fetches the URL record from PostgreSQL
2. Renders a 5-second interstitial ad page (with skip button)
3. Counts the visit (PATCH to `/api/url/[code]`)
4. After 5 seconds (or skip), the browser is redirected to the original URL

## 🧰 Tech Stack

| Layer         | Tech                                           |
| ------------- | ---------------------------------------------- |
| Framework     | Next.js 16 (App Router, Turbopack)             |
| Language      | TypeScript 5                                   |
| Styling       | Tailwind CSS 4 + shadcn/ui (New York)          |
| Database      | Prisma ORM + PostgreSQL (Prisma Postgres)      |
| Auth          | HMAC-signed cookies (no external auth dep)    |
| Animations    | Framer Motion                                  |
| Icons         | lucide-react                                  |
| Notifications | sonner                                         |

## 📝 Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `bun run dev`       | Start dev server on port 3000        |
| `bun run build`     | Build for production                 |
| `bun run start`     | Start production server              |
| `bun run lint`      | Run ESLint                           |
| `bun run db:push`   | Push Prisma schema to database       |
| `bun run db:generate` | Regenerate Prisma Client           |

## 🔒 Security Notes

- Session cookies are `httpOnly`, `sameSite=lax`, and `secure` in production
- Passwords compared with `crypto.timingSafeEqual` (timing-attack resistant)
- Session tokens are HMAC-SHA256 signed with `AUTH_SECRET`
- `/admin` routes are protected by Next.js middleware
- Demo credentials (`admin` / `password123`) should be replaced via env vars in production

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MIT © 2026 ilmanyazid123
