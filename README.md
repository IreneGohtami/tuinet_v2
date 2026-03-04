## 🌟 Overview
Tuinet v2 is a modern booking management platform built for efficiency and scale. It handles complex booking workflows, passenger management, and financial tracking with a focus on data integrity and a premium user experience.

## 🛠️ Tech Stack
- **Framework**: [Next.js 15+](https://nextjs.org) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.stevenly.me/)

## 🚀 Documentation
- **[Frontend Development Guidelines](DOCS/FRONTEND_GUIDELINES.md)** - UI standards, standard CSS classes, and component patterns.

## 📁 Directory Structure
- `src/app/(dashboard)`: Main application pages and dashboard views.
- `src/app/admin`: Administrative settings (Airlines, Roles, Users, etc.).
- `src/components`: Reusable UI components and shared layouts.
- `src/lib`: Core logic, Supabase clients, RBAC, and formatting utilities.
- `scripts`: Data migration (`migrate-mssql.ts`, `migrate-settings.ts`) and maintenance scripts.
- `supabase/migrations`: Version-controlled database schema changes.

## ⚙️ Local Setup

### 1. Environment Variables
Create a `.env.local` file in the root directory and add the following:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# MSSQL Configuration (for migrations)
MSSQL_USER=your_db_user
MSSQL_PASSWORD=your_db_password
MSSQL_DATABASE=your_db_name
MSSQL_SERVER=your_db_server
```

### 2. Development Server
```bash
npm install
npm run dev
```

### 3. Running Scripts
Execute migration or maintenance scripts using `tsx`:
```bash
# Migrate settings reference data
npx tsx scripts/migrate-settings.ts

# Migrate bookings and related data
npx tsx scripts/migrate-mssql.ts
```

## 🏗️ Deployment
The project is optimized for deployment on **Vercel**. Connect your repository and ensure environment variables are configured in the Vercel dashboard.
