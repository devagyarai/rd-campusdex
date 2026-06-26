# Changelog

All notable changes to RD CampusDex will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-06-26

### Added
- **Production Ready Release**
- **Admin Dashboard**: Full management of students, faculty, timetables, and assignments.
- **Student Portal**: Access to attendance tracking, assignment submissions, notices, and personal notes.
- **Authentication**: JWT-based secure login with bcrypt password hashing.
- **Database**: Prisma ORM with normalized MySQL schema.
- **Responsive UI**: Fully responsive frontend built with TailwindCSS and Shadcn UI.
- **Role-Based Access Control (RBAC)**: Secure middleware protecting admin vs student routes.

### Changed
- Migrated codebase to Next.js 15.5.19 for enhanced stability on Vercel.
- Transitioned styling methodology to leverage pure TailwindCSS for robust performance.
- Optimized database indexing to improve high-volume query response times on Railway.

### Fixed
- Addressed deployment edge cases on Vercel edge runtime.
- Resolved Prisma client idle connection timeouts via connection baselining and seeding optimizations.
