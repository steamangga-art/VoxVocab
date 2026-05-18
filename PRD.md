You are an expert full-stack developer specializing in Next.js (App Router), Tailwind CSS, TypeScript, and modern database architectures. I want to build a web-based English Vocabulary Memorization application tailored for Vocational High School (SMK) students, named "VoxVocab".

Act as the lead engineer and generate a complete, production-ready blueprint and initial boilerplate code based on the following Updated Product Requirement Document (PRD) that includes Yearly Rollover (Naik Kelas) logic:

---

# PRODUCT REQUIREMENT DOCUMENT (PRD) - VOXVOCAB (WITH YEARLY ROLLOVER)

## 1. PROJECT OVERVIEW & GOALS
An interactive web application to help SMK students collect, memorize, and get tested on English vocabulary relevant to their specific majors using contextual learning methods.
- Core Pillars: Individual word bank collection, AI-powered semantic validation, native Text-to-Speech (TTS), multi-class analytics for teachers, dual-level leaderboard, and automated student class rollover (Naik Kelas) management.

## 2. SYSTEM ARCHITECTURE & TECH STACK
- Framework: Next.js 14+ (App Router) with TypeScript
- Styling: Tailwind CSS (Mobile-first responsive design, modern clean UI)
- Database & Auth: PostgreSQL architecture (compatible with Supabase/Prisma)
- Form Validation: React Hook Form + Zod
- AI Validation: Google Gemini API integration via Next.js Route Handlers.
- Audio: Native Web Speech API (Text-to-Speech).

## 3. USER ROLES, REGISTRATION & ROLLOVER LOGIC
- Teacher (Admin): 
  - Manually seeds the definitive list of active Classes at the beginning of each academic year.
  - Has a "Trigger New Academic Year" action that triggers a state shift for the school system.
  - Access to a Dashboard to view students' progress filtered by Class or School-wide.
- Student: 
  - Registers independently by filling out Name, NISN/Email, and selecting their specific class from a dropdown populated by the Teacher.
  - **Yearly Rollover (Naik Kelas) Handling**: When a new academic year is activated by the teacher, the student's next login triggers a mandatory profile update modal forcing them to select their new Class. Old vocabulary logs and quiz scores are dynamically archived.

## 4. DATABASE SCHEMA (RELATIONAL DESIGN WITH YEARLY FILTER)
Generate SQL DDL or Prisma schemas for:
- Classes (id, className, major, isActive [boolean])
- Users (id, name, email/nisn, password_hash, role['student'|'teacher'], classId)
- Vocabularies (id, userId, word, partOfSpeech, meaning, sentence, status['learning'|'mastered'|'archived'], academicYear [string, e.g., '2025/2026'], createdAt)
- QuizScores (id, userId, score, totalQuestions, academicYear [string], createdAt)

## 5. CORE FEATURES & LOGICAL REQUIREMENTS

### A. AI-Validated Word Input Form
- Fields: Word, Part of Speech, Meaning, Context Sentence.
- Backend Semantic Validation (AI Route Handler): Call Gemini API to check if meaning matches word and context sentence is grammatically correct. Append current system active `academicYear` before writing to database.

### B. Dual-Level Leaderboard Analytics
1. **Class Leaderboard**: Ranks top students filtered strictly by a specific `classId` and current active `academicYear`.
2. **Global Leaderboard**: Ranks top students across all classes in the current active `academicYear`.

### C. Text-to-Speech (TTS)
- Implement a simple reusable utility using `window.speechSynthesis` (en-US, rate 0.9x).

### D. Teacher: Admin Dashboard & Class Rollover Controller
- Multi-class dropdown filter selection.
- View Class Ranking vs Global School Ranking.
- Action button to manage master classes and archive records for the current term.

---

## OUTPUT EXPECTED FROM YOU (GEMINI CLI):
1. **Project Directory Layout**: Provide a clean, recommended Next.js App Router folder structure.
2. **Database Schema Configuration**: Updated Prisma schema implementation supporting yearly archiving, users, classes, vocabularies, and quiz results.
3. **The Rollover API Route**: Complete code for `app/api/user/rollover/route.ts` that handles student class self-updates when a new school year starts.
4. **The Leaderboard API Route**: Complete code for `app/api/leaderboard/route.ts` showing aggregated data filtered by `academicYear`.
5. **The AI Validator API Route**: Complete code for `app/api/validate-vocab/route.ts`.

Let's start building step by step. Generate Output #1 and #2 first, then ask me to proceed to the next parts.