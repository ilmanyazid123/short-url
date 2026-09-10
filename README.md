# ShortURL

A modern, fast URL shortener built with Next.js 16, TypeScript, Tailwind CSS, Prisma, and shadcn/ui. Inspired by [tinyurl.com](https://tinyurl.com/).

![Stack](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8) ![Prisma](https://img.shields.io/badge/Prisma-6-2d3748)

## ✨ Features

- **One-click URL shortening** — paste any long URL, get a short one instantly
- **Custom aliases** — choose your own short code (e.g. `/r/my-link`)
- **5-second ad page** — every short link shows a 5-second interstitial ad before redirecting (with skip option)
- **Visit counter** — automatically tracks how many times each short link was opened
- **Dashboard** — view, search, copy, open, and delete all your short URLs in one place
- **Stats overview** — total links, total visits, average visits per link
- **Responsive design** — works beautifully on mobile, tablet, and desktop
- **White & blue theme** — clean, modern, professional look

## 🎨 Design

- **Background**: White (`#FFFFFF`)
- **Primary accent**: Blue (`#2563EB` / `blue-600`)
- **Typography**: Geist Sans (body) + Geist Mono (codes)
- **UI Library**: shadcn/ui (New York style)
- **Animations**: Framer Motion (hover, focus, page transitions)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or [Bun](https://bun.sh/) (recommended)
- A GitHub account

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
# Edit .env to set DATABASE_URL (default uses SQLite)

# Push database schema
bun run db:push
# or
npm run db:push

# Start dev server
bun run dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env` file in the root with:

```env
DATABASE_URL="file:./db/custom.db"
```

For production, you can use any Prisma-supported database (PostgreSQL, MySQL, etc.).

## 📂 Project Structure

```
.
├── prisma/
│   └── schema.prisma          # ShortUrl model: id, shortCode, originalUrl, title, visits, createdAt
├── src/
│   ├── app/
│   │   ├── page.tsx            # Home page: shortener form + dashboard
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Tailwind theme
│   │   ├── r/[code]/
│   │   │   ├── page.tsx        # Server-side fetch + 5s ad redirect page
│   │   │   └── redirect-client.tsx
│   │   └── api/
│   │       ├── shorten/route.ts          # POST /api/shorten
│   │       ├── urls/route.ts             # GET  /api/urls
│   │       └── url/[code]/route.ts       # GET/DELETE/PATCH /api/url/[code]
│   ├── components/ui/           # shadcn/ui components
│   └── lib/
│       ├── db.ts                # Prisma client singleton
│       └── utils.ts             # cn() helper
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

## 🔌 API Reference

### `POST /api/shorten`

Create a new short URL.

**Request body:**

```json
{
  "url": "https://example.com/very/long/path",
  "title": "Optional title",
  "customCode": "my-link" // optional, 3-30 chars [a-zA-Z0-9_-]
}
```

**Response:**

```json
{
  "id": "cm...",
  "shortCode": "my-link",
  "originalUrl": "https://example.com/very/long/path",
  "title": "Optional title",
  "visits": 0,
  "shortUrl": "/r/my-link",
  "createdAt": "2026-09-10T..."
}
```

### `GET /api/urls`

List all short URLs with aggregated stats.

**Response:**

```json
{
  "urls": [...],
  "total": 2,
  "totalVisits": 5
}
```

### `GET /api/url/[code]`

Get details for a specific short URL.

### `PATCH /api/url/[code]`

Body: `{ "incrementVisit": true }` — increments the visit counter by 1.

### `DELETE /api/url/[code]`

Delete a short URL by its code.

## 🛣️ How the redirect works

When a user opens `https://yourdomain.com/r/{code}`:

1. The server fetches the URL record from the database
2. Renders a 5-second interstitial ad page (with skip button)
3. Counts the visit (PATCH to `/api/url/[code]`)
4. After 5 seconds (or skip), the browser is redirected to the original URL

## 🧰 Tech Stack

| Layer         | Tech                                           |
| ------------- | ---------------------------------------------- |
| Framework     | Next.js 16 (App Router, Turbopack)             |
| Language      | TypeScript 5                                   |
| Styling       | Tailwind CSS 4 + shadcn/ui (New York)          |
| Database      | Prisma ORM + SQLite (dev)                      |
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

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MIT © 2026 ilmanyazid123
