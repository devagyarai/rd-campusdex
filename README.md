# RD CampusDex

**RD CampusDex** is a modern, enterprise-grade Smart Campus ERP Platform designed to manage all academic activities seamlessly. Built with a focus on premium aesthetics, mobile responsiveness, and clean architecture, CampusDex offers an outstanding user experience for both students and campus authorities.

## 🚀 Features

### **Student Portal**
*   **Analytics Dashboard**: Visual insights into attendance, upcoming classes, and assignments.
*   **Attendance Tracking**: Detailed view of subject-wise attendance and history.
*   **Timetable**: Weekly schedule grouped by day with dynamic highlighting.
*   **Assignments**: View deadlines, priorities, and submit statuses (Pending, Completed, Overdue).
*   **Notes App**: Built-in rich text notes organizer with tagging and pinning.
*   **Notice Board**: Real-time campus announcements and updates.
*   **Profile Management**: Update personal information and change passwords.

### **Admin Portal**
*   **Data Dashboard**: Bird's eye view of campus metrics with beautiful charts.
*   **Student Management**: Add, edit, and search students across departments.
*   **Timetable Management**: Manage class schedules effortlessly.
*   **Attendance Entry**: Bulk attendance marking with subject/date filters.
*   **Assignment Publishing**: Create and track assignments across subjects.
*   **Notices**: Publish targeted notices with pinned priorities.

---

## 🛠️ Tech Stack

*   **Framework**: Next.js 15 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS & Framer Motion
*   **UI Components**: Lucide Icons, Shadcn-like aesthetics
*   **Database**: MySQL
*   **ORM**: Prisma
*   **Authentication**: Custom JWT with `jose` (HttpOnly Cookies & RBAC Middleware)
*   **Storage**: Cloudinary (Profile Images)
*   **Charts**: Recharts

---

## ⚙️ Local Development Setup

### 1. Prerequisites
*   Node.js 18+
*   MySQL Server (Local or Cloud)

### 2. Clone and Install
```bash
git clone <repository-url>
cd rd-campusdex
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
# Database configuration
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/campusdex"

# JWT Secret (must be at least 32 characters)
JWT_SECRET="your-super-secret-32-character-key-here"

# Cloudinary Integration (Optional but recommended for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

### 4. Database Setup
```bash
# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed database with initial data (5 admins, 50 students, and sample data)
npx tsx prisma/seed.ts
```

### 5. Run Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 🔑 Demo Credentials

Once the database is seeded, you can log in using:

**Admin Account**
*   **Email**: `admin@campusdex.com`
*   **Password**: `Admin@123`

**Student Account**
*   **Email**: `student1@campusdex.com`
*   **Password**: `Student@123`

---

## 🚢 Deployment Strategy (Vercel + Railway)

RD CampusDex is designed to be easily deployed on Vercel with a Railway MySQL database.

1.  **Database**: Create a MySQL instance on [Railway](https://railway.app/). Get the `DATABASE_URL`.
2.  **Hosting**: Import the project into [Vercel](https://vercel.com/).
3.  **Environment Variables**: Add all `.env` variables to Vercel's Environment settings.
4.  **Build Command**: Vercel will automatically run `npm run build`. Ensure `prisma generate` runs before the build (configured in `package.json`).

Enjoy a seamless, premium campus management experience!
